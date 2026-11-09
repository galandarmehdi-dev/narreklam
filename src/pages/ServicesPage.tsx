import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useCatalog } from '@/data/DataProvider';
import { breadcrumbLd, useSeo } from '@/lib/seo';
import { paths } from '@/lib/paths';
import { normalize } from '@/lib/text';
import { iconFor } from '@/lib/icons';
import { PageHero } from '@/components/ui/PageHero';
import { ServiceCard } from '@/components/ui/Cards';
import { Reveal } from '@/components/ui/Reveal';
import { CtaBand } from '@/components/ui/CtaBand';
import { LOCALES } from '@/lib/types';

export default function ServicesPage() {
  const { t, lang, tr } = useI18n();
  const { categories, servicesOf } = useCatalog();
  const [q, setQ] = useState('');
  useSeo({
    title: t.seo.services.t,
    description: t.seo.services.d,
    lang,
    path: paths.services,
    jsonLd: breadcrumbLd([{ name: t.nav.home, url: paths.home(lang) }, { name: t.nav.services, url: paths.services(lang) }]),
  });

  const nq = normalize(q);
  const filtered = useMemo(
    () =>
      categories.map((c) => ({
        c,
        services: servicesOf(c.id).filter((s) => {
          if (!nq) return true;
          const text = normalize(
            [s.title, s.short, s.keywords, ...s.items.map((i) => i.name)].map((v) => LOCALES.map((l) => v[l]).join(' ')).join(' '),
          );
          return nq.split(' ').every((tok) => text.includes(tok));
        }),
      })),
    [categories, servicesOf, nq],
  );
  const total = filtered.reduce((n, g) => n + g.services.length, 0);

  return (
    <>
      <PageHero
        crumbs={[{ label: t.nav.home, to: paths.home(lang) }, { label: t.nav.services }]}
        kicker={t.services.kicker}
        title={t.services.title}
        text={t.services.text}
      >
        <div className="relative mt-8 max-w-xl">
          <Search className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-mute" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.services.searchHint}
            aria-label={t.services.searchHint}
            className="field !rounded-full !py-4 !pl-13"
          />
        </div>
      </PageHero>

      {/* Category jump links */}
      <nav aria-label={t.nav.services} className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-xl">
        <ul className="container-x no-scrollbar flex gap-2 overflow-x-auto py-3">
          {categories.map((c) => (
            <li key={c.id} className="shrink-0">
              <a href={`#${c.slug}`} className="chip whitespace-nowrap hover:border-ink">{tr(c.name)}</a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container-x py-16 md:py-24">
        {total === 0 && (
          <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-white p-10 text-center">
            <p className="text-lg font-bold">{t.services.notFound}</p>
            <Link to={paths.quote(lang)} className="btn btn-primary mt-6">{t.common.getQuote}</Link>
          </div>
        )}
        <div className="space-y-24">
          {filtered.map(({ c, services }, ci) => {
            if (!services.length) return null;
            const Icon = iconFor(c.icon);
            return (
              <section key={c.id} id={c.slug} aria-labelledby={`h-${c.slug}`} className="scroll-mt-32">
                <Reveal className="mb-10 flex flex-col gap-6 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
                  <div className="flex items-start gap-5">
                    <span className="hidden font-display text-6xl font-black text-line md:block">{String(ci + 1).padStart(2, '0')}</span>
                    <div>
                      <p className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-nar"><Icon className="size-4" aria-hidden />{tr(c.tagline)}</p>
                      <h2 id={`h-${c.slug}`} className="text-3xl font-bold md:text-5xl">{tr(c.name)}</h2>
                      <p className="mt-3 max-w-2xl text-mute">{tr(c.description)}</p>
                    </div>
                  </div>
                  <Link to={paths.category(lang, c.slug)} className="btn btn-ghost shrink-0 group">
                    {t.common.viewAll}
                    <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45" aria-hidden />
                  </Link>
                </Reveal>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map((s, i) => (
                    <Reveal key={s.id} delay={(i % 3) * 0.06}>
                      <ServiceCard service={s} categorySlug={c.slug} />
                    </Reveal>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
      <CtaBand />
    </>
  );
}
