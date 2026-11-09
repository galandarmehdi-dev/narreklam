/* Row ↔ domain mappers shared by the public site and the admin dashboard. */
import type {
  ArtVariant, Category, ContentOverrides, FaqItem, InstagramPost, L, Locale, PortfolioProject,
  QuoteFieldKey, Service, SiteSettings,
} from '@/lib/types';
import { LOCALES } from '@/lib/types';
import { defaultSettings } from '@/config/company';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

export function loc<T = string>(rows: Row[] | undefined, field: string, fallback: T): L<T> {
  const out = {} as L<T>;
  for (const l of LOCALES) {
    const r = rows?.find((x) => x.locale === l);
    out[l] = (r?.[field] ?? fallback) as T;
  }
  return out;
}

const emptyL = (): L => ({ az: '', ru: '', en: '' });
const asL = (v: unknown): L => ({ ...emptyL(), ...((v as Partial<L>) || {}) });
const optL = (rows: Row[] | undefined, field: string): Partial<L> | undefined => {
  const v = loc<string | null>(rows, field, null);
  return LOCALES.some((l) => v[l]) ? (Object.fromEntries(LOCALES.map((l) => [l, v[l] ?? ''])) as L) : undefined;
};

export const CATEGORY_SELECT = '*, service_category_translations(*)';
export const SERVICE_SELECT = '*, service_translations(*), service_items(*, service_item_translations(*))';
export const PROJECT_SELECT = '*, portfolio_translations(*), portfolio_images(*), project_services(service_id)';

export function mapCategory(r: Row): Category {
  const tr = r.service_category_translations as Row[];
  return {
    id: r.id,
    slug: r.slug,
    order: r.sort_order ?? 0,
    published: !!r.is_published,
    icon: r.icon || 'Layers',
    art: (r.art || 'design') as ArtVariant,
    image: r.image_url || null,
    name: loc(tr, 'name', ''),
    tagline: loc(tr, 'tagline', ''),
    description: loc(tr, 'description', ''),
    seoTitle: optL(tr, 'seo_title'),
    seoDescription: optL(tr, 'seo_description'),
  };
}

export function mapService(r: Row): Service {
  const tr = r.service_translations as Row[];
  const items = ((r.service_items as Row[]) || [])
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((it) => ({ id: it.id, name: loc(it.service_item_translations, 'name', ''), published: !!it.is_published }));
  return {
    id: r.id,
    slug: r.slug,
    categoryId: r.category_id,
    order: r.sort_order ?? 0,
    published: !!r.is_published,
    icon: r.icon || 'Layers',
    image: r.image_url || null,
    title: loc(tr, 'title', ''),
    short: loc(tr, 'short', ''),
    headline: loc(tr, 'headline', ''),
    intro: loc(tr, 'intro', ''),
    items,
    applications: loc<string[]>(tr, 'applications', []),
    faq: loc(tr, 'faq', []),
    keywords: loc(tr, 'keywords', ''),
    quoteFields: (r.quote_fields || []) as QuoteFieldKey[],
    seoTitle: optL(tr, 'seo_title'),
    seoDescription: optL(tr, 'seo_description'),
  };
}

export function mapProject(r: Row): PortfolioProject {
  const tr = r.portfolio_translations as Row[];
  const images = ((r.portfolio_images as Row[]) || [])
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((im) => ({
      id: im.id,
      url: im.url,
      storagePath: im.storage_path,
      alt: asL(im.alt),
      caption: (im.caption as Partial<L>) || {},
      order: im.sort_order ?? 0,
      focalX: im.focal_x ?? 50,
      focalY: im.focal_y ?? 50,
    }));
  return {
    id: r.id,
    slug: r.slug,
    categoryId: r.category_id,
    serviceIds: ((r.project_services as Row[]) || []).map((x) => x.service_id),
    title: loc(tr, 'title', ''),
    summary: loc(tr, 'summary', ''),
    description: loc(tr, 'description', ''),
    scope: loc(tr, 'scope', ''),
    materials: loc(tr, 'materials', ''),
    location: optL(tr, 'location') ?? null,
    clientName: r.client_name,
    projectDate: r.project_date,
    coverImageId: r.cover_image_id,
    images,
    published: !!r.is_published,
    featured: !!r.is_featured,
    isDemo: !!r.is_demo,
    order: r.sort_order ?? 0,
  };
}

export function mapFaq(r: Row): FaqItem {
  return {
    id: r.id,
    order: r.sort_order ?? 0,
    published: !!r.is_published,
    question: loc(r.faq_translations, 'question', ''),
    answer: loc(r.faq_translations, 'answer', ''),
  };
}

export function mapInstagram(r: Row): InstagramPost {
  return { id: r.id, imageUrl: r.image_url, postUrl: r.post_url, caption: r.caption || {}, order: r.sort_order ?? 0 };
}

export function mapSettings(r: Row | null): SiteSettings {
  if (!r) return defaultSettings;
  return {
    companyName: r.company_name || defaultSettings.companyName,
    logoUrl: r.logo_url || null,
    phone: r.phone || '',
    phoneSecondary: r.phone_secondary || '',
    whatsapp: r.whatsapp || '',
    email: r.email || '',
    address: asL(r.address),
    workingHours: asL(r.working_hours),
    mapEmbedUrl: r.map_embed_url || '',
    mapLink: r.map_link || '',
    instagram: r.instagram || '',
    facebook: r.facebook || '',
    tiktok: r.tiktok || '',
    linkedin: r.linkedin || '',
    youtube: r.youtube || '',
  };
}

export function settingsToRow(s: SiteSettings): Row {
  return {
    id: 1,
    company_name: s.companyName,
    logo_url: s.logoUrl,
    phone: s.phone,
    phone_secondary: s.phoneSecondary,
    whatsapp: s.whatsapp,
    email: s.email,
    address: s.address,
    working_hours: s.workingHours,
    map_embed_url: s.mapEmbedUrl,
    map_link: s.mapLink,
    instagram: s.instagram,
    facebook: s.facebook,
    tiktok: s.tiktok,
    linkedin: s.linkedin,
    youtube: s.youtube,
  };
}

export function mapContent(rows: Row[]): ContentOverrides {
  const out: ContentOverrides = {};
  for (const r of rows) {
    const l = r.locale as Locale;
    if (!r.value) continue;
    (out[l] ||= {})[r.block_key] = r.value;
  }
  return out;
}

/** Cover image of a project (explicit cover, else first image). */
export function coverOf(p: PortfolioProject) {
  return p.images.find((i) => i.id === p.coverImageId) || p.images[0] || null;
}
