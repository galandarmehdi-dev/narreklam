import type { ArtVariant } from './types';
import { brand } from '@/theme/brand';

/**
 * Generative, clearly-illustrative artwork used wherever real photography has not
 * been uploaded yet. These are abstract compositions — never presented as real work.
 */
const C = brand.colors;

function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const palettes: Record<ArtVariant, [bg: string, a: string, b: string, c: string]> = {
  design: [C.nar, C.paper, C.ink, C.saffron],
  space: [C.ink, C.nar, C.paper, C.teal],
  print: [C.paper, C.nar, C.ink, C.saffron],
  production: [C.ink, C.saffron, C.nar, C.paper],
  promo: [C.blush, C.nar, C.ink, C.teal],
  digital: [C.teal, C.paper, C.nar, C.saffron],
};

export function artSvg(variant: ArtVariant, seed = 1, w = 800, h = 600): string {
  const r = rng(seed * 9301 + variant.length * 49297);
  const [bg, a, b, c] = palettes[variant];
  const parts: string[] = [];
  const dots = (color: string, n: number, size: number) => {
    for (let i = 0; i < n; i++) {
      parts.push(`<circle cx="${(r() * w).toFixed(0)}" cy="${(r() * h).toFixed(0)}" r="${(size * (0.4 + r())).toFixed(1)}" fill="${color}" opacity="${(0.25 + r() * 0.6).toFixed(2)}"/>`);
    }
  };

  switch (variant) {
    case 'design': {
      parts.push(`<circle cx="${w * 0.68}" cy="${h * 0.45}" r="${h * 0.34}" fill="${a}"/>`);
      parts.push(`<circle cx="${w * 0.42}" cy="${h * 0.58}" r="${h * 0.22}" fill="${b}"/>`);
      parts.push(`<path d="M${w * 0.08} ${h * 0.85} C ${w * 0.3} ${h * 0.1}, ${w * 0.6} ${h * 1.1}, ${w * 0.95} ${h * 0.2}" stroke="${c}" stroke-width="10" fill="none" stroke-linecap="round"/>`);
      parts.push(`<rect x="${w * 0.1}" y="${h * 0.12}" width="${w * 0.18}" height="${w * 0.18}" fill="none" stroke="${a}" stroke-width="4"/>`);
      dots(a, 14, 6);
      break;
    }
    case 'space': {
      const vx = w * (0.45 + r() * 0.1);
      const vy = h * 0.42;
      for (let i = 0; i <= 10; i++) {
        const x = (w / 10) * i;
        parts.push(`<line x1="${vx}" y1="${vy}" x2="${x}" y2="${h}" stroke="${c}" stroke-opacity="0.18" stroke-width="2"/>`);
      }
      parts.push(`<rect x="${w * 0.2}" y="${h * 0.18}" width="${w * 0.6}" height="${h * 0.5}" fill="none" stroke="${c}" stroke-width="3"/>`);
      parts.push(`<rect x="${w * 0.3}" y="${h * 0.3}" width="${w * 0.22}" height="${h * 0.12}" fill="${a}"/>`);
      parts.push(`<rect x="${w * 0.56}" y="${h * 0.3}" width="${w * 0.14}" height="${h * 0.38}" fill="${d(a)}" opacity="0.9"/>`);
      parts.push(`<circle cx="${w * 0.8}" cy="${h * 0.2}" r="${h * 0.06}" fill="${C.saffron}"/>`);
      break;
    }
    case 'print': {
      for (let i = 0; i < 4; i++) {
        const x = w * 0.18 + i * 26;
        const y = h * 0.16 + i * 22;
        parts.push(`<rect x="${x}" y="${y}" width="${w * 0.5}" height="${h * 0.62}" rx="6" fill="${i === 3 ? a : i % 2 ? '#fff' : b}" stroke="${b}" stroke-opacity="0.15"/>`);
      }
      ['#00AEEF', '#EC008C', '#FFF200', b].forEach((col, i) => parts.push(`<circle cx="${w * 0.82}" cy="${h * 0.22 + i * 70}" r="24" fill="${col}"/>`));
      parts.push(`<text x="${w * 0.25}" y="${h * 0.62}" font-family="Unbounded, sans-serif" font-weight="800" font-size="${h * 0.16}" fill="${C.paper}">Aa</text>`);
      break;
    }
    case 'production': {
      parts.push(`<text x="${w * 0.1 + 16}" y="${h * 0.78 + 16}" font-family="Unbounded, sans-serif" font-weight="900" font-size="${h * 0.62}" fill="${b}">N</text>`);
      parts.push(`<text x="${w * 0.1}" y="${h * 0.78}" font-family="Unbounded, sans-serif" font-weight="900" font-size="${h * 0.62}" fill="${a}">N</text>`);
      for (let i = 0; i < 6; i++) {
        const cx = w * 0.72;
        const cy = h * 0.5;
        const rr = 40 + i * 28;
        parts.push(`<circle cx="${cx}" cy="${cy}" r="${rr}" fill="none" stroke="${c}" stroke-width="2" stroke-dasharray="${6 + i * 3} ${8 + i * 2}" opacity="${0.9 - i * 0.12}"/>`);
      }
      parts.push(`<line x1="0" y1="${h * 0.86}" x2="${w}" y2="${h * 0.86}" stroke="${C.nar}" stroke-width="3" stroke-dasharray="14 10"/>`);
      break;
    }
    case 'promo': {
      parts.push(`<path d="M${w * 0.3} ${h * 0.2} l${w * 0.08} -${h * 0.06} q${w * 0.04} ${h * 0.06} ${w * 0.12} 0 l${w * 0.08} ${h * 0.06} l${w * 0.08} ${h * 0.12} -${w * 0.07} ${h * 0.05} v${h * 0.5} h-${w * 0.3} v-${h * 0.5} l-${w * 0.07} -${h * 0.05}z" fill="${a}"/>`);
      parts.push(`<circle cx="${w * 0.44}" cy="${h * 0.45}" r="${h * 0.07}" fill="${C.paper}"/>`);
      parts.push(`<rect x="${w * 0.64}" y="${h * 0.48}" width="${w * 0.2}" height="${h * 0.3}" rx="10" fill="${b}"/>`);
      parts.push(`<rect x="${w * 0.7}" y="${h * 0.2}" width="${w * 0.04}" height="${h * 0.26}" rx="6" fill="${c}" transform="rotate(25 ${w * 0.72} ${h * 0.33})"/>`);
      dots(a, 10, 5);
      break;
    }
    case 'digital': {
      const cols = 3;
      for (let i = 0; i < 9; i++) {
        const x = w * 0.3 + (i % cols) * (w * 0.14);
        const y = h * 0.14 + Math.floor(i / cols) * (w * 0.14);
        const fill = [a, b, c][Math.floor(r() * 3)];
        parts.push(`<rect x="${x}" y="${y}" width="${w * 0.125}" height="${w * 0.125}" rx="8" fill="${fill}" opacity="${0.6 + r() * 0.4}"/>`);
      }
      parts.push(`<rect x="${w * 0.08}" y="${h * 0.2}" width="${w * 0.16}" height="${h * 0.6}" rx="18" fill="none" stroke="${a}" stroke-width="4"/>`);
      parts.push(`<circle cx="${w * 0.16}" cy="${h * 0.32}" r="${h * 0.05}" fill="${b}"/>`);
      break;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice"><rect width="${w}" height="${h}" fill="${bg}"/>${parts.join('')}</svg>`;
}

function d(hex: string) {
  return hex === C.nar ? C.narDeep : hex;
}

export const artDataUri = (variant: ArtVariant, seed = 1, w?: number, h?: number) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(artSvg(variant, seed, w, h))}`;
