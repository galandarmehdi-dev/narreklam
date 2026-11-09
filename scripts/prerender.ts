/**
 * Post-build static generation for GitHub Pages (or any static host).
 *
 * For every public route in every language it writes dist/<route>/index.html containing:
 *   • a unique localized <title>, meta description, canonical, hreflang alternates, Open Graph, JSON-LD
 *   • real, crawlable fallback content (headings, text, internal links) inside #root
 * The React app then takes over in the browser. It also writes sitemap.xml, robots.txt and 404.html
 * (an app shell, so dynamic/DB-only URLs still work on direct navigation and refresh).
 *
 * If Supabase env vars are present, published catalog + portfolio data is fetched so newly added
 * services/projects get their own static pages; otherwise the bundled catalog is used.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { loadEnv } from 'vite';
import type { Category, L, Locale, PortfolioProject, Service, SiteSettings } from '../src/lib/types';
import { LOCALES } from '../src/lib/types';
import { paths } from '../src/lib/paths';
import { fmt } from '../src/lib/text';
import { defaultCategories, defaultServices } from '../src/content/catalog';
import { defaultFaq } from '../src/content/demo';
import { defaultSettings } from '../src/config/company';
import { CATEGORY_SELECT, PROJECT_SELECT, SERVICE_SELECT, coverOf, mapCategory, mapProject, mapService, mapSettings } from '../src/data/mappers';
import az from '../src/i18n/az';
import ru from '../src/i18n/ru';
import en from '../src/i18n/en';

const dicts = { az, ru, en };
const OG_LOCALE: Record<Locale, string> = { az: 'az_AZ', ru: 'ru_RU', en: 'en_US' };

const env = loadEnv(process.env.MODE || 'production', process.cwd(), '');
const SITE = (env.VITE_SITE_URL || '').replace(/\/+$/, '');
const DIST = join(process.cwd(), 'dist');
/** Base path prefix for internal links in the static HTML (e.g. "/narreklam" on a GitHub project site, "" on a custom domain). */
const B = ('/' + (env.VITE_BASE_PATH || '/').replace(/^\/+|\/+$/g, '')).replace(/^\/$/, '');
if (!SITE) console.warn('[prerender] VITE_SITE_URL is not set — canonical/hreflang/sitemap URLs will be relative. Set it for production builds.');

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p: string) => `${SITE}${p}`;
const pick = (v: Partial<L> | undefined | null, l: Locale) => (v?.[l] || v?.az || '') as string;

// ── Data (live if configured, otherwise bundled) ──────────────────────────
async function rest<T>(path: string): Promise<T> {
  const res = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

async function loadData() {
  let categories: Category[] = defaultCategories;
  let services: Service[] = defaultServices;
  let projects: PortfolioProject[] = [];
  let settings: SiteSettings = defaultSettings;
  if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) {
    try {
      const enc = encodeURIComponent;
      const [c, s, p, st] = await Promise.all([
        rest<Record<string, unknown>[]>(`service_categories?select=${enc(CATEGORY_SELECT)}&is_published=eq.true&order=sort_order`),
        rest<Record<string, unknown>[]>(`services?select=${enc(SERVICE_SELECT)}&is_published=eq.true&order=sort_order`),
        rest<Record<string, unknown>[]>(`portfolio_projects?select=${enc(PROJECT_SELECT)}&is_published=eq.true&is_demo=eq.false&order=sort_order`),
        rest<Record<string, unknown>[]>(`site_settings?select=*&id=eq.1`),
      ]);
      if (c.length) {
        categories = c.map(mapCategory);
        services = s.map(mapService).map((x) => ({ ...x, items: x.items.filter((i) => i.published) }));
      }
      projects = p.map(mapProject);
      settings = mapSettings(st[0] ?? null);
      console.log(`[prerender] live data: ${categories.length} categories, ${services.length} services, ${projects.length} projects`);
    } catch (e) {
      console.warn('[prerender] Supabase fetch failed, using bundled catalog:', (e as Error).message);
    }
  } else {
    console.log('[prerender] Supabase not configured — using bundled catalog.');
  }
  return { categories, services, projects, settings };
}

// ── HTML generation ───────────────────────────────────────────────────────
interface Page {
  path: (l: Locale) => string;
  title: (l: Locale) => string;
  description: (l: Locale) => string;
  body: (l: Locale) => string;
  jsonLd?: (l: Locale) => object[];
  image?: string | null;
  noindex?: boolean;
  priority?: number;
}

