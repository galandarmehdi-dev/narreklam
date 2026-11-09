import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { useI18n } from '@/i18n';
import { paths } from '@/lib/paths';
import { SplitText } from '@/components/ui/Reveal';
import { ProductGlyph, type GlyphKind } from './ProductGlyph';

interface Tile {
  kind: GlyphKind;
  x: string;
  y: string;
  w: string;
  depth: number;
  rotate: number;
  label: number; // index into showcase.items
  delay: number;
}

const TILES: Tile[] = [
  { kind: 'letters', x: '4%', y: '6%', w: '44%', depth: 28, rotate: -4, label: 4, delay: 0.5 },
  { kind: 'card', x: '52%', y: '2%', w: '40%', depth: 18, rotate: 6, label: 0, delay: 0.6 },
  { kind: 'vehicle', x: '42%', y: '38%', w: '54%', depth: 36, rotate: 0, label: 3, delay: 0.7 },
  { kind: 'uniform', x: '2%', y: '44%', w: '34%', depth: 22, rotate: -6, label: 2, delay: 0.8 },
  { kind: 'banner', x: '30%', y: '70%', w: '40%', depth: 14, rotate: 3, label: 1, delay: 0.9 },
  { kind: 'cut', x: '72%', y: '70%', w: '26%', depth: 30, rotate: 0, label: 7, delay: 1.0 },
];

function FloatingTile({ tile, mx, my, label }: { tile: Tile; mx: MotionValue<number>; my: MotionValue<number>; label: string }) {
  const x = useTransform(mx, (v) => v * tile.depth);
  const y = useTransform(my, (v) => v * tile.depth);
  return (
    <motion.figure
      className="group absolute"
      style={{ left: tile.x, top: tile.y, width: tile.w, x, y }}
      initial={{ opacity: 0, scale: 0.85, rotate: tile.rotate - 8 }}
      animate={{ opacity: 1, scale: 1, rotate: tile.rotate }}
      transition={{ duration: 1, delay: tile.delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="rounded-3xl bg-white/80 p-2 shadow-[0_30px_60px_-30px_rgba(23,23,23,0.45)] ring-1 ring-black/5 backdrop-blur transition-transform duration-500 group-hover:-translate-y-1.5 group-hover:rotate-0">
        <ProductGlyph kind={tile.kind} className="h-auto w-full" />
      </div>
      <figcaption className="mt-2 ml-2 inline-block rounded-full bg-ink px-2.5 py-1 text-[0.65rem] font-bold tracking-wide text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:text-xs">
        {label}
      </figcaption>
    </motion.figure>
  );
}

export function Hero() {
  const { t, lang } = useI18n();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const mxRaw = useMotionValue(0);
  const myRaw = useMotionValue(0);
  const mx = useSpring(mxRaw, { stiffness: 60, damping: 18 });
  const my = useSpring(myRaw, { stiffness: 60, damping: 18 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const artY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '18%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-12%']);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      mxRaw.set(e.clientX / window.innerWidth - 0.5);
      myRaw.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduce, mxRaw, myRaw]);

  const lineWords = t.home.hero.line.split(' ');

  return (
    <section ref={ref} className="relative overflow-hidden bg-paper pt-28 pb-16 md:pt-36 md:pb-24" aria-labelledby="hero-title">
      <div aria-hidden className="seeds pointer-events-none absolute top-0 right-0 h-[70%] w-[55%] text-nar/15 [mask-image:radial-gradient(closest-side,black,transparent)]" />
      <div className="container-x relative grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-6">
        <motion.div style={{ y: textY }} className="relative z-10">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="kicker mb-6 text-mute">
            {t.home.hero.kicker}
          </motion.p>
          <h1 id="hero-title" className="h-display">
            <SplitText text={t.home.hero.title} />
          </h1>
          <p className="mt-6 flex flex-wrap gap-x-3 gap-y-1 font-display text-xl font-bold tracking-tight md:text-3xl" aria-label={t.home.hero.line}>
            {lineWords.map((w, i) => (
              <motion.span
                key={i}
                aria-hidden
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.12, duration: 0.6 }}
                className={i % 2 === 0 ? 'text-nar' : 'text-ink'}
              >
                {w}
              </motion.span>
            ))}
          </p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.8 }} className="lead mt-6 max-w-xl">
            {t.home.hero.text}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05, duration: 0.7 }} className="mt-9 flex flex-wrap gap-3">
            <Link to={paths.services(lang)} className="btn btn-dark group">
              {t.home.hero.ctaServices}
              <ArrowUpRight className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </Link>
            <Link to={paths.quote(lang)} className="btn btn-primary">{t.home.hero.ctaQuote}</Link>
          </motion.div>
        </motion.div>

        {/* Interactive composition of advertising products — illustrative, code-drawn. */}
        <motion.div style={{ y: artY }} className="relative mx-auto aspect-square w-full max-w-[640px]" aria-hidden>
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-[12%] rounded-full bg-nar"
          >
            <div className="seeds absolute inset-0 rounded-full text-white/25" />
            <div className="absolute inset-[18%] rounded-full bg-nar-deep/40 blur-2xl" />
          </motion.div>
          {TILES.map((tile) => (
            <FloatingTile key={tile.kind} tile={tile} mx={mx} my={my} label={t.home.showcase.items[tile.label]} />
          ))}
        </motion.div>
      </div>
      <div className="container-x mt-10 hidden md:block">
        <a href="#services" className="inline-flex items-center gap-3 text-sm font-semibold text-mute hover:text-ink">
          <span className="grid size-10 place-items-center rounded-full border border-line">
            <ArrowDown className="size-4 animate-bounce motion-reduce:animate-none" aria-hidden />
          </span>
          {t.home.hero.scroll}
        </a>
      </div>
    </section>
  );
}

export function Marquee() {
  const { t } = useI18n();
  const items = [...t.home.marquee, ...t.home.marquee];
  return (
    <div className="marquee-wrap relative overflow-hidden border-y border-ink bg-ink py-5 text-white" aria-hidden>
      <div className="marquee flex w-max gap-10 whitespace-nowrap">
        {items.map((w, i) => (
          <span key={i} className="inline-flex items-center gap-10 font-display text-2xl font-bold md:text-4xl">
            <span className={i % 3 === 1 ? 'text-stroke' : ''}>{w}</span>
            <span className="size-3 rounded-full bg-nar" />
          </span>
        ))}
      </div>
    </div>
  );
}
