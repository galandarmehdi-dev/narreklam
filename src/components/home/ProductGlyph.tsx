/**
 * Hand-drawn, code-generated product illustrations (no stock photos, nothing presented as real work).
 * Used in the hero composition and the product showcase.
 */
export type GlyphKind = 'card' | 'banner' | 'uniform' | 'vehicle' | 'letters' | 'stand' | 'gift' | 'cut';

const INK = '#171717';
const NAR = '#C51D34';
const DEEP = '#8E1124';
const PAPER = '#F8F7F4';
const SAFF = '#F2B33D';
const TEAL = '#0E6B66';

export function ProductGlyph({ kind, className = '' }: { kind: GlyphKind; className?: string }) {
  const common = { className, viewBox: '0 0 200 160', 'aria-hidden': true as const, focusable: false as const };
  switch (kind) {
    case 'card':
      return (
        <svg {...common}>
          <rect x="38" y="44" width="120" height="72" rx="6" fill={INK} transform="rotate(-10 98 80)" />
          <g transform="rotate(6 100 82)">
            <rect x="42" y="46" width="120" height="72" rx="6" fill="#fff" />
            <circle cx="62" cy="68" r="8" fill={NAR} />
            <rect x="76" y="62" width="50" height="6" rx="3" fill={INK} />
            <rect x="76" y="73" width="32" height="4" rx="2" fill="#bbb" />
            <rect x="56" y="98" width="70" height="4" rx="2" fill="#ccc" />
          </g>
        </svg>
      );
    case 'banner':
      return (
        <svg {...common}>
          <rect x="22" y="30" width="156" height="90" rx="4" fill={NAR} />
          <circle cx="30" cy="38" r="3" fill={PAPER} /><circle cx="170" cy="38" r="3" fill={PAPER} />
          <circle cx="30" cy="112" r="3" fill={PAPER} /><circle cx="170" cy="112" r="3" fill={PAPER} />
          <text x="100" y="84" textAnchor="middle" fontFamily="Unbounded, sans-serif" fontWeight="800" fontSize="26" fill={PAPER}>BANNER</text>
          <rect x="60" y="94" width="80" height="5" rx="2.5" fill={SAFF} />
        </svg>
      );
    case 'uniform':
      return (
        <svg {...common}>
          <path d="M70 28 L52 36 L30 58 L46 74 L58 64 L58 136 L142 136 L142 64 L154 74 L170 58 L148 36 L130 28 Q100 46 70 28Z" fill={INK} />
          <circle cx="118" cy="62" r="7" fill={NAR} />
          <rect x="74" y="98" width="52" height="4" rx="2" fill="#444" />
        </svg>
      );
    case 'vehicle':
      return (
        <svg {...common}>
          <path d="M20 108 V64 Q20 52 32 52 H122 L150 72 H172 Q182 72 182 84 V108Z" fill="#fff" stroke={INK} strokeWidth="3" />
          <path d="M126 56 L146 72 H126Z" fill="#cfe5e3" />
          <path d="M20 88 H182 V98 H20Z" fill={NAR} />
          <text x="66" y="80" textAnchor="middle" fontFamily="Unbounded, sans-serif" fontWeight="800" fontSize="14" fill={INK}>NAR</text>
          <circle cx="56" cy="110" r="13" fill={INK} /><circle cx="56" cy="110" r="5" fill="#999" />
          <circle cx="150" cy="110" r="13" fill={INK} /><circle cx="150" cy="110" r="5" fill="#999" />
        </svg>
      );
    case 'letters':
      return (
        <svg {...common}>
          {[8, 6, 4, 2].map((d) => (
            <text key={d} x={46 + d} y={118 + d} fontFamily="Unbounded, sans-serif" fontWeight="900" fontSize="92" fill={DEEP}>3D</text>
          ))}
          <text x="46" y="118" fontFamily="Unbounded, sans-serif" fontWeight="900" fontSize="92" fill={NAR}>3D</text>
          <circle cx="160" cy="34" r="9" fill={SAFF} opacity="0.9" />
        </svg>
      );
    case 'stand':
      return (
        <svg {...common}>
          <rect x="62" y="16" width="76" height="118" rx="4" fill={TEAL} />
          <rect x="72" y="30" width="56" height="40" rx="3" fill={PAPER} />
          <circle cx="100" cy="50" r="10" fill={NAR} />
          <rect x="72" y="82" width="56" height="5" rx="2.5" fill={PAPER} />
          <rect x="72" y="93" width="38" height="5" rx="2.5" fill={PAPER} opacity=".7" />
          <rect x="54" y="134" width="92" height="8" rx="4" fill={INK} />
        </svg>
      );
    case 'gift':
      return (
        <svg {...common}>
          <rect x="44" y="64" width="80" height="70" rx="6" fill={NAR} />
          <rect x="38" y="52" width="92" height="18" rx="4" fill={DEEP} />
          <rect x="78" y="52" width="12" height="82" fill={SAFF} />
          <path d="M84 52 C70 30 52 40 64 52 M84 52 C98 30 116 40 104 52" stroke={SAFF} strokeWidth="6" fill="none" strokeLinecap="round" />
          <rect x="138" y="50" width="12" height="84" rx="6" fill={INK} transform="rotate(14 144 92)" />
          <rect x="138" y="44" width="12" height="14" rx="3" fill={NAR} transform="rotate(14 144 92)" />
        </svg>
      );
    case 'cut':
      return (
        <svg {...common}>
          <circle cx="100" cy="80" r="58" fill={INK} />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <circle key={i} cx={100 + Math.cos(a) * 38} cy={80 + Math.sin(a) * 38} r="8" fill={PAPER} />;
          })}
          <path d="M100 52 L108 72 L128 80 L108 88 L100 108 L92 88 L72 80 L92 72Z" fill={NAR} />
          <path d="M18 140 L182 140" stroke={NAR} strokeWidth="2" strokeDasharray="6 6" />
        </svg>
      );
  }
}
