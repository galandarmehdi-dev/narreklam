import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Expand, Share2, X } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useCatalog, useProjects } from '@/data/DataProvider';
import { breadcrumbLd, useSeo } from '@/lib/seo';
import { paths } from '@/lib/paths';
import { fmt } from '@/lib/text';
import { coverOf } from '@/data/mappers';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ProjectCard } from '@/components/ui/Cards';
import { CtaBand } from '@/components/ui/CtaBand';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageLoader } from '@/components/ui/PageLoader';
import { SplitText } from '@/components/ui/Reveal';
import NotFoundPage from './NotFoundPage';

export default function ProjectPage() {
  const { slug = '' } = useParams();
  const { t, lang, tr } = useI18n();
  const { projects, status } = useProjects();
  const { catById, svcById } = useCatalog();
  const project = projects.find((p) => p.slug === slug);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const cover = project ? coverOf(project) : null;

  useSeo({
    title: project ? `${tr(project.title)} — ${t.nav.portfolio}${t.meta.titleSuffix}` : t.seo.notFound.t,
    description: project ? tr(project.summary) || tr(project.description).slice(0, 160) : t.seo.notFound.d,
    lang,
    path: project ? (l) => paths.project(l, project.slug) : undefined,
    image: cover?.url,
    type: 'article',
    noindex: !project || project.isDemo,
    jsonLd: project
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: tr(project.title),
            description: tr(project.summary),
            image: project.images.filter((i) => !i.url.startsWith('data:')).map((i) => i.url),
            ...(project.projectDate ? { dateCreated: project.projectDate } : {}),
          },
          breadcrumbLd([
            { name: t.nav.home, url: paths.home(lang) },
            { name: t.nav.portfolio, url: paths.portfolio(lang) },
            { name: tr(project.title), url: paths.project(lang, project.slug) },
          ]),
        ]
      : undefined,
  });

  if (!project) return status === 'ready' || status === 'error' ? <NotFoundPage /> : <PageLoader />;

  const cat = project.categoryId ? catById.get(project.categoryId) : undefined;
  const services = project.serviceIds.map((id) => svcById.get(id)).filter(Boolean);
  const related = projects.filter((p) => p.id !== project.id && (p.categoryId === project.categoryId || p.serviceIds.some((s) => project.serviceIds.includes(s)))).slice(0, 3);
  const images = cover ? [cover, ...project.images.filter((i) => i.id !== cover.id)] : project.images;

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: tr(project.title), url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* user cancelled share */
    }
  };

  const facts = [
    cat && { k: t.portfolio.category, v: <Link className="link-underline" to={paths.category(lang, cat.slug)}>{tr(cat.name)}</Link> },
    project.clientName && { k: t.portfolio.client, v: project.clientName },
    project.projectDate && { k: t.portfolio.date, v: new Date(project.projectDate).toLocaleDateString(lang, { year: 'numeric', month: 'long' }) },
    tr(project.location || undefined) && { k: t.portfolio.location, v: tr(project.location || undefined) },
    tr(project.materials) && tr(project.materials) !== '—' && { k: t.portfolio.materials, v: tr(project.materials) },
  ].filter(Boolean) as { k: string; v: React.ReactNode }[];

  return (
    <>
      <header className="bg-paper pt-28 md:pt-36">
        <div className="container-x">
          <Breadcrumbs items={[{ label: t.nav.home, to: paths.home(lang) }, { label: t.nav.portfolio, to: paths.portfolio(lang) }, { label: tr(project.title) }]} />
          {project.isDemo && <p className="mt-6 rounded-2xl bg-saffron/25 p-4 text-sm font-semibold" role="note">{t.common.demoNotice}</p>}
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <h1 className="h-page"><SplitText text={tr(project.title)} /></h1>
            <p className="lead">{tr(project.summary)}</p>
          </div>
        </div>
        {images[0] && (
          <div className="container-x mt-12">
            <button type="button" onClick={() => setLightbox(0)} className="group relative block aspect-[16/9] w-full overflow-hidden rounded-[2rem] bg-paper-2" aria-label={`${t.portfolio.gallery}: ${tr(images[0].alt) || tr(project.title)}`}>
              <img src={images[0].url} alt={tr(images[0].alt) || tr(project.title)} className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.03]" style={{ objectPosition: `${images[0].focalX ?? 50}% ${images[0].focalY ?? 50}%` }} />
              <span className="absolute right-5 bottom-5 grid size-12 place-items-center rounded-full bg-white/90 text-ink backdrop-blur"><Expand className="size-5" aria-hidden /></span>
            </button>
          </div>
        )}
      </header>

      <section className="container-x py-16 md:py-24">
        <div className="grid gap-14 lg:grid-cols-[1fr_22rem]">
          <div className="prose-nar max-w-3xl">
            {tr(project.description).split(/\n{2,}/).map((para, i) => <p key={i} className="text-lg">{para}</p>)}
            {tr(project.scope) && (
              <>
                <h2>{t.portfolio.scope}</h2>
                <p>{tr(project.scope)}</p>
              </>
            )}
          </div>
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {facts.length > 0 && (
              <dl className="divide-y divide-line rounded-[var(--radius-card)] bg-white p-6">
                {facts.map((f) => (
                  <div key={f.k} className="flex justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <dt className="text-sm text-mute">{f.k}</dt>
                    <dd className="text-right text-sm font-bold">{f.v}</dd>
                  </div>
                ))}
              </dl>
            )}
            {services.length > 0 && (
              <div className="rounded-[var(--radius-card)] bg-white p-6">
                <h2 className="mb-4 font-sans text-sm font-bold uppercase tracking-wider text-mute">{t.portfolio.servicesUsed}</h2>
                <ul className="flex flex-wrap gap-2">
                  {services.map((s) => {
                    const c = catById.get(s!.categoryId);
                    return (
                      <li key={s!.id}>
                        {c ? <Link to={paths.service(lang, c.slug, s!.slug)} className="chip hover:border-nar hover:text-nar">{tr(s!.title)}</Link> : <span className="chip">{tr(s!.title)}</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <button type="button" onClick={share} className="btn btn-ghost w-full" aria-live="polite">
              <Share2 className="size-4" aria-hidden /> {copied ? t.portfolio.copied : t.portfolio.share}
            </button>
          </aside>
        </div>

        {images.length > 1 && (
          <div className="mt-16">
            <h2 className="mb-6 text-2xl font-bold">{t.portfolio.gallery} <span className="text-mute">· {fmt(t.portfolio.photos, { n: images.length })}</span></h2>
            <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {images.slice(1).map((im, i) => (
                <li key={im.id} className="mb-4 break-inside-avoid">
                  <button type="button" onClick={() => setLightbox(i + 1)} className="group block w-full overflow-hidden rounded-2xl bg-paper-2" aria-label={`${t.portfolio.gallery} ${i + 2}`}>
                    <img src={im.url} alt={tr(im.alt) || tr(project.title)} loading="lazy" decoding="async" className="w-full transition-transform duration-700 group-hover:scale-[1.03]" />
                  </button>
                  {tr(im.caption) && <p className="mt-2 text-sm text-mute">{tr(im.caption)}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <CtaBand title={t.portfolio.similar} service={services[0]?.slug} serviceName={services[0] ? tr(services[0].title) : undefined} />

      {related.length > 0 && (
        <section className="container-x pb-20">
          <SectionHeading title={t.portfolio.related} />
          <div className="grid gap-8 md:grid-cols-3">{related.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}</div>
        </section>
      )}

      <AnimatePresence>
        {lightbox !== null && <Lightbox images={images.map((i) => ({ url: i.url, alt: tr(i.alt) || tr(project.title) }))} index={lightbox} onChange={setLightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </>
  );
}

function Lightbox({ images, index, onChange, onClose }: { images: { url: string; alt: string }[]; index: number; onChange: (i: number) => void; onClose: () => void }) {
  const { t } = useI18n();
  const next = useCallback(() => onChange((index + 1) % images.length), [index, images.length, onChange]);
  const prev = useCallback(() => onChange((index - 1 + images.length) % images.length), [index, images.length, onChange]);
  const [touchX, setTouchX] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [next, prev, onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={t.portfolio.gallery}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/95 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
        setTouchX(null);
      }}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={images[index].url}
          alt={images[index].alt}
          className="max-h-[85vh] max-w-full rounded-xl object-contain"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      </AnimatePresence>
      <p className="absolute top-5 left-5 text-sm font-bold text-white/70">{index + 1} / {images.length}</p>
      <button type="button" autoFocus onClick={onClose} aria-label={t.a11y.closeGallery} className="absolute top-4 right-4 grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><X className="size-6" aria-hidden /></button>
      {images.length > 1 && (
        <>
          <button type="button" onClick={prev} aria-label={t.a11y.prevImage} className="absolute left-3 grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 md:left-6"><ChevronLeft className="size-6" aria-hidden /></button>
          <button type="button" onClick={next} aria-label={t.a11y.nextImage} className="absolute right-3 grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 md:right-6"><ChevronRight className="size-6" aria-hidden /></button>
        </>
      )}
    </motion.div>
  );
}