function navLinks(l: Locale, categories: Category[]) {
  const t = dicts[l];
  const items = [
    [paths.home(l), t.nav.home],
    [paths.services(l), t.nav.services],
    ...categories.map((c) => [paths.category(l, c.slug), pick(c.name, l)]),
    [paths.portfolio(l), t.nav.portfolio],
    [paths.about(l), t.nav.about],
    [paths.quote(l), t.nav.quote],
    [paths.contact(l), t.nav.contact],
    [paths.faq(l), t.nav.faq],
  ];
  return `<nav><ul>${items.map(([h, n]) => `<li><a href="${esc(B + h)}">${esc(n)}</a></li>`).join('')}</ul></nav>`;
}

function render(template: string, page: Page, l: Locale, categories: Category[]): string {
  const title = page.title(l);
  const desc = page.description(l).slice(0, 300);
  const url = abs(page.path(l));
  const img = page.image && /^https?:\/\//.test(page.image) ? page.image : abs('/og-image.png');
  const head = [
    `<meta name="robots" content="${page.noindex ? 'noindex, follow' : 'index, follow'}" data-prerender>`,
    `<link rel="canonical" href="${esc(url)}" data-prerender>`,
    ...LOCALES.map((x) => `<link rel="alternate" hreflang="${x}" href="${esc(abs(page.path(x)))}" data-prerender>`),
    `<link rel="alternate" hreflang="x-default" href="${esc(abs(page.path('az')))}" data-prerender>`,
    `<meta property="og:type" content="website" data-prerender>`,
    `<meta property="og:site_name" content="NarReklam" data-prerender>`,
    `<meta property="og:title" content="${esc(title)}" data-prerender>`,
    `<meta property="og:description" content="${esc(desc)}" data-prerender>`,
    `<meta property="og:url" content="${esc(url)}" data-prerender>`,
    `<meta property="og:image" content="${esc(img)}" data-prerender>`,
    `<meta property="og:locale" content="${OG_LOCALE[l]}" data-prerender>`,
    ...LOCALES.filter((x) => x !== l).map((x) => `<meta property="og:locale:alternate" content="${OG_LOCALE[x]}" data-prerender>`),
    `<meta name="twitter:card" content="summary_large_image" data-prerender>`,
    ...(page.jsonLd ? page.jsonLd(l).map((j) => `<script type="application/ld+json" data-prerender>${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`) : []),
  ].join('\n    ');

  return template
    .replace(/<html lang="[^"]*">/, `<html lang="${l}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(desc)}" data-prerender />`)
    .replace('<!--seo-->', head)
    .replace('<!--app-->', `<div class="prerender">${page.body(l)}${navLinks(l, categories)}</div>`);
}

function write(route: string, html: string) {
  const file = join(DIST, route, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

const crumbs = (items: [string, string][]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(p) })),
});

