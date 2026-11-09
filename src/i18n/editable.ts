/**
 * Dictionary keys that can be overridden per language from Admin → Website content.
 * Overrides are stored in `content_translations` (block_key = key below).
 */
export const EDITABLE_KEYS: { key: string; group: string; multiline?: boolean }[] = [
  { key: 'home.hero.kicker', group: 'Hero' },
  { key: 'home.hero.title', group: 'Hero' },
  { key: 'home.hero.line', group: 'Hero' },
  { key: 'home.hero.text', group: 'Hero', multiline: true },
  { key: 'home.hero.ctaServices', group: 'Hero' },
  { key: 'home.hero.ctaQuote', group: 'Hero' },
  { key: 'home.services.title', group: 'Homepage' },
  { key: 'home.services.text', group: 'Homepage', multiline: true },
  { key: 'home.work.title', group: 'Homepage' },
  { key: 'home.capabilities.title', group: 'Homepage' },
  { key: 'home.capabilities.text', group: 'Homepage', multiline: true },
  { key: 'home.why.title', group: 'Homepage' },
  { key: 'home.cta.title', group: 'Calls to action' },
  { key: 'home.cta.text', group: 'Calls to action', multiline: true },
  { key: 'home.cta.button', group: 'Calls to action' },
  { key: 'services.ctaTitle', group: 'Calls to action' },
  { key: 'services.ctaText', group: 'Calls to action', multiline: true },
  { key: 'about.title', group: 'About' },
  { key: 'about.lead', group: 'About', multiline: true },
  { key: 'about.body.0', group: 'About', multiline: true },
  { key: 'about.body.1', group: 'About', multiline: true },
  { key: 'contact.title', group: 'Contact' },
  { key: 'contact.text', group: 'Contact', multiline: true },
  { key: 'footer.tagline', group: 'Footer', multiline: true },
  { key: 'seo.home.t', group: 'SEO' },
  { key: 'seo.home.d', group: 'SEO', multiline: true },
  { key: 'seo.services.t', group: 'SEO' },
  { key: 'seo.services.d', group: 'SEO', multiline: true },
  { key: 'seo.portfolio.t', group: 'SEO' },
  { key: 'seo.portfolio.d', group: 'SEO', multiline: true },
  { key: 'seo.about.t', group: 'SEO' },
  { key: 'seo.about.d', group: 'SEO', multiline: true },
  { key: 'seo.contact.t', group: 'SEO' },
  { key: 'seo.contact.d', group: 'SEO', multiline: true },
  { key: 'seo.quote.t', group: 'SEO' },
  { key: 'seo.quote.d', group: 'SEO', multiline: true },
];

/** Read a dotted path from a nested object. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getPath(obj: any, path: string): unknown {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}

/** Return a deep clone of `dict` with string overrides applied at dotted paths. */
export function applyOverrides<T>(dict: T, overrides: Record<string, string> | undefined): T {
  if (!overrides || !Object.keys(overrides).length) return dict;
  const clone = structuredClone(dict);
  for (const [path, value] of Object.entries(overrides)) {
    if (!value?.trim()) continue;
    const keys = path.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let o: any = clone;
    for (let i = 0; i < keys.length - 1; i++) {
      if (o[keys[i]] == null) break;
      o = o[keys[i]];
    }
    const last = keys[keys.length - 1];
    if (o && typeof o[last] === 'string') o[last] = value;
  }
  return clone;
}
