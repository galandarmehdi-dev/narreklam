import type { ArtVariant, Category, L, QuoteFieldKey, Service } from '@/lib/types';

/** Build a localized value: az, ru, en. */
export const l = (az: string, ru: string, en: string): L => ({ az, ru, en });

type Tri = [az: string, ru: string, en: string];

export interface ServiceDef {
  slug: string;
  icon: string;
  quoteFields: QuoteFieldKey[];
  title: L;
  short: L;
  headline: L;
  intro: L;
  items: Tri[];
  applications: Tri[];
  faq: { q: L; a: L }[];
  keywords: L;
}

export interface CategoryDef {
  slug: string;
  icon: string;
  art: ArtVariant;
  name: L;
  tagline: L;
  description: L;
  services: ServiceDef[];
}

const transpose = (rows: Tri[]): L<string[]> => ({
  az: rows.map((r) => r[0]),
  ru: rows.map((r) => r[1]),
  en: rows.map((r) => r[2]),
});

export function buildCategory(def: CategoryDef, order: number): { category: Category; services: Service[] } {
  const category: Category = {
    id: def.slug,
    slug: def.slug,
    order,
    published: true,
    icon: def.icon,
    art: def.art,
    image: null,
    name: def.name,
    tagline: def.tagline,
    description: def.description,
  };
  const services: Service[] = def.services.map((s, i) => ({
    id: s.slug,
    slug: s.slug,
    categoryId: def.slug,
    order: i,
    published: true,
    icon: s.icon,
    image: null,
    title: s.title,
    short: s.short,
    headline: s.headline,
    intro: s.intro,
    items: s.items.map((it, j) => ({ id: `${s.slug}-${j}`, name: l(...it), published: true })),
    applications: transpose(s.applications),
    faq: {
      az: s.faq.map((f) => ({ q: f.q.az, a: f.a.az })),
      ru: s.faq.map((f) => ({ q: f.q.ru, a: f.a.ru })),
      en: s.faq.map((f) => ({ q: f.q.en, a: f.a.en })),
    },
    keywords: s.keywords,
    quoteFields: s.quoteFields,
  }));
  return { category, services };
}
