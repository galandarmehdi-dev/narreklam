import { useMemo } from 'react';
import type { ArtVariant } from '@/lib/types';
import { artDataUri } from '@/lib/art';

interface Props {
  src?: string | null;
  variant: ArtVariant;
  seed?: number;
  alt: string;
  className?: string;
  eager?: boolean;
  sizes?: string;
  focal?: { x?: number; y?: number };
}

/** Uploaded image when available, otherwise generative illustration (decorative). */
export function Art({ src, variant, seed = 1, alt, className = '', eager, focal }: Props) {
  const fallback = useMemo(() => artDataUri(variant, seed), [variant, seed]);
  const isReal = !!src;
  return (
    <img
      src={src || fallback}
      alt={isReal ? alt : ''}
      aria-hidden={isReal ? undefined : true}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={`h-full w-full object-cover ${className}`}
      style={focal ? { objectPosition: `${focal.x ?? 50}% ${focal.y ?? 50}%` } : undefined}
    />
  );
}
