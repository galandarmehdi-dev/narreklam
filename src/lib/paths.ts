import type { Locale } from './types';
import { LOCALES } from './types';

/** All public URL builders live here so routes stay consistent (trailing slash = static folder on GitHub Pages). */
export const paths = {
  home: (l: Locale) => `/${l}/`,
  services: (l: Locale) => `/${l}/services/`,
  category: (l: Locale, cat: string) => `/${l}/services/${cat}/`,
  service: (l: Locale, cat: string, svc: string) => `/${l}/services/${cat}/${svc}/`,
  portfolio: (l: Locale) => `/${l}/portfolio/`,
  project: (l: Locale, slug: string) => `/${l}/portfolio/${slug}/`,
  about: (l: Locale) => `/${l}/about/`,
  quote: (l: Locale, service?: string) => `/${l}/quote/${service ? `?service=${encodeURIComponent(service)}` : ''}`,
  contact: (l: Locale) => `/${l}/contact/`,
  faq: (l: Locale) => `/${l}/faq/`,
  search: (l: Locale, q?: string) => `/${l}/search/${q ? `?q=${encodeURIComponent(q)}` : ''}`,
  privacy: (l: Locale) => `/${l}/privacy/`,
  cookies: (l: Locale) => `/${l}/cookies/`,
};

export function isLocale(v: string | undefined): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}

/** Same page in another language: swap the first path segment. */
export function switchLocalePath(pathname: string, search: string, to: Locale): string {
  const parts = pathname.split('/');
  if (isLocale(parts[1])) parts[1] = to;
  else return `/${to}/`;
  return parts.join('/') + search;
}
