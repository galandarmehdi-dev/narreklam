import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import {
  ArrowUpRight, Instagram, Mail, MessageCircle, Phone, PenTool, Ruler, Printer, Factory, Gift, Truck,
  Layers, Lightbulb, Workflow, MessagesSquare,
} from 'lucide-react';
import { useI18n } from '@/i18n';
import { useCatalog, useProjects, useSiteData } from '@/data/DataProvider';
import { paths } from '@/lib/paths';
import { telLink, whatsappLink } from '@/lib/whatsapp';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CategoryCard, ProjectCard } from '@/components/ui/Cards';
import { waGeneralMessage } from '@/components/ui/CtaBand';
import { ProductGlyph, type GlyphKind } from './ProductGlyph';

/* ── Services: six category cards in a bento grid ───────────────────────── */
export function ServicesSection() {
  const { t, lang } = useI18n();
  const { categories, servicesOf } = useCatalog();
  return (
    <section id="services" className="container-x py-20 md:py-32">
      <SectionHeading
        kicker={t.home.services.kicker}
        title={t.home.services.title}
        text={t.home.services.text}
        action={
          <Link to={paths.services(lang)} className="btn btn-ghost group">
            {t.nav.allServices}
            <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45" aria-hidden />
          </Link>
        }
      />
      {/* Editorial rhythm: rows of two with alternating widths (7/5, 5/7, 6/6). */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-5">
        {categories.map((c, i) => (
          <Reveal key={c.id} delay={(i % 2) * 0.08} className={['lg:col-span-7', 'lg:col-span-5', 'lg:col-span-5', 'lg:col-span-7', 'lg:col-span-6', 'lg:col-span-6'][i % 6]}>
            <CategoryCard category={c} count={servicesOf(c.id).length} index={i} size={i < 2 ? 'lg' : 'md'} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ── Featured work: asymmetric editorial gallery ────────────────────────── */
export function FeaturedWork() {
  const { t, lang } = useI18n();
  const { projects, status } = useProjects();
  const featured = (projects.filter((p) => p.featured).length ? projects.filter((p) => p.featured) : projects).slice(0, 4);
  return (
    <section className="bg-paper-2/60 py-20 md:py-32">
      <div className="container-x">
        <SectionHeading
          kicker={t.home.work.kicker}
          title={t.home.work.title}
          text={t.home.work.text}
          action={
            featured.length > 0 && (
              <Link to={paths.portfolio(lang)} className="btn btn-dark group">
                {t.home.work.all}
                <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45" aria-hidden />
              </Link>
            )
          }
        />
        {status === 'loading' || status === 'idle' ? (
          <div className="grid gap-6 md:grid-cols-2" aria-busy="true" aria-label={t.common.loading}>
            {[0, 1].map((i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-[var(--radius-card)] bg-line/60" />)}
          </div>
        ) : featured.length === 0 ? (
          <Reveal className="flex flex-col items-center gap-4 rounded-[var(--radius-card)] border border-dashed border-line bg-white px-6 py-16 text-center">
            <Layers className="size-10 text-nar" aria-hidden />
            <p className="max-w-md text-lg text-mute">{t.home.work.empty}</p>
          </Reveal>
        ) : (
          <div className="grid gap-x-6 gap-y-12 md:grid-cols-12">
            {featured.map((p, i) => {
              const layout = ['md:col-span-7', 'md:col-span-5 md:mt-24', 'md:col-span-5', 'md:col-span-7 md:-mt-16'][i] || 'md:col-span-6';
              return (
                <Reveal key={p.id} delay={(i % 2) * 0.1} className={layout}>
                  <ProjectCard project={p} tall={i === 1 || i === 2} index={i} />
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Capabilities: connected nodes around one idea ──────────────────────── */
const NODE_ICONS = [PenTool, Ruler, Printer, Factory, Gift, Truck];

export function Capabilities() {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const nodes = t.home.capabilities.nodes;
  return (
    <section className="on-dark relative overflow-hidden bg-ink py-20 text-white md:py-32">
      <div aria-hidden className="seeds pointer-events-none absolute inset-0 text-white/[0.06]" />
      <div className="container-x relative grid items-center gap-16 lg:grid-cols-2">
        <div>
          <SectionHeading kicker={t.home.capabilities.kicker} title={t.home.capabilities.title} text={t.home.capabilities.text} tone="light" className="!mb-10" />
          <ol className="grid gap-2 sm:grid-cols-2">
            {nodes.map((n, i) => {
              const Icon = NODE_ICONS[i] || Layers;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    aria-pressed={active === i}
                    className={`flex w-full items-start gap-4 rounded-2xl p-4 text-left transition-colors duration-300 ${active === i ? 'bg-white text-ink' : 'bg-white/5 text-white hover:bg-white/10'}`}
                  >
                    <span className={`grid size-10 shrink-0 place-items-center rounded-full ${active === i ? 'bg-nar text-white' : 'bg-white/10'}`}>
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block font-display font-bold">{n.t}</span>
                      <span className={`mt-1 block text-sm ${active === i ? 'text-mute' : 'text-white/60'}`}>{n.d}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
        <Reveal className="relative mx-auto aspect-square w-full max-w-[520px]" aria-hidden>
          <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
            <circle cx="200" cy="200" r="150" fill="none" stroke="rgba(255,255,255,0.12)" strokeDasharray="4 8" />
            <circle cx="200" cy="200" r="95" fill="none" stroke="rgba(255,255,255,0.08)" />
            {nodes.map((_, i) => {
              const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
              const x = 200 + Math.cos(a) * 150;
              const y = 200 + Math.sin(a) * 150;
              return (
                <g key={i}>
                  <line x1="200" y1="200" x2={x} y2={y} stroke={active === i ? '#C51D34' : 'rgba(255,255,255,0.15)'} strokeWidth={active === i ? 3 : 1.5} style={{ transition: 'all .4s' }} />
                  <circle cx={x} cy={y} r={active === i ? 26 : 18} fill={active === i ? '#C51D34' : '#262626'} stroke="rgba(255,255,255,0.25)" style={{ transition: 'all .4s' }} />
                  <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff" fontFamily="Unbounded, sans-serif">{i + 1}</text>
                </g>
              );
            })}
            <circle cx="200" cy="200" r="62" fill="#C51D34" />
            <circle cx="200" cy="200" r="62" fill="url(#seedPattern)" />
            <defs>
              <pattern id="seedPattern" width="14" height="14" patternUnits="userSpaceOnUse">
                <circle cx="7" cy="7" r="1.6" fill="rgba(255,255,255,0.35)" />
              </pattern>
            </defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <p className="max-w-[9rem] text-center font-display text-sm font-bold leading-tight">{nodes[active]?.t}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Process: five steps with a scroll-driven progress line ─────────────── */
export function Process() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 60%'] });
  const width = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const steps = t.home.process.steps;
  return (
    <section className="container-x py-20 md:py-32">
      <SectionHeading kicker={t.home.process.kicker} title={t.home.process.title} />
      <div ref={ref} className="relative">
        <div aria-hidden className="absolute top-7 right-0 left-0 hidden h-0.5 bg-line lg:block">
          <motion.div style={{ width }} className="h-full bg-nar" />
        </div>
        <ol className="grid gap-8 lg:grid-cols-5 lg:gap-6">
          {steps.map((s, i) => (
            <Reveal as="li" key={i} delay={i * 0.08} className="relative flex gap-5 lg:block">
              <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-full border-2 border-ink bg-paper font-display text-lg font-extrabold">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="lg:mt-6">
                <h3 className="text-lg font-bold md:text-xl">{s.t}</h3>
                <p className="mt-2 text-mute">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── Product showcase: horizontal rail of illustrated products ──────────── */
const SHOWCASE: { kind: GlyphKind; service: string; tint: string }[] = [
  { kind: 'card', service: 'polygraphy', tint: 'bg-blush' },
  { kind: 'banner', service: 'large-format-printing', tint: 'bg-paper-2' },
  { kind: 'uniform', service: 'clothing-branding', tint: 'bg-[#e7efe9]' },
  { kind: 'vehicle', service: 'vehicle-branding', tint: 'bg-[#fdf0d5]' },
  { kind: 'letters', service: 'outdoor-advertising', tint: 'bg-paper-2' },
  { kind: 'stand', service: 'interior-advertising', tint: 'bg-blush' },
  { kind: 'gift', service: 'promotional-merchandise', tint: 'bg-[#fdf0d5]' },
  { kind: 'cut', service: 'laser-cutting', tint: 'bg-[#e7efe9]' },
];

export function Showcase() {
  const { t, lang } = useI18n();
  const { svcBySlug, catById } = useCatalog();
  return (
    <section className="py-20 md:py-28">
      <div className="container-x">
        <SectionHeading kicker={t.home.showcase.kicker} title={t.home.showcase.title} text={t.home.showcase.text} />
      </div>
      <ul className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:px-6 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-[max(2.5rem,calc((100vw-1400px)/2+2.5rem))]">
        {SHOWCASE.map((item, i) => {
          const svc = svcBySlug.get(item.service);
          const cat = svc ? catById.get(svc.categoryId) : undefined;
          const label = t.home.showcase.items[i];
          const inner = (
            <>
              <div className={`grid aspect-[5/4] place-items-center rounded-[var(--radius-card)] p-6 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[0.97] ${item.tint}`}>
                <ProductGlyph kind={item.kind} className="w-4/5 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-110 group-hover:-rotate-2" />
              </div>
              <p className="mt-4 flex items-center justify-between font-bold">
                {label}
                <ArrowUpRight className="size-5 text-mute transition-colors group-hover:text-nar" aria-hidden />
              </p>
            </>
          );
          return (
            <Reveal as="li" key={item.kind} delay={(i % 4) * 0.06} className="w-[72%] shrink-0 snap-start sm:w-[40%] lg:w-auto">
              {svc && cat ? (
                <Link to={paths.service(lang, cat.slug, svc.slug)} className="group block">{inner}</Link>
              ) : (
                <div className="group">{inner}</div>
              )}
            </Reveal>
          );
        })}
      </ul>
      <p className="container-x mt-4 text-xs text-mute">{t.common.illustrative}</p>
    </section>
  );
}

/* ── Why NarReklam ──────────────────────────────────────────────────────── */
const WHY_ICONS = [Layers, Lightbulb, Workflow, MessagesSquare];

export function Why() {
  const { t } = useI18n();
  return (
    <section className="container-x py-20 md:py-28">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading kicker={t.home.why.kicker} title={t.home.why.title} className="!mb-0" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {t.home.why.items.map((it, i) => {
            const Icon = WHY_ICONS[i] || Layers;
            return (
              <Reveal key={i} delay={(i % 2) * 0.1} className={`card p-7 md:p-8 ${i % 2 === 1 ? 'sm:translate-y-10' : ''}`}>
                <Icon className="size-8 text-nar" aria-hidden />
                <h3 className="mt-6 text-xl font-bold">{it.t}</h3>
                <p className="mt-3 text-mute">{it.d}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Instagram: admin-managed gallery (no scraping, no fake feed) ───────── */
export function InstagramSection() {
  const { t } = useI18n();
  const { settings, instagram } = useSiteData();
  if (!settings.instagram && instagram.length === 0) return null;
  return (
    <section className="container-x py-16 md:py-24">
      <div className="grid gap-10 rounded-[2rem] bg-white p-6 md:p-12 lg:grid-cols-[1fr_1.5fr] lg:items-center">
        <div>
          <p className="kicker mb-5 text-mute">{t.home.instagram.kicker}</p>
          <h2 className="h-section !text-[clamp(1.75rem,3.5vw,3rem)]">{t.home.instagram.title}</h2>
          <p className="mt-4 text-mute">{t.home.instagram.text}</p>
          {settings.instagram && (
            <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="btn mt-8 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white hover:opacity-90">
              <Instagram className="size-5" aria-hidden /> {t.home.instagram.button}
            </a>
          )}
        </div>
        {instagram.length > 0 && (
          <ul className="grid grid-cols-3 gap-2 md:gap-3">
            {instagram.slice(0, 6).map((p) => (
              <li key={p.id}>
                <a href={p.postUrl} target="_blank" rel="noopener noreferrer" className="group block aspect-square overflow-hidden rounded-2xl bg-paper-2">
                  <img src={p.imageUrl} alt={p.caption.az || 'Instagram'} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* ── Contact strip shown above the footer on the homepage ───────────────── */
export function ContactStrip() {
  const { t, lang } = useI18n();
  const { settings } = useSiteData();
  const wa = whatsappLink(settings.whatsapp, waGeneralMessage[lang]);
  const items = [
    settings.phone && { href: telLink(settings.phone), label: t.contact.phone, value: settings.phone, Icon: Phone },
    wa && { href: wa, label: t.contact.whatsapp, value: settings.whatsapp, Icon: MessageCircle, external: true },
    settings.email && { href: `mailto:${settings.email}`, label: t.contact.email, value: settings.email, Icon: Mail },
    settings.instagram && { href: settings.instagram, label: 'Instagram', value: settings.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, ''), Icon: Instagram, external: true },
  ].filter(Boolean) as { href: string; label: string; value: string; Icon: typeof Phone; external?: boolean }[];
  if (!items.length) return null;
  return (
    <section className="container-x pb-16 md:pb-24">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ href, label, value, Icon, external }) => (
          <li key={label}>
            <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-ink">
              <span className="grid size-12 place-items-center rounded-full bg-paper text-nar transition-colors group-hover:bg-nar group-hover:text-white"><Icon className="size-5" aria-hidden /></span>
              <span className="min-w-0">
                <span className="block text-xs font-bold uppercase tracking-wider text-mute">{label}</span>
                <span className="block truncate font-bold">{value}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
