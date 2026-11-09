import { useEffect } from 'react';
import type { Locale } from './types';
import { LOCALES } from './types';
import { env } from '@/config/env';
import { LOCALE_META } from '@/i18n';

export interface SeoInput {
  title: string;
  description: string;
  lang: Locale;
  /** Locale-independent builder for this page's path, e.g. (l) => `/${l}/services/` */
  path?: (l: Locale) => string;
  image?: string | null;
  type?: 'website' | 'article';
  noindex?: boolean;
  jsonLd?: object | object[];
}

export const absUrl = (p: string) => `${env.siteUrl}${p}`;

/** Updates <head> on client-side navigation. The same tags are emitted at build time by scripts/prerender.ts. */
export function useSeo(s: SeoInput) {
  const jsonLdKey = JSON.stringify(s.jsonLd ?? null);
  useEffect(() => {
    document.title = s.title;
    document.documentElement.lang = LOCALE_META[s.lang].htmlLang;
    const head = document.head;
    head.querySelectorAll('[data-seo]').forEach((n) => n.remove());
    // Also drop the prerendered tags for the page we navigated away from.
    head.querySelectorAll('[data-prerender]').forEach((n) => n.remove());

    const add = (tag: string, attrs: Record<string, string>) => {
      const el = document.createElement(tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      el.setAttribute('data-seo', '');
      head.appendChild(el);
      return el;
    };
    add('meta', { name: 'description', content: s.description });
    add('meta', { name: 'robots', content: s.noindex ? 'noindex, nofollow' : 'index, follow' });
    add('meta', { property: 'og:title', content: s.title });
    add('meta', { property: 'og:description', content: s.description });
    add('meta', { property: 'og:type', content: s.type || 'website' });
    add('meta', { property: 'og:locale', content: LOCALE_META[s.lang].ogLocale });
    add('meta', { name: 'twitter:card', content: 'summary_large_image' });
    const img = s.image && !s.image.startsWith('data:') ? s.image : absUrl('/og-image.png');
    add('meta', { property: 'og:image', content: img.startsWith('http') ? img : absUrl(img) });
    if (s.path && env.siteUrl) {
      const url = absUrl(s.path(s.lang));
      add('link', { rel: 'canonical', href: url });
      add('meta', { property: 'og:url', content: url });
      for (const l of LOCALES) add('link', { rel: 'alternate', hreflang: l, href: absUrl(s.path(l)) });
      add('link', { rel: 'alternate', hreflang: 'x-default', href: absUrl(s.path('az')) });
    }
    if (s.jsonLd) {
      const el = add('script', { type: 'application/ld+json' });
      el.textContent = JSON.stringify(s.jsonLd);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.title, s.description, s.lang, s.image, s.noindex, s.type, jsonLdKey, s.path?.(s.lang)]);
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absUrl(it.url) })),
  };
}

import type { SiteSettings } from './types';

/** Organization + WebSite structured data (only includes contact data that is actually configured). */
export function organizationLd(s: SiteSettings, lang: Locale, description: string) {
  const sameAs = [s.instagram, s.facebook, s.linkedin, s.youtube, s.tiktok].filter(Boolean);
  const org: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: s.companyName,
    url: absUrl(`/${lang}/`),
    description,
  };
  if (s.logoUrl) org.logo = s.logoUrl;
  if (s.phone) org.telephone = s.phone;
  if (s.email) org.email = s.email;
  if (s.address[lang]) org.address = { '@type': 'PostalAddress', streetAddress: s.address[lang], addressCountry: 'AZ' };
  if (sameAs.length) org.sameAs = sameAs;
  const site = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: s.companyName,
    url: absUrl(`/${lang}/`),
    inLanguage: lang,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absUrl(`/${lang}/search/`)}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
  return [org, site];
}
