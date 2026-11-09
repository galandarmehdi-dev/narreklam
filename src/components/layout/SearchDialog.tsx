import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, CornerDownLeft, Search, X } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useCatalog, useSiteData } from '@/data/DataProvider';
import { buildIndex, runSearch } from '@/lib/search';
import { paths } from '@/lib/paths';
import { fmt } from '@/lib/text';

const Ctx = createContext<{ open: () => void }>({ open: () => {} });
export const useSearchDialog = () => useContext(Ctx);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <AnimatePresence>{isOpen && <SearchModal onClose={() => setOpen(false)} />}</AnimatePresence>
    </Ctx.Provider>
  );
}

export function useSearchIndex() {
  const { categories, services } = useCatalog();
  const { projects } = useSiteData();
  return useMemo(() => buildIndex(categories, services, projects), [categories, services, projects]);
}

function SearchModal({ onClose }: { onClose: () => void }) {
  const { t, lang, tr } = useI18n();
  const { loadProjects } = useSiteData();
  const navigate = useNavigate();
  const index = useSearchIndex();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => runSearch(index, q, 12), [index, q]);
  const prevFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    loadProjects();
    prevFocus.current = document.activeElement as HTMLElement;
    inputRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      prevFocus.current?.focus?.();
    };
  }, [loadProjects]);

  useEffect(() => setActive(0), [q]);

  const go = (href: string) => {
    onClose();
    navigate(href);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[active]) go(results[active].href(lang));
      else if (q.trim()) go(paths.search(lang, q.trim()));
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-ink/60 px-4 pt-[10vh] backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={t.search.title}
        initial={{ y: -20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl overflow-hidden rounded-3xl bg-paper shadow-2xl"
        onKeyDown={onKey}
      >
        <div className="flex items-center gap-3 border-b border-line px-5">
          <Search className="size-5 text-mute" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search.placeholder}
            aria-label={t.search.placeholder}
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="search-results"
            aria-activedescendant={results[active] ? `sr-${active}` : undefined}
            className="h-16 flex-1 bg-transparent text-lg outline-none placeholder:text-mute/70"
          />
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full hover:bg-ink/5" aria-label={t.a11y.closeSearch}>
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!q.trim() ? (
            <div className="p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-mute">{t.search.popular}</p>
              <div className="flex flex-wrap gap-2">
                {t.search.popularTerms.map((term) => (
                  <button key={term} type="button" onClick={() => setQ(term)} className="chip hover:border-ink">
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center">
              <p className="font-bold">{fmt(t.search.empty, { q })}</p>
              <p className="mt-1 text-sm text-mute">{t.search.emptyHint}</p>
              <button type="button" onClick={() => go(paths.quote(lang))} className="btn btn-primary mt-5 !min-h-10">{t.common.getQuote}</button>
            </div>
          ) : (
            <ul id="search-results" role="listbox" aria-label={t.search.title}>
              {results.map((r, i) => (
                <li key={r.key} id={`sr-${i}`} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r.href(lang))}
                    className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition-colors ${i === active ? 'bg-white shadow-sm' : ''}`}
                  >
                    <span className="w-24 shrink-0 text-[0.7rem] font-extrabold uppercase tracking-wider text-nar">{t.search.types[r.type]}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold">{tr(r.title)}</span>
                      <span className="block truncate text-sm text-mute">{tr(r.context)}</span>
                    </span>
                    {i === active ? <CornerDownLeft className="size-4 text-mute" aria-hidden /> : <ArrowRight className="size-4 text-line" aria-hidden />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {q.trim() && results.length > 0 && (
          <button type="button" onClick={() => go(paths.search(lang, q.trim()))} className="block w-full border-t border-line px-5 py-3 text-left text-sm font-bold text-mute hover:text-ink">
            {fmt(t.search.results, { n: runSearch(index, q, 200).length })} →
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