async function main() {
  const template = readFileSync(join(DIST, 'index.html'), 'utf8');
  const { categories, services, projects, settings } = await loadData();
  const catById = new Map(categories.map((c) => [c.id, c]));
  const pages: Page[] = [];
  const t = (l: Locale) => dicts[l];

  const org = (l: Locale) => {
    const o: Record<string, unknown> = { '@context': 'https://schema.org', '@type': 'Organization', name: settings.companyName, url: abs(paths.home(l)), description: t(l).seo.home.d };
    if (settings.phone) o.telephone = settings.phone;
    if (settings.email) o.email = settings.email;
    if (settings.logoUrl) o.logo = settings.logoUrl;
    const sameAs = [settings.instagram, settings.facebook, settings.linkedin, settings.youtube, settings.tiktok].filter(Boolean);
    if (sameAs.length) o.sameAs = sameAs;
    return o;
  };

  // Home
  pages.push({
    path: paths.home,
    priority: 1,
    title: (l) => t(l).seo.home.t,
    description: (l) => t(l).seo.home.d,
    jsonLd: (l) => [org(l)],
    body: (l) =>
      `<h1>${esc(t(l).home.hero.title)}</h1><p><strong>${esc(t(l).home.hero.line)}</strong></p><p>${esc(t(l).home.hero.text)}</p>` +
      `<h2>${esc(t(l).home.services.title)}</h2><ul>${categories.map((c) => `<li><a href="${B}${paths.category(l, c.slug)}">${esc(pick(c.name, l))}</a> — ${esc(pick(c.description, l))}</li>`).join('')}</ul>`,
  });

  // Services index
  pages.push({
    path: paths.services,
    priority: 0.9,
    title: (l) => t(l).seo.services.t,
    description: (l) => t(l).seo.services.d,
    jsonLd: (l) => [crumbs([[t(l).nav.home, paths.home(l)], [t(l).nav.services, paths.services(l)]])],
    body: (l) =>
      `<h1>${esc(t(l).services.title)}</h1><p>${esc(t(l).services.text)}</p>` +
      categories
        .map((c) => `<h2><a href="${B}${paths.category(l, c.slug)}">${esc(pick(c.name, l))}</a></h2><ul>${services.filter((s) => s.categoryId === c.id).map((s) => `<li><a href="${B}${paths.service(l, c.slug, s.slug)}">${esc(pick(s.title, l))}</a> — ${esc(pick(s.short, l))}</li>`).join('')}</ul>`)
        .join(''),
  });

  // Categories
  for (const c of categories) {
    const list = services.filter((s) => s.categoryId === c.id);
    pages.push({
      path: (l) => paths.category(l, c.slug),
      priority: 0.8,
      image: c.image,
      title: (l) => pick(c.seoTitle, l) || fmt(t(l).seo.categoryTitle, { title: pick(c.name, l) }),
      description: (l) => pick(c.seoDescription, l) || pick(c.description, l),
      jsonLd: (l) => [crumbs([[t(l).nav.home, paths.home(l)], [t(l).nav.services, paths.services(l)], [pick(c.name, l), paths.category(l, c.slug)]])],
      body: (l) => `<h1>${esc(pick(c.name, l))}</h1><p>${esc(pick(c.description, l))}</p><ul>${list.map((s) => `<li><a href="${B}${paths.service(l, c.slug, s.slug)}">${esc(pick(s.title, l))}</a> — ${esc(pick(s.short, l))}</li>`).join('')}</ul>`,
    });
  }

  // Services (highest-value landing pages)
  for (const s of services) {
    const c = catById.get(s.categoryId);
    if (!c) continue;
    pages.push({
      path: (l) => paths.service(l, c.slug, s.slug),
      priority: 0.9,
      image: s.image,
      title: (l) => pick(s.seoTitle, l) || fmt(t(l).seo.serviceTitle, { title: pick(s.title, l) }),
      description: (l) => pick(s.seoDescription, l) || `${pick(s.headline, l)} ${pick(s.short, l)}`,
      jsonLd: (l) => [
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: pick(s.title, l),
          serviceType: pick(c.name, l),
          description: pick(s.intro, l),
          areaServed: { '@type': 'Country', name: 'Azerbaijan' },
          provider: { '@type': 'Organization', name: settings.companyName, url: abs(paths.home(l)) },
        },
        ...(s.faq[l]?.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: s.faq[l].map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }] : []),
        crumbs([[t(l).nav.home, paths.home(l)], [t(l).nav.services, paths.services(l)], [pick(c.name, l), paths.category(l, c.slug)], [pick(s.title, l), paths.service(l, c.slug, s.slug)]]),
      ],
      body: (l) =>
        `<h1>${esc(pick(s.title, l))}</h1><p><strong>${esc(pick(s.headline, l))}</strong></p><p>${esc(pick(s.intro, l))}</p>` +
        `<h2>${esc(t(l).services.included)}</h2><ul>${s.items.map((i) => `<li>${esc(pick(i.name, l))}</li>`).join('')}</ul>` +
        (s.applications[l]?.length ? `<h2>${esc(t(l).services.applications)}</h2><ul>${s.applications[l].map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : '') +
        (s.faq[l]?.length ? `<h2>${esc(t(l).services.faq)}</h2>${s.faq[l].map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}` : '') +
        `<p><a href="${B}${paths.quote(l, s.slug)}">${esc(t(l).common.getQuote)}</a></p>`,
    });
  }

  // Portfolio
  pages.push({
    path: paths.portfolio,
    priority: 0.8,
    title: (l) => t(l).seo.portfolio.t,
    description: (l) => t(l).seo.portfolio.d,
    body: (l) =>
      `<h1>${esc(t(l).portfolio.title)}</h1><p>${esc(t(l).portfolio.text)}</p>` +
      (projects.length ? `<ul>${projects.map((p) => `<li><a href="${B}${paths.project(l, p.slug)}">${esc(pick(p.title, l))}</a> — ${esc(pick(p.summary, l))}</li>`).join('')}</ul>` : `<p>${esc(t(l).portfolio.empty)}</p>`),
  });
  for (const p of projects) {
    const cover = coverOf(p);
    pages.push({
      path: (l) => paths.project(l, p.slug),
      priority: 0.7,
      image: cover?.url,
      title: (l) => `${pick(p.title, l)} — ${t(l).nav.portfolio}${t(l).meta.titleSuffix}`,
      description: (l) => pick(p.summary, l) || pick(p.description, l).slice(0, 160),
      jsonLd: (l) => [{ '@context': 'https://schema.org', '@type': 'CreativeWork', name: pick(p.title, l), description: pick(p.summary, l), image: p.images.map((i) => i.url) }],
      body: (l) =>
        `<h1>${esc(pick(p.title, l))}</h1><p>${esc(pick(p.summary, l))}</p><p>${esc(pick(p.description, l))}</p>` +
        p.images.slice(0, 6).map((i) => `<img src="${esc(i.url)}" alt="${esc(pick(i.alt, l) || pick(p.title, l))}" loading="lazy" width="600">`).join(''),
    });
  }

  // Static pages
  const simple = (key: 'about' | 'quote' | 'contact' | 'faq' | 'privacy' | 'cookies', path: (l: Locale) => string, body: (l: Locale) => string, priority = 0.6) =>
    pages.push({ path, priority, title: (l) => t(l).seo[key].t, description: (l) => t(l).seo[key].d, body });
  simple('about', paths.about, (l) => `<h1>${esc(t(l).about.title)}</h1><p>${esc(t(l).about.lead)}</p>${t(l).about.body.map((p) => `<p>${esc(p)}</p>`).join('')}`, 0.7);
  simple('quote', (l) => paths.quote(l), (l) => `<h1>${esc(t(l).quote.title)}</h1><p>${esc(t(l).quote.text)}</p>`, 0.8);
  simple('contact', paths.contact, (l) => `<h1>${esc(t(l).contact.title)}</h1><p>${esc(t(l).contact.text)}</p>`, 0.7);
  pages.push({
    path: paths.faq,
    priority: 0.6,
    title: (l) => t(l).seo.faq.t,
    description: (l) => t(l).seo.faq.d,
    jsonLd: (l) => [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: defaultFaq.map((f) => ({ '@type': 'Question', name: f.question[l], acceptedAnswer: { '@type': 'Answer', text: f.answer[l] } })) }],
    body: (l) => `<h1>${esc(t(l).faq.title)}</h1>${defaultFaq.map((f) => `<h2>${esc(f.question[l])}</h2><p>${esc(f.answer[l])}</p>`).join('')}`,
  });
  simple('privacy', paths.privacy, (l) => `<h1>${esc(t(l).legal.privacyTitle)}</h1>${t(l).legal.privacy.map((s) => `<h2>${esc(s.h)}</h2><p>${esc(s.p)}</p>`).join('')}`, 0.2);
  simple('cookies', paths.cookies, (l) => `<h1>${esc(t(l).legal.cookiesTitle)}</h1>${t(l).legal.cookies.map((s) => `<h2>${esc(s.h)}</h2><p>${esc(s.p)}</p>`).join('')}`, 0.2);
  pages.push({ path: (l) => paths.search(l), noindex: true, title: (l) => t(l).seo.search.t, description: (l) => t(l).seo.search.d, body: (l) => `<h1>${esc(t(l).search.title)}</h1>` });

  // Write pages
  let count = 0;
  for (const page of pages) {
    for (const l of LOCALES) {
      write(page.path(l).split('?')[0], render(template, page, l, categories));
      count++;
    }
  }

  // Root: language entry point (app redirects to the saved/default language).
  const rootPage: Page = { ...pages[0], path: () => paths.home('az') };
  writeFileSync(join(DIST, 'index.html'), render(template, rootPage, 'az', categories));

  // Admin + 404 shells (never indexed).
  const shell = template.replace('<!--seo-->', '<meta name="robots" content="noindex, nofollow">').replace('<!--app-->', '');
  write('/admin/', shell.replace(/<title>[\s\S]*?<\/title>/, '<title>Admin — NarReklam</title>'));
  writeFileSync(join(DIST, '404.html'), shell);

  // Sitemap with hreflang alternates
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages
    .filter((p) => !p.noindex)
    .flatMap((p) =>
      LOCALES.map(
        (l) =>
          `  <url>\n    <loc>${esc(abs(p.path(l)))}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${(p.priority ?? 0.5).toFixed(1)}</priority>\n${LOCALES.map((x) => `    <xhtml:link rel="alternate" hreflang="${x}" href="${esc(abs(p.path(x)))}"/>`).join('\n')}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(abs(p.path('az')))}"/>\n  </url>`,
      ),
    );
  writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`);
  writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: ${new URL(abs('/admin/'), 'http://x').pathname}\n\nSitemap: ${abs('/sitemap.xml')}\n`);

  console.log(`[prerender] wrote ${count} pages (+ root, admin, 404), sitemap with ${urls.length} URLs.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
