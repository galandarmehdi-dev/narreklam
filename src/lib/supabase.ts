import type { SupabaseClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from '@/config/env';

/**
 * Lazily-created Supabase client (the SDK is only downloaded when needed).
 * Uses the public ANON key only — all authorization is enforced by Postgres RLS.
 */
let clientPromise: Promise<SupabaseClient | null> | null = null;

export function getSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(env.supabaseUrl, env.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, storageKey: 'narreklam-admin-auth' },
      }),
    );
  }
  return clientPromise;
}

export async function requireSupabase(): Promise<SupabaseClient> {
  const c = await getSupabase();
  if (!c) throw new Error('Supabase is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
  return c;
}
