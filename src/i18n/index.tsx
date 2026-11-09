import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { L, Locale } from '@/lib/types';
import { fmt, pick } from '@/lib/text';
import { useSiteData } from '@/data/DataProvider';
import az, { type Dict } from './az';
import ru from './ru';
import en from './en';
import { applyOverrides } from './editable';

export const dictionaries: Record<Locale, Dict> = { az, ru, en };

export const LOCALE_META: Record<Locale, { label: string; short: string; htmlLang: string; ogLocale: string }> = {
  az: { label: 'Azərbaycanca', short: 'AZ', htmlLang: 'az', ogLocale: 'az_AZ' },
  ru: { label: 'Русский', short: 'RU', htmlLang: 'ru', ogLocale: 'ru_RU' },
  en: { label: 'English', short: 'EN', htmlLang: 'en', ogLocale: 'en_US' },
};

interface I18n {
  lang: Locale;
  t: Dict;
  /** Pick the current-language value of a localized field. */
  tr: (v: Partial<L> | null | undefined) => string;
  fmt: typeof fmt;
}

const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ lang, children }: { lang: Locale; children: ReactNode }) {
  const { content } = useSiteData();
  const value = useMemo<I18n>(() => {
    const t = applyOverrides(dictionaries[lang], content[lang]);
    return { lang, t, tr: (v) => pick(v, lang), fmt };
  }, [lang, content]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error('useI18n must be used inside <I18nProvider>');
  return v;
}
