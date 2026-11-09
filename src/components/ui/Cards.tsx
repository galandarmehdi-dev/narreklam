import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Category, PortfolioProject, Service } from '@/lib/types';
import { useI18n } from '@/i18n';
import { paths } from '@/lib/paths';
import { iconFor } from '@/lib/icons';
import { fmt } from '@/lib/text';
import { coverOf } from '@/data/mappers';
import { useCatalog } from '@/data/DataProvider';
import { Art } from './Art';

export function CategoryCard({ category, count, index = 0, size = 'md' }: { category: Category; count: number; index?: number; size?: 'md' | 'lg' }) {
  const { tr, t, lang } = useI18n();
  const Icon = iconFor(category.icon);
  return (
    <Link
      to={paths.category(lang, category.slug)}
      className={`group relative isolate flex flex-col justify-end overflow-hidden rounded-[var(--radius-card)] bg-ink text-white ${size === 'lg' ? 'min-h-[26rem] md:min-h-[32rem]' : 'min-h-[22rem] md:min-h-[26rem]'}`}
    >
      <div className="absolute inset-0 -z-10 transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]">
        <Art src={category.image} variant={category.art} seed={index + 3} alt={tr(category.name)} />
      </div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/55 to-ink/0 transition-opacity duration-500 group-hover:opacity-90" />
      <div className="absolute top-5 left-5 flex items-center gap-2">
        <span className="grid size-11 place-items-center rounded-full bg-white/95 text-ink backdrop-blur">
          <Icon className="size-5" aria-hidden />
        </span>
        <span className="rounded-full bg-ink/50 px-3 py-1 text-xs font-bold backdrop-blur">{fmt(t.services.count, { n: count })}</span>
      </div>
      <span aria-hidden className="absolute top-5 right-5 grid size-11 place-items-center rounded-full bg-nar text-white opacity-0 transition-all duration-500 group-hover:rotate-0 group-hover:opacity-100 -rotate-45">
        <ArrowUpRight className="size-5" />
      </span>
      <div className="p-6 md:p-8">
        <p className="mb-2 text-sm font-semibold text-white/70">{String(index + 1).padStart(2, '0')} — {tr(category.tagline)}</p>
        <h3 className="text-2xl font-bold md:text-3xl">{tr(category.name)}</h3>
        <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-white/75 md:max-h-0 md:overflow-hidden md:opacity-0 md:transition-all md:duration-500 md:group-hover:max-h-40 md:group-hover:opacity-100 md:group-focus-visible:max-h-40 md:group-focus-visible:opacity-100">
          {tr(category.description)}
        </p>
      </div>
    </Link>
  );
}

export function ServiceCard({ service, categorySlug }: { service: Service; categorySlug: string }) {
  const { tr, lang, t } = useI18n();
  const Icon = iconFor(service.icon);
  const items = service.items.slice(0, 4);
  return (
    <Link
      to={paths.service(lang, categorySlug, service.slug)}
      className="group relative flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-ink hover:shadow-[0_30px_60px_-30px_rgba(23,23,23,0.35)] md:p-8"
    >
      <div className="flex items-start justify-between">
        <span className="grid size-14 place-items-center rounded-2xl bg-paper text-nar transition-colors duration-500 group-hover:bg-nar group-hover:text-white">
          <Icon className="size-6" aria-hidden />
        </span>
        <ArrowUpRight className="size-6 text-mute transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-nar" aria-hidden />
      </div>
      <h3 className="mt-8 text-xl font-bold md:text-2xl">{tr(service.title)}</h3>
      <p className="mt-3 text-mute">{tr(service.short)}</p>
      {items.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2" aria-label={t.services.included}>
          {items.map((it) => (
            <li key={it.id} className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink-3">{tr(it.name)}</li>
          ))}
          {service.items.length > items.length && <li className="rounded-full px-2 py-1 text-xs font-bold text-mute">+{service.items.length - items.length}</li>}
        </ul>
      )}
    </Link>
  );
}

export function ProjectCard({ project, className = '', tall = false, index = 0 }: { project: PortfolioProject; className?: string; tall?: boolean; index?: number }) {
  const { tr, lang, t } = useI18n();
  const { catById } = useCatalog();
  const cover = coverOf(project);
  const cat = project.categoryId ? catById.get(project.categoryId) : undefined;
  return (
    <Link to={paths.project(lang, project.slug)} className={`group block ${className}`}>
      <div className={`relative overflow-hidden rounded-[var(--radius-card)] bg-paper-2 ${tall ? 'aspect-[4/5]' : 'aspect-[4/3]'}`}>
        <div className="h-full w-full transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]">
          <Art src={cover?.url} variant={cat?.art || 'design'} seed={index + 5} alt={cover ? tr(cover.alt) || tr(project.title) : tr(project.title)} focal={cover ? { x: cover.focalX, y: cover.focalY } : undefined} />
        </div>
        {project.isDemo && (
          <span className="absolute top-4 left-4 rounded-full bg-saffron px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-ink">{t.common.demo}</span>
        )}
        <span aria-hidden className="absolute right-4 bottom-4 grid size-12 translate-y-3 place-items-center rounded-full bg-white text-ink opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="size-5" />
        </span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight md:text-xl">{tr(project.title)}</h3>
          <p className="mt-1 text-sm text-mute">{tr(project.summary)}</p>
        </div>
        {cat && <span className="chip shrink-0 text-xs">{tr(cat.name).split(/[,·]/)[0]}</span>}
      </div>
    </Link>
  );
}
