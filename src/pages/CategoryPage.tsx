import { useParams } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useCatalog, useProjects } from '@/data/DataProvider';
import { breadcrumbLd, useSeo } from '@/lib/seo';
import { paths } from '@/lib/paths';
import { fmt } from '@/lib/text';
import { PageHero } from '@/components/ui/PageHero';
import { ServiceCard, ProjectCard, CategoryCard } from '@/components/ui/Cards';
import { Reveal } from '@/components/ui/Reveal';
import { CtaBand } from '@/components/ui/CtaBand';
import { Art } from '@/components/ui/Art';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageLoader } from '@/components/ui/PageLoader';
import NotFoundPage from './NotFoundPage';

export default function CategoryPage() {
  const { categorySlug = '' } = useParams();
  const { t, lang, tr } = useI18n();
  const { catBySlug, servicesOf, categories, loading } = useCatalog();
  const { projects } = useProjects();
  const category = catBySlug.get(categorySlug);

  useSeo({
    title: category ? tr(category.seoTitle) || fmt(t.seo.categoryTitle, { title: tr(category.name) }) : t.seo.notFound.t,
    description: category ? tr(category.seoDescription) || tr(category.description) : t.seo.notFound.d,
    lang,
    path: category ? (l) => paths.category(l, category.slug) : undefined,
    noindex: !category,
    jsonLd: category
      ? breadcrumbLd([
          { name: t.nav.home, url: paths.home(lang) },
          { name: t.nav.services, url: paths.services(lang) },
          { name: tr(category.name), url: paths.category(lang, category.slug) },
        ])
      : undefined,
  });

  if (!category) return loading ? <PageLoader /> : <NotFoundPage />;
  const services = servicesOf(category.id);
  const related = projects.filter((p) => p.categoryId === category.id || p.categoryId === category.slug).slice(0, 3);
  const others = categories.filter((c) => c.id !== category.id).slice(0, 3);

  return (
    <>
      <PageHero
        crumbs={[{ label: t.nav.home, to: paths.home(lang) }, { label: t.nav.services, to: paths.services(lang) }, { label: tr(category.name) }]}
        kicker={tr(category.tagline)}
        title={tr(category.name)}
        text={tr(category.description)}
        aside={
          <div className="hidden aspect-[4/3] w-80 overflow-hidden rounded-[var(--radius-card)] lg:block xl:w-96">
            <Art src={category.image} variant={category.art} seed={category.order + 3} alt={tr(category.name)} eager />
          </div>
        }
      />
      <section className="container-x py-16 md:py-24">
        <p className="mb-8 text-sm font-bold uppercase tracking-widest text-mute">{fmt(t.services.count, { n: services.length })}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={(i % 3) * 0.06}>
              <ServiceCard service={s} categorySlug={category.slug} />
            </Reveal>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-paper-2/60 py-16 md:py-24">
          <div className="container-x">
            <SectionHeading title={t.services.relatedProjects} />
            <div className="grid gap-8 md:grid-cols-3">
              {related.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
            </div>
          </div>
        </section>
      )}

      <CtaBand />

      <section className="container-x pb-20">
        <SectionHeading title={t.nav.allServices} />
        <div className="grid gap-4 md:grid-cols-3">
          {others.map((c) => (
            <CategoryCard key={c.id} category={c} count={servicesOf(c.id).length} index={c.order} />
          ))}
        </div>
      </section>
    </>
  );
}
