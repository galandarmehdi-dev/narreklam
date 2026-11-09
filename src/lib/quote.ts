import { env, isSupabaseConfigured, UPLOAD_LIMITS } from '@/config/env';
import { requireSupabase } from './supabase';
import type { Locale } from './types';

export interface QuotePayload {
  kind: 'quote' | 'contact';
  fullName: string;
  company?: string;
  phone: string;
  whatsapp?: string;
  email: string;
  categorySlug?: string;
  serviceSlug?: string;
  serviceLabel?: string;
  description: string;
  details?: Record<string, string>;
  deadline?: string;
  contactMethod: 'phone' | 'whatsapp' | 'email';
  locale: Locale;
  consent: boolean;
  sourcePage: string;
  /** Honeypot — must stay empty. */
  website?: string;
}

export type SubmitErrorCode = 'not_configured' | 'network' | 'rate_limit' | 'validation';

export class SubmitError extends Error {
  constructor(public code: SubmitErrorCode, message?: string, public fields?: Record<string, string>) {
    super(message || code);
  }
}

export interface SubmitResult {
  reference: string;
  failedFiles: string[];
  notification: string;
}

const FN_URL = () => `${env.supabaseUrl}/functions/v1/quote-submit`;

async function callFn<T>(body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(FN_URL(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: env.supabaseAnonKey,
        Authorization: `Bearer ${env.supabaseAnonKey}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new SubmitError('network');
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 429) throw new SubmitError('rate_limit');
  if (res.status === 404) throw new SubmitError('not_configured', 'Edge function quote-submit is not deployed');
  if (!res.ok) throw new SubmitError(res.status === 400 ? 'validation' : 'network', data?.error, data?.fields);
  return data as T;
}

export function extOf(name: string) {
  return name.split('.').pop()?.toLowerCase() || '';
}

export function validateFile(f: File): 'type' | 'size' | null {
  if (!UPLOAD_LIMITS.extensions.includes(extOf(f.name))) return 'type';
  if (f.size > UPLOAD_LIMITS.maxFileMb * 1024 * 1024) return 'size';
  return null;
}

/**
 * Real submission flow:
 * 1. Edge function validates and creates the quote record → returns reference + signed upload tokens.
 * 2. Files upload directly to the PRIVATE bucket via one-time signed URLs.
 * 3. Finalize call verifies uploads server-side (size/magic bytes) and sends the notification.
 */
export async function submitQuote(payload: QuotePayload, files: File[], onProgress?: (done: number, total: number) => void): Promise<SubmitResult> {
  if (!isSupabaseConfigured) throw new SubmitError('not_configured');

  const created = await callFn<{ quoteId: string; reference: string; finalizeToken: string; uploads: { attachmentId: string; path: string; token: string; name: string }[] }>({
    action: 'create',
    payload,
    files: files.map((f) => ({ name: f.name, size: f.size, type: f.type || 'application/octet-stream' })),
  });

  const failed: string[] = [];
  const uploaded: string[] = [];
  if (created.uploads.length) {
    const sb = await requireSupabase();
    let done = 0;
    onProgress?.(0, created.uploads.length);
    for (const up of created.uploads) {
      const file = files.find((f) => f.name === up.name);
      if (!file) continue;
      const { error } = await sb.storage.from('quote-attachments').uploadToSignedUrl(up.path, up.token, file, {
        contentType: file.type || 'application/octet-stream',
      });
      if (error) failed.push(file.name);
      else uploaded.push(up.attachmentId);
      onProgress?.(++done, created.uploads.length);
    }
  }

  let notification = 'unknown';
  try {
    const fin = await callFn<{ notification: string; rejected: string[] }>({
      action: 'finalize',
      quoteId: created.quoteId,
      finalizeToken: created.finalizeToken,
      uploaded,
    });
    notification = fin.notification;
    failed.push(...(fin.rejected || []));
  } catch {
    // The quote record already exists; finalize failure only affects attachments/notification.
  }
  return { reference: created.reference, failedFiles: failed, notification };
}
