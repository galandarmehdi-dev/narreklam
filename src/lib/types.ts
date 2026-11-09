export const LOCALES = ['az', 'ru', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'az';

/** A value available in every supported language. */
export type L<T = string> = Record<Locale, T>;

export type QuoteFieldKey =
  | 'quantity'
  | 'dimensions'
  | 'material'
  | 'sides'
  | 'finish'
  | 'vehicleType'
  | 'coverage'
  | 'garmentType'
  | 'printPlacement'
  | 'sizes'
  | 'platform'
  | 'installation';

export interface ServiceItem {
  id: string;
  name: L;
  published: boolean;
}

export interface FaqEntry {
  q: string;
  a: string;
}

export interface Service {
  id: string;
  slug: string;
  categoryId: string;
  order: number;
  published: boolean;
  icon: string;
  image?: string | null;
  title: L;
  short: L;
  headline: L;
  intro: L;
  items: ServiceItem[];
  applications: L<string[]>;
  faq: L<FaqEntry[]>;
  /** Comma separated synonyms / alternative spellings used by search. */
  keywords: L;
  quoteFields: QuoteFieldKey[];
  seoTitle?: Partial<L>;
  seoDescription?: Partial<L>;
}

export interface Category {
  id: string;
  slug: string;
  order: number;
  published: boolean;
  icon: string;
  /** Art variant used when no image is uploaded. */
  art: ArtVariant;
  image?: string | null;
  name: L;
  tagline: L;
  description: L;
  seoTitle?: Partial<L>;
  seoDescription?: Partial<L>;
}

export type ArtVariant = 'design' | 'space' | 'print' | 'production' | 'promo' | 'digital';

export interface PortfolioImage {
  id: string;
  url: string;
  storagePath?: string | null;
  alt: L;
  caption?: Partial<L>;
  order: number;
  focalX?: number;
  focalY?: number;
}

export interface PortfolioProject {
  id: string;
  slug: string;
  categoryId: string | null;
  serviceIds: string[];
  title: L;
  summary: L;
  description: L;
  scope: L;
  materials: L;
  clientName?: string | null;
  projectDate?: string | null;
  location?: Partial<L> | null;
  coverImageId?: string | null;
  images: PortfolioImage[];
  published: boolean;
  featured: boolean;
  isDemo: boolean;
  order: number;
}

export interface FaqItem {
  id: string;
  order: number;
  published: boolean;
  question: L;
  answer: L;
}

export interface InstagramPost {
  id: string;
  imageUrl: string;
  postUrl: string;
  caption: Partial<L>;
  order: number;
}

export interface SiteSettings {
  companyName: string;
  logoUrl: string | null;
  phone: string;
  phoneSecondary: string;
  whatsapp: string;
  email: string;
  address: L;
  workingHours: L;
  mapEmbedUrl: string;
  mapLink: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  linkedin: string;
  youtube: string;
}

export type ContentOverrides = Partial<Record<Locale, Record<string, string>>>;
