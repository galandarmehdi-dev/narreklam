import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Search } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useSiteData } from '@/data/DataProvider';
import { useSeo } from '@/lib/seo';
import { paths } from '@/lib/paths';
import { fmt } from '@/lib/text';
import { runSearch, type SearchType } from '@/lib/search';
import { useSearchIndex } from '@/components/layout/SearchDialog';
import { PageHero } from '@/components/ui/PageHero';

export default function SearchPage() {
  const { t, lang, tr } = useI18n();
  const { loadProjects } = useSiteData();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [input, setInput] = useState(q);
  const [type, setType] = useState<SearchType | ''>('');
  const index = useSearchIndex();
  useEffect(() => loadProjects(), [loadProjects]);
  useEffect(() => setInput(q), [q]);
  useSeo({ title: t.seo.search.t, description: t.seo.search.d, lang, path: (l) => paths.search(l), noindex: !!q });

  const results = useMemo(() => runSearch(index, q, 200), [index, q]);
  const shown = type ? results.filter((r) => r.type === type) : results;
  const types = Array.from(new Set(results.map((r) => r.type)));

  return (
    <>
      <PageHero crumbs={[{ label: t.nav.home, to: paths.home(lang) }, { label: t.search.title }]} title={t.search.title}>
        <form
          role="search"
          className="relative mt-8 max-w-2xl"
          onSubmit={(e) => {
            e.preventDefault();
            setParams(input.trim() ? { q: input.trim() } : {});
          }}
        >
          <Search className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-mute" aria-hidden />
          <input type="search" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t.search.placeholder} aria-label={t.search.placeholder} className="field !rounded-full !py-4 !pr-32 !pl-13 text-lg" />
          <button type="submit" className="btn btn-dark absolute top-1.5 right-1.5 !min-h-11">{t.nav.search}</button>
        </form>
      </PageHero>
      <section className="container-x py-12 md:py-16" aria-live="polite">
        {!q ? (
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-mute">{t.search.popular}</p>
            <div className="flex flex-wrap gap-2">
              {t.search.popularTerms.map((term) => (
                <button key={term} type="button" className="chip hover:border-ink" onClick={() => setParams({ q: term })}>{term}</button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-white p-12 text-center">
            <p className="text-xl font-bold">{fmt(t.search.empty, { q })}</p>
            <p className="mt-2 text-mute">{t.search.emptyHint}</p>
            <Link to={paths.quote(lang)} className="btn btn-primary mt-6">{t.common.getQuote}</Link>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-wrap items-center gap-2">
              <p className="mr-4 font-bold">{fmt(t.search.results, { n: results.length })}</p>
              {types.length > 1 &&
                (['', ...types] as (SearchType | '')[]).map((ty) => (
                  <button key={ty || 'all'} type="button" aria-pressed={type === ty} onClick={() => setType(ty)} className={`rounded-full px-4 py-1.5 text-sm font-bold ${type === ty ? 'bg-ink text-white' : 'bg-white ring-1 ring-line'}`}>
                    {ty ? t.search.types[ty] : t.portfolio.all}
                  </button>
                ))}
            </div>
            <ul className="divide-y divide-line border-y border-line">
              {shown.map((r) => (
                <li key={r.key}>
                  <Link to={r.href(lang)} className="group flex items-center gap-6 py-5">
                    <span className="w-24 shrink-0 text-xs font-extrabold uppercase tracking-wider text-nar">{t.search.types[r.type]}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-lg font-bold group-hover:text-nar">{tr(r.title)}</span>
                      <span className="block truncate text-mute">{tr(r.context)}</span>
                    </span>
                    <ArrowUpRight className="size-5 text-mute transition-transform group-hover:rotate-45 group-hover:text-nar" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </>
  );
}
