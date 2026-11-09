import type { Category, L, Locale, PortfolioProject, Service } from './types';
import { LOCALES } from './types';
import { normalize } from './text';
import { paths } from './paths';

export type SearchType = 'category' | 'service' | 'item' | 'project';

export interface SearchEntry {
  type: SearchType;
  key: string;
  title: L;
  context: L;
  href: (l: Locale) => string;
  /** Normalised text across ALL languages, so a Russian or English query works on any page. */
  haystack: string;
  titleNorm: string;
}

const all = (v: Partial<L> | undefined) => LOCALES.map((l) => v?.[l] || '').join(' ');

export function buildIndex(categories: Category[], services: Service[], projects: PortfolioProject[]): SearchEntry[] {
  const catById = new Map(categories.map((c) => [c.id, c]));
  const out: SearchEntry[] = [];

  for (const c of categories) {
    out.push({
      type: 'category',
      key: `c-${c.id}`,
      title: c.name,
      context: c.tagline,
      href: (l) => paths.category(l, c.slug),
      haystack: normalize(`${all(c.name)} ${all(c.tagline)} ${all(c.description)}`),
      titleNorm: normalize(all(c.name)),
    });
  }

  for (const s of services) {
    const cat = catById.get(s.categoryId);
    if (!cat) continue;
    const href = (l: Locale) => paths.service(l, cat.slug, s.slug);
    out.push({
      type: 'service',
      key: `s-${s.id}`,
      title: s.title,
      context: s.short,
      href,
      haystack: normalize(`${all(s.title)} ${all(s.short)} ${all(s.keywords)} ${s.items.map((i) => all(i.name)).join(' ')} ${all(cat.name)}`),
      titleNorm: normalize(`${all(s.title)} ${all(s.keywords)}`),
    });
    for (const it of s.items) {
      out.push({
        type: 'item',
        key: `i-${it.id}`,
        title: it.name,
        context: s.title,
        href,
        haystack: normalize(`${all(it.name)} ${all(s.title)}`),
        titleNorm: normalize(all(it.name)),
      });
    }
  }

  for (const p of projects) {
    out.push({
      type: 'project',
      key: `p-${p.id}`,
      title: p.title,
      context: p.summary,
      href: (l) => paths.project(l, p.slug),
      haystack: normalize(`${all(p.title)} ${all(p.summary)} ${all(p.scope)} ${all(p.materials)} ${p.clientName || ''}`),
      titleNorm: normalize(all(p.title)),
    });
  }
  return out;
}

const TYPE_WEIGHT: Record<SearchType, number> = { service: 4, category: 3, item: 1, project: 2 };

/** Token-based partial matching with prefix/title boosting. All query tokens must match. */
export function runSearch(index: SearchEntry[], query: string, limit = 40): SearchEntry[] {
  const tokens = normalize(query).split(' ').filter((t) => t.length > 0);
  if (!tokens.length) return [];
  const scored: { e: SearchEntry; score: number }[] = [];
  for (const e of index) {
    let score = 0;
    let ok = true;
    for (const tok of tokens) {
      const words = ` ${e.haystack}`;
      const titleWords = ` ${e.titleNorm} `;
      if (titleWords.includes(` ${tok} `)) score += 14; // exact word in title/keywords
      else if (titleWords.includes(` ${tok}`)) score += 10; // word prefix
      else if (e.titleNorm.includes(tok)) score += 6;
      else if (words.includes(` ${tok}`)) score += 3;
      else if (tok.length >= 3 && e.haystack.includes(tok)) score += 1;
      else {
        ok = false;
        break;
      }
    }
    if (ok) scored.push({ e, score: score + TYPE_WEIGHT[e.type] });
  }
  // De-duplicate: if a service matches, hide its items that point to the same page unless they score higher.
  scored.sort((a, b) => b.score - a.score);
  const seen = new Map<string, number>();
  const result: SearchEntry[] = [];
  for (const { e, score } of scored) {
    const href = e.href('az');
    const prev = seen.get(href);
    if (e.type === 'item' && prev !== undefined && prev >= score) continue;
    if (!seen.has(href)) seen.set(href, score);
    result.push(e);
    if (result.length >= limit) break;
  }
  return result;
}
