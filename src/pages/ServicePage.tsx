import { Link, useParams } from 'react-router-dom';
import { ArrowUpRight, Check, MessageCircle, SlidersHorizontal } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useCatalog, useProjects, useSiteData } from '@/data/DataProvider';
import { absUrl, breadcrumbLd, useSeo } from '@/lib/seo';
import { paths } from '@/lib/paths';
import { fmt } from '@/lib/text';
import { iconFor } from '@/lib/icons';
import { whatsappLink } from '@/lib/whatsapp';
import { QUOTE_FIELDS } from '@/lib/quoteFields';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Art } from '@/components/ui/Art';
import { Reveal, SplitText } from '@/components/ui/Reveal';
import { Accordion } from '@/components/ui/Accordion';
import { ServiceCard, ProjectCard } from '@/components/ui/Cards';
import { CtaBand, waServiceMessage } from '@/components/ui/CtaBand';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageLoader } from '@/components/ui/PageLoader';
import { useWhatsAppService } from '@/components/layout/FloatingActions';
import NotFoundPage from './NotFoundPage';

export default function ServicePage() {
  const { categorySlug = '', serviceSlug = '' } = useParams();
  const { t, lang, tr } = useI18n();
  const { catBySlug, svcBySlug, servicesOf, loading } = useCatalog();
  const { settings } = useSiteData();
  const { projects } = useProjects();
  const service = svcBySlug.get(serviceSlug);
  const category = catBySlug.get(categorySlug);
  const valid = service && category && (service.categoryId === category.id);
  const title = valid ? tr(service.title) : '';
  useWhatsAppService(valid ? title : null);

  const faq = valid ? service.faq[lang] || [] : [];
  useSeo({
    title: valid ? tr(service.seoTitle) || fmt(t.seo.serviceTitle, { title }) : t.seo.notFound.t,
    description: valid ? tr(service.seoDescription) || `${tr(service.headline)} ${tr(service.short)}` : t.seo.notFound.d,
    lang,
    path: valid ? (l) => paths.service(l, category.slug, service.slug) : undefined,
    noindex: !valid,
    image: valid ? service.image : undefined,
    jsonLd: valid
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: title,
            serviceType: tr(category.name),
            description: tr(service.intro),
            areaServed: { '@type': 'Country', name: 'Azerbaijan' },
            provider: { '@type': 'Organization', name: settings.companyName, url: absUrl(paths.home(lang)) },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: title,
              itemListElement: service.items.map((i) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: tr(i.name) } })),
            },
          },
          ...(faq.length
            ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }]
            : []),
          breadcrumbLd([
            { name: t.nav.home, url: paths.home(lang) },
            { name: t.nav.services, url: paths.services(lang) },
            { name: tr(category.name), url: paths.category(lang, category.slug) },
            { name: title, url: paths.service(lang, category.slug, service.slug) },
          ]),
        ]
      : undefined,
  });

  if (!valid) return loading ? <PageLoader /> : <NotFoundPage />;

  const Icon = iconFor(service.icon);
  const wa = whatsappLink(settings.whatsapp, fmt(waServiceMessage[lang], { service: title }));
  const related = servicesOf(category.id).filter((s) => s.id !== service.id);
  const relatedProjects = projects.filter((p) => p.serviceIds.some((id) => id === service.id || id === service.slug)).slice(0, 3);
  const apps = service.applications[lang] || [];

  return (
    <>
      {/* Hero */}
      <header className="relative overflow-hidden bg-paper pt-28 pb-14 md:pt-36 md:pb-20">
        <div aria-hidden className="seeds pointer-events-none absolute top-0 left-0 h-80 w-1/2 text-nar/10 [mask-image:radial-gradient(closest-side,black,transparent)]" />
        <div className="container-x relative">
          <Breadcrumbs
            items={[
              { label: t.nav.home, to: paths.home(lang) },
              { label: t.nav.services, to: paths.services(lang) },
              { label: tr(category.name), to: paths.category(lang, category.slug) },
              { label: title },
            ]}
          />
          <div className="mt-10 grid items-end gap-10 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <Link to={paths.category(lang, category.slug)} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-nar ring-1 ring-line hover:ring-nar">
                <Icon className="size-4" aria-hidden /> {tr(category.name)}
              </Link>
              <h1 className="h-page mt-6"><SplitText text={title} /></h1>
              <p className="mt-6 font-display text-xl font-bold tracking-tight md:text-2xl">{tr(service.headline)}</p>
              <p className="lead mt-4 max-w-2xl">{tr(service.intro)}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={paths.quote(lang, service.slug)} className="btn btn-primary group">
                  {t.common.getQuote}
                  <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45" aria-hidden />
                </Link>
                {wa && (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                    <MessageCircle className="size-5" aria-hidden /> {t.common.whatsapp}
                  </a>
                )}
              </div>
            </div>
            <Reveal className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
              <Art src={service.image} variant={category.art} seed={service.order * 13 + category.order + 7} alt={title} eager />
              {!service.image && <span className="absolute bottom-3 left-3 rounded-full bg-ink/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{t.common.illustrative}</span>}
            </Reveal>
          </div>
        </div>
      </header>

      {/* What's included */}
      <section className="container-x py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="h-section">{t.services.included}</h2>
            <p className="mt-4 text-mute">{tr(service.short)}</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {service.items.map((it, i) => (
              <Reveal as="li" key={it.id} delay={(i % 2) * 0.05} className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-4 transition-colors hover:border-ink">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-paper font-display text-sm font-bold text-nar transition-colors group-hover:bg-nar group-hover:text-white">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-semibold">{tr(it.name)}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Applications + options */}
      <section className="on-dark bg-ink py-16 text-white md:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          {apps.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold md:text-4xl">{t.services.applications}</h2>
              <ul className="mt-8 space-y-3">
                {apps.map((a, i) => (
                  <Reveal as="li" key={i} delay={i * 0.05} className="flex gap-4 rounded-2xl bg-white/5 p-5">
                    <Check className="mt-0.5 size-5 shrink-0 text-saffron" aria-hidden />
                    <span className="text-white/85">{a}</span>
                  </Reveal>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">{t.services.options}</h2>
            <ul className="mt-8 flex flex-wrap gap-2">
              {(service.quoteFields.length ? service.quoteFields : []).map((k) => (
                <li key={k} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-semibold text-white/90">
                  <SlidersHorizontal className="size-4 text-saffron" aria-hidden /> {QUOTE_FIELDS[k]?.label(t)}
                </li>
              ))}
              <li className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-semibold text-white/90">
                <SlidersHorizontal className="size-4 text-saffron" aria-hidden /> {t.quote.fields.deadline}
              </li>
              <li className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-semibold text-white/90">
                <SlidersHorizontal className="size-4 text-saffron" aria-hidden /> {t.quote.fields.files}
              </li>
            </ul>
            <p className="mt-6 text-sm text-white/60">{t.services.optionsNote}</p>
            <Link to={paths.quote(lang, service.slug)} className="btn btn-light mt-8">{t.common.order}</Link>
          </div>
        </div>
      </section>

      {relatedProjects.length > 0 && (
        <section className="container-x py-16 md:py-24">
          <SectionHeading title={t.services.relatedProjects} />
          <div className="grid gap-8 md:grid-cols-3">
            {relatedProjects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
        </section>
      )}

      {faq.length > 0 && (
        <section className="container-x py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <h2 className="h-section">{t.services.faq}</h2>
            <Accordion items={faq} />
          </div>
        </section>
      )}

      <CtaBand title={t.services.ctaTitle} text={t.services.ctaText} service={service.slug} serviceName={title} />

      {related.length > 0 && (
        <section className="container-x pb-20">
          <SectionHeading kicker={t.services.inCategory} title={t.services.related} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.slice(0, 6).map((s) => <ServiceCard key={s.id} service={s} categorySlug={category.slug} />)}
          </div>
        </section>
      )}
    </>
  );
}
