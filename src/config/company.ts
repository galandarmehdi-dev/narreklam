import type { SiteSettings } from '@/lib/types';

/**
 * Default company settings — CONFIGURATION PLACEHOLDERS.
 * Real values are managed in Admin → Company settings (table `site_settings`).
 * Empty strings render as "coming soon" in the UI; nothing here is invented.
 */
export const defaultSettings: SiteSettings = {
  companyName: 'NarReklam',
  logoUrl: null,
  phone: '',
  phoneSecondary: '',
  whatsapp: '',
  email: '',
  address: { az: '', ru: '', en: '' },
  workingHours: { az: '', ru: '', en: '' },
  mapEmbedUrl: '',
  mapLink: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  linkedin: '',
  youtube: '',
};
