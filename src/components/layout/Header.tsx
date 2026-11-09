import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, ChevronDown, Menu, Search, X } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useCatalog } from '@/data/DataProvider';
import { paths } from '@/lib/paths';
import { iconFor } from '@/lib/icons';
import { Logo } from '@/components/ui/Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useSearchDialog } from './SearchDialog';

export function Header() {
  const { t, lang, tr } = useI18n();
  const { categories, servicesOf } = useCatalog();
  const { open: openSearch } = useSearchDialog();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mega, setMega] = useState(false);
  const [mobile, setMobile] = useState(false);
  const lastY = useRef(0);
  const megaTimer = useRef<number>();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      setHidden(y > 400 && y > lastY.current + 4 && !mega);
      if (y < lastY.current - 4) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [mega]);

  // Close menus on navigation.
  useEffect(() => {
    setMega(false);
    setMobile(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobile ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobile]);

  useEffect(() => {
    if (!mega) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMega(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mega]);

  const openMega = () => {
    window.clearTimeout(megaTimer.current);
    setMega(true);
  };
  const closeMegaSoon = () => {
    megaTimer.current = window.setTimeout(() => setMega(false), 160);
  };

  const navLink = 'relative px-3 py-2 text-[0.95rem] font-semibold text-ink/80 transition-colors hover:text-ink aria-[current=page]:text-ink';
  const links = [
    { to: paths.portfolio(lang), label: t.nav.portfolio },
    { to: paths.about(lang), label: t.nav.about },
    { to: paths.faq(lang), label: t.nav.faq, wide: true },
    { to: paths.contact(lang), label: t.nav.contact },
  ];

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,box-shadow] duration-500 ease-[var(--ease-out-expo)] ${hidden && !mobile ? '-translate-y-full' : ''} ${scrolled || mega ? 'bg-paper/85 shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur-xl' : ''}`}
      >
        <div className="container-x flex h-[4.5rem] items-center justify-between gap-4 md:h-20 lg:!px-6 xl:!px-10">
          <Link to={paths.home(lang)} className="shrink-0" aria-label={`NarReklam — ${t.nav.home}`}>
            <Logo />
          </Link>

          <nav aria-label={t.a11y.mainNav} className="hidden items-center lg:flex">
            <div onMouseEnter={openMega} onMouseLeave={closeMegaSoon}>
              <button
                type="button"
                className={`${navLink} inline-flex items-center gap-1`}
                aria-expanded={mega}
                aria-controls="mega-menu"
                onClick={() => setMega((v) => !v)}
              >
                {t.nav.services}
                <ChevronDown className={`size-4 transition-transform duration-300 ${mega ? 'rotate-180' : ''}`} aria-hidden />
              </button>
            </div>
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={`${navLink} ${l.wide ? 'hidden xl:inline-block' : ''}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 md:gap-2">
            <button type="button" onClick={openSearch} className="grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-ink/5" aria-label={t.a11y.openSearch}>
              <Search className="size-5" aria-hidden />
            </button>
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            <Link to={paths.quote(lang)} className="btn btn-primary hidden !min-h-11 !px-5 sm:inline-flex">
              {t.nav.quote}
            </Link>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full bg-ink text-white lg:hidden"
              aria-label={mobile ? t.a11y.closeMenu : t.a11y.openMenu}
              aria-expanded={mobile}
              aria-controls="mobile-menu"
              onClick={() => setMobile((v) => !v)}
            >
              {mobile ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
            </button>
          </div>
        </div>

        {/* Desktop mega menu */}
        <AnimatePresence>
          {mega && (
            <motion.div
              id="mega-menu"
              onMouseEnter={openMega}
              onMouseLeave={closeMegaSoon}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 top-full hidden border-t border-line bg-paper/95 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:block"
            >
              <div className="container-x grid grid-cols-3 gap-x-10 gap-y-8 py-10 xl:grid-cols-6">
                {categories.map((c) => {
                  const Icon = iconFor(c.icon);
                  return (
                    <div key={c.id}>
                      <Link to={paths.category(lang, c.slug)} className="group mb-3 flex items-start gap-2 font-display text-[0.95rem] font-bold leading-tight">
                        <Icon className="mt-0.5 size-4 shrink-0 text-nar" aria-hidden />
                        <span className="link-underline">{tr(c.name)}</span>
                      </Link>
                      <ul className="space-y-1.5 pl-6">
                        {servicesOf(c.id).map((s) => (
                          <li key={s.id}>
                            <Link to={paths.service(lang, c.slug, s.slug)} className="text-sm text-mute transition-colors hover:text-nar">
                              {tr(s.title)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-line">
                <div className="container-x flex items-center justify-between py-4">
                  <Link to={paths.services(lang)} className="inline-flex items-center gap-1.5 text-sm font-bold text-ink hover:text-nar">
                    {t.nav.allServices} <ArrowUpRight className="size-4" aria-hidden />
                  </Link>
                  <button type="button" onClick={openSearch} className="inline-flex items-center gap-2 text-sm text-mute hover:text-ink">
                    <Search className="size-4" aria-hidden /> {t.services.searchHint}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobile && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 overflow-y-auto bg-ink pt-24 text-white lg:hidden"
          >
            <nav aria-label={t.a11y.mainNav} className="container-x flex min-h-full flex-col pb-10">
              <MobileServices />
              <ul className="mt-2 border-t border-white/10">
                {links.map((l, i) => (
                  <motion.li key={l.to} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i + 0.1 }}>
                    <NavLink to={l.to} className="flex items-center justify-between border-b border-white/10 py-4 font-display text-2xl font-bold">
                      {l.label}
                      <ArrowUpRight className="size-5 text-white/40" aria-hidden />
                    </NavLink>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-4">
                <Link to={paths.quote(lang)} className="btn btn-primary w-full">{t.nav.quote}</Link>
                <div className="flex justify-center">
                  <LanguageSwitcher tone="light" />
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileServices() {
  const { t, lang, tr } = useI18n();
  const { categories, servicesOf } = useCatalog();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div>
      <Link to={paths.services(lang)} className="flex items-center justify-between py-4 font-display text-3xl font-bold">
        {t.nav.services}
        <ArrowUpRight className="size-5 text-white/40" aria-hidden />
      </Link>
      <ul className="mb-4">
        {categories.map((c) => {
          const isOpen = open === c.id;
          return (
            <li key={c.id} className="border-t border-white/10">
              <button
                type="button"
                className="flex w-full items-center justify-between py-3.5 text-left font-semibold text-white/85"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : c.id)}
              >
                {tr(c.name)}
                <ChevronDown className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
              </button>
              {isOpen && (
                <ul className="space-y-1 pb-4 pl-3">
                  <li>
                    <Link to={paths.category(lang, c.slug)} className="block py-1.5 text-sm font-bold text-saffron">{t.common.viewAll}</Link>
                  </li>
                  {servicesOf(c.id).map((s) => (
                    <li key={s.id}>
                      <Link to={paths.service(lang, c.slug, s.slug)} className="block py-1.5 text-white/70">{tr(s.title)}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
