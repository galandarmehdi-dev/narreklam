import { Link, useLocation } from 'react-router-dom';
import { LOCALES } from '@/lib/types';
import { useI18n, LOCALE_META } from '@/i18n';
import { switchLocalePath } from '@/lib/paths';

/** Segmented AZ/RU/EN switcher that keeps the visitor on the equivalent page. */
export function LanguageSwitcher({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const { lang, t } = useI18n();
  const { pathname, search } = useLocation();
  return (
    <div role="group" aria-label={t.a11y.language} className={`flex items-center rounded-full p-1 ${tone === 'light' ? 'bg-white/10' : 'bg-ink/5'}`}>
      {LOCALES.map((l) => {
        const active = l === lang;
        return (
          <Link
            key={l}
            to={switchLocalePath(pathname, search, l)}
            hrefLang={l}
            lang={l}
            aria-current={active ? 'true' : undefined}
            aria-label={LOCALE_META[l].label}
            onClick={() => {
              try {
                localStorage.setItem('narreklam-lang', l);
              } catch {
                /* storage unavailable — preference simply isn't remembered */
              }
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-extrabold tracking-wider transition-colors ${
              active ? (tone === 'light' ? 'bg-white text-ink' : 'bg-ink text-white') : tone === 'light' ? 'text-white/70 hover:text-white' : 'text-ink/60 hover:text-ink'
            }`}
          >
            {LOCALE_META[l].short}
          </Link>
        );
      })}
    </div>
  );
}
