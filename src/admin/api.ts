/* Admin data-access helpers. Every call runs as the signed-in user; Postgres RLS enforces permissions. */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { L, Locale } from '@/lib/types';
import { LOCALES } from '@/lib/types';
import { requireSupabase } from '@/lib/supabase';
import { env } from '@/config/env';

export const sb = (): Promise<SupabaseClient> => requireSupabase();

/** Throw on Supabase errors so callers can use try/catch. */
// Without generated database types, row shapes are validated by the mappers in src/data/mappers.ts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function must<T = any>(res: { data: unknown; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

/**
 * Upsert one row per locale into a translation table.
 * `fields` maps column → localized value; values of other types (arrays/json) are passed through per locale.
 */
export async function saveTranslations(
  table: string,
  fk: string,
  id: string,
  fields: Record<string, Partial<L<unknown>> | undefined>,
) {
  const client = await sb();
  const rows = LOCALES.map((l: Locale) => {
    const row: Record<string, unknown> = { [fk]: id, locale: l };
    for (const [col, v] of Object.entries(fields)) {
      if (v === undefined) continue;
      const val = v[l];
      row[col] = typeof val === 'string' ? val : val ?? (Array.isArray(v.az) ? [] : '');
    }
    return row;
  });
  must(await client.from(table).upsert(rows, { onConflict: `${fk},locale` }));
}

const MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

/** Downscale large photos in the browser (max 2400px, WebP) for fast pages. */
async function optimise(file: File, maxSide = 2400): Promise<{ blob: Blob; ext: string; width?: number; height?: number }> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return { blob: file, ext: file.name.split('.').pop() || 'img' };
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', 0.86));
    if (blob && blob.size < file.size * 1.1) return { blob, ext: 'webp', width: w, height: h };
    return { blob: file, ext: file.name.split('.').pop() || 'img', width: bmp.width, height: bmp.height };
  } catch {
    return { blob: file, ext: file.name.split('.').pop() || 'img' };
  }
}

export interface UploadedMedia {
  path: string;
  url: string;
  width?: number;
  height?: number;
}

/** Upload an image to the public `media` bucket and return its public URL. */
export async function uploadMedia(file: File, folder: string): Promise<UploadedMedia> {
  if (!MEDIA_TYPES.includes(file.type)) throw new Error('JPG, PNG, WebP or AVIF only');
  if (file.size > 25 * 1024 * 1024) throw new Error('Max 25 MB');
  const client = await sb();
  const { blob, ext, width, height } = await optimise(file);
  if (blob.size > 10 * 1024 * 1024) throw new Error('Image is larger than 10 MB after optimisation');
  const base = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'image';
  const path = `${folder}/${base}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  must(await client.storage.from('media').upload(path, blob, { contentType: blob.type || file.type, cacheControl: '31536000', upsert: false }));
  const { data } = client.storage.from('media').getPublicUrl(path);
  return { path, url: data.publicUrl, width, height };
}

export async function removeMedia(path?: string | null) {
  if (!path) return;
  const client = await sb();
  await client.storage.from('media').remove([path]);
}

/** Path inside the media bucket for a public URL we generated (for cleanup). */
export function mediaPathFromUrl(url?: string | null): string | null {
  if (!url) return null;
  const marker = '/storage/v1/object/public/media/';
  const i = url.indexOf(marker);
  return i >= 0 ? decodeURIComponent(url.slice(i + marker.length)) : null;
}

/** Swap sort_order of two rows. */
export async function swapOrder(table: string, a: { id: string; order: number }, b: { id: string; order: number }, idCol = 'id') {
  const client = await sb();
  // Distinct values even when both had the same order.
  const ao = a.order === b.order ? b.order + 1 : b.order;
  must(await client.from(table).update({ sort_order: ao }).eq(idCol, a.id));
  must(await client.from(table).update({ sort_order: a.order }).eq(idCol, b.id));
}

/** Ask the Edge Function whether notification email is configured (staff only). */
export async function integrationStatus(): Promise<{ reachable: boolean; emailConfigured?: boolean }> {
  try {
    const client = await sb();
    const { data } = await client.auth.getSession();
    const res = await fetch(`${env.supabaseUrl}/functions/v1/quote-submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: env.supabaseAnonKey, Authorization: `Bearer ${data.session?.access_token ?? ''}` },
      body: JSON.stringify({ action: 'status' }),
    });
    if (!res.ok) return { reachable: res.status !== 404 };
    const j = await res.json();
    return { reachable: true, emailConfigured: !!j.emailConfigured };
  } catch {
    return { reachable: false };
  }
}

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
