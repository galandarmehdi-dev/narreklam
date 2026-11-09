import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { I18nProvider, useI18n } from '@/i18n';
import { isLocale } from '@/lib/paths';
import { DEFAULT_LOCALE, type Locale } from '@/lib/types';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingActions, WhatsAppContextProvider } from './FloatingActions';
import { SearchProvider } from './SearchDialog';
import NotFoundPage from '@/pages/NotFoundPage';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
      return;
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

function Shell({ invalid }: { invalid: boolean }) {
  const { t } = useI18n();
  return (
    <SearchProvider>
      <WhatsAppContextProvider>
        <a href="#main" className="sr-only z-[100] rounded-full bg-ink px-5 py-3 font-bold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
          {t.a11y.skip}
        </a>
        <ScrollToTop />
        <Header />
        <main id="main" tabIndex={-1} className="outline-none">
          {invalid ? <NotFoundPage /> : <Outlet />}
        </main>
        <Footer />
        <FloatingActions />
      </WhatsAppContextProvider>
    </SearchProvider>
  );
}

/** Wraps every /az|ru|en/* page (and the catch-all 404) and provides translations. */
export default function SiteLayout({ lang, invalid = false }: { lang?: Locale; invalid?: boolean }) {
  return (
    <MotionConfig reducedMotion="user">
      <I18nProvider lang={lang && isLocale(lang) ? lang : DEFAULT_LOCALE}>
        <Shell invalid={invalid} />
      </I18nProvider>
    </MotionConfig>
  );
}
