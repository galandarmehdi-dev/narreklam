import { useI18n } from '@/i18n';
import { useCatalog } from '@/data/DataProvider';
import { breadcrumbLd, useSeo } from '@/lib/seo';
import { paths } from '@/lib/paths';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { CategoryCard } from '@/components/ui/Cards';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CtaBand } from '@/components/ui/CtaBand';
import { Process } from '@/components/home/Sections';

export default function AboutPage() {
  const { t, lang } = useI18n();
  const { categories, servicesOf } = useCatalog();
  useSeo({
    title: t.seo.about.t,
    description: t.seo.about.d,
    lang,
    path: paths.about,
    jsonLd: breadcrumbLd([{ name: t.nav.home, url: paths.home(lang) }, { name: t.nav.about, url: paths.about(lang) }]),
  });
  return (
    <>
      <PageHero crumbs={[{ label: t.nav.home, to: paths.home(lang) }, { label: t.nav.about }]} kicker={t.about.kicker} title={t.about.title} />
      <section className="container-x py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <p className="font-display text-2xl leading-snug font-bold tracking-tight md:text-4xl">{t.about.lead}</p>
          </Reveal>
          <Reveal delay={0.1} className="space-y-5 text-lg leading-relaxed text-ink-3">
            {t.about.body.map((p, i) => <p key={i}>{p}</p>)}
          </Reveal>
        </div>
      </section>
      <section className="on-dark bg-ink py-16 text-white md:py-24">
        <div className="container-x">
          <SectionHeading title={t.about.valuesTitle} tone="light" />
          <div className="grid gap-4 md:grid-cols-3">
            {t.about.values.map((v, i) => (
              <Reveal key={i} delay={i * 0.08} className="rounded-[var(--radius-card)] border border-white/10 p-8">
                <span className="font-display text-5xl font-black text-nar">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-6 text-2xl font-bold">{v.t}</h3>
                <p className="mt-3 text-white/70">{v.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <Process />
      <section className="container-x pb-8">
        <SectionHeading title={t.about.directionsTitle} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => <CategoryCard key={c.id} category={c} count={servicesOf(c.id).length} index={i} />)}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
