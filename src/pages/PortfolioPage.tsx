import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Search, Layers } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useCatalog, useProjects } from '@/data/DataProvider';
import { breadcrumbLd, useSeo } from '@/lib/seo';
import { paths } from '@/lib/paths';
import { normalize } from '@/lib/text';
import { LOCALES } from '@/lib/types';
import { PageHero } from '@/components/ui/PageHero';
import { ProjectCard } from '@/components/ui/Cards';
import { CtaBand } from '@/components/ui/CtaBand';

const PAGE = 9;

export default function PortfolioPage() {
  const { t, lang, tr } = useI18n();
  const { categories } = useCatalog();
  const { projects, status } = useProjects();
  const [params, setParams] = useSearchParams();
  const cat = params.get('category') || '';
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(PAGE);
  useSeo({
    title: t.seo.portfolio.t,
    description: t.seo.portfolio.d,
    lang,
    path: paths.portfolio,
    jsonLd: breadcrumbLd([{ name: t.nav.home, url: paths.home(lang) }, { name: t.nav.portfolio, url: paths.portfolio(lang) }]),
  });

  const usedCats = categories.filter((c) => projects.some((p) => p.categoryId === c.id || p.categoryId === c.slug));
  const filtered = useMemo(() => {
    const nq = normalize(q);
    const catObj = categories.find((c) => c.slug === cat);
    return projects.filter((p) => {
      if (catObj && p.categoryId !== catObj.id && p.categoryId !== catObj.slug) return false;
      if (!nq) return true;
      const text = normalize([p.title, p.summary, p.scope, p.materials].map((v) => LOCALES.map((l) => v[l]).join(' ')).join(' ') + ' ' + (p.clientName || ''));
      return nq.split(' ').every((tok) => text.includes(tok));
    });
  }, [projects, q, cat, categories]);

  const setCat = (slug: string) => {
    setLimit(PAGE);
    const next = new URLSearchParams(params);
    if (slug) next.set('category', slug);
    else next.delete('category');
    setParams(next, { replace: true });
  };

  const hasDemo = projects.some((p) => p.isDemo);

  return (
    <>
      <PageHero crumbs={[{ label: t.nav.home, to: paths.home(lang) }, { label: t.nav.portfolio }]} kicker={t.portfolio.kicker} title={t.portfolio.title} text={t.portfolio.text} />
      <section className="container-x py-12 md:py-16">
        {hasDemo && <p className="mb-8 rounded-2xl bg-saffron/20 p-4 text-sm font-semibold text-ink" role="note">{t.common.demoNotice}</p>}
        {projects.length > 0 && (
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div role="group" aria-label={t.portfolio.category} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
              {[{ slug: '', label: t.portfolio.all }, ...usedCats.map((c) => ({ slug: c.slug, label: tr(c.name) }))].map((f) => (
                <button
                  key={f.slug || 'all'}
                  type="button"
                  aria-pressed={cat === f.slug}
                  onClick={() => setCat(f.slug)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors ${cat === f.slug ? 'bg-ink text-white' : 'bg-white text-ink ring-1 ring-line hover:ring-ink'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-mute" aria-hidden />
              <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} placeholder={t.portfolio.search} aria-label={t.portfolio.search} className="field !rounded-full !py-3 !pl-11" />
            </div>
          </div>
        )}

        {status === 'loading' || status === 'idle' ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-[var(--radius-card)] bg-line/60" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-[var(--radius-card)] border border-dashed border-line bg-white px-6 py-20 text-center">
            <Layers className="size-10 text-nar" aria-hidden />
            <p className="max-w-md text-lg text-mute">{t.portfolio.empty}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-white p-12 text-center">
            <p className="text-lg font-bold">{t.portfolio.emptyFiltered}</p>
            <button type="button" className="btn btn-ghost mt-5" onClick={() => { setQ(''); setCat(''); }}>{t.portfolio.resetFilters}</button>
          </div>
        ) : (
          <>
            <motion.ul layout className="columns-1 gap-8 sm:columns-2 lg:columns-3">
              <AnimatePresence mode="popLayout">
                {filtered.slice(0, limit).map((p, i) => (
                  <motion.li
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-10 break-inside-avoid"
                  >
                    <ProjectCard project={p} tall={i % 3 === 1} index={i} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
            {filtered.length > limit && (
              <div className="mt-6 text-center">
                <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="btn btn-dark">{t.portfolio.loadMore}</button>
              </div>
            )}
          </>
        )}
      </section>
      <CtaBand />
    </>
  );
}
