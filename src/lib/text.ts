import type { L, Locale } from './types';

/** Simple {placeholder} interpolation. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** Read a localized value, falling back to Azerbaijani, then any language. */
export function pick(v: Partial<L> | null | undefined, lang: Locale): string {
  if (!v) return '';
  return v[lang] || v.az || v.en || v.ru || '';
}

const FOLD: Record<string, string> = {
  ə: 'e', ı: 'i', i̇: 'i', ş: 's', ç: 'c', ğ: 'g', ö: 'o', ü: 'u', ё: 'е', й: 'и',
};

/** Normalise text for search: lowercase, fold Azerbaijani/Cyrillic diacritics, strip punctuation. */
export function normalize(s: string): string {
  return s
    .toLocaleLowerCase('az')
    .replace(/[əışçğöüёй]|i̇/g, (m) => FOLD[m] ?? m)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/** URL slug from free text (transliterates Azerbaijani + Cyrillic). */
export function slugify(s: string): string {
  const cyr: Record<string, string> = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z', и: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ы: 'y', э: 'e', ю: 'yu', я: 'ya', ъ: '', ь: '' };
  return normalize(s)
    .split('')
    .map((ch) => cyr[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
