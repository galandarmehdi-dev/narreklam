/** Centralised access to public build-time configuration (see .env.example). */
const trimSlash = (s: string) => s.replace(/\/+$/, '');

export const env = {
  supabaseUrl: (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || '',
  supabaseAnonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '',
  siteUrl: trimSlash((import.meta.env.VITE_SITE_URL as string | undefined) || ''),
  basePath: import.meta.env.BASE_URL as string,
  showDemo: import.meta.env.VITE_SHOW_DEMO === 'true',
};

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);

/** Quote upload limits — must match supabase/functions/quote-submit. */
export const UPLOAD_LIMITS = {
  maxFiles: 8,
  maxFileMb: 20,
  extensions: ['pdf', 'jpg', 'jpeg', 'png', 'svg', 'ai', 'eps', 'psd', 'zip'],
};
