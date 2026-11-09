// NarReklam — quotation intake Edge Function (Deno / Supabase Edge Runtime)
//
// actions:
//   create   → validate request, rate-limit, insert quote, issue one-time signed upload URLs
//   finalize → verify uploaded files server-side (size + magic bytes), send notification
//   status   → (staff only) report whether email notifications are configured
//
// Secrets (supabase secrets set ...):
//   RESEND_API_KEY, QUOTE_NOTIFY_EMAIL, QUOTE_FROM_EMAIL, ALLOWED_ORIGINS (comma-separated), QUOTE_IP_SALT
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically and never leave the server.

import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.47.10';

const BUCKET = 'quote-attachments';
const MAX_FILES = 8;
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const RATE_LIMIT = { windowMinutes: 15, max: 5 };
const ALLOWED_EXT = ['pdf', 'jpg', 'jpeg', 'png', 'svg', 'ai', 'eps', 'psd', 'zip'] as const;

const env = (k: string) => Deno.env.get(k) ?? '';
const admin: SupabaseClient = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { persistSession: false },
});

// ── HTTP helpers ──────────────────────────────────────────────────────────
function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  const allowed = env('ALLOWED_ORIGINS').split(',').map((s) => s.trim()).filter(Boolean);
  const allow = allowed.length === 0 ? '*' : allowed.includes(origin) ? origin : allowed[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

const json = (req: Request, status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } });

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const PHONE_RE = /^[+()\d\s-]{7,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function safeName(name: string): string {
  return name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').slice(0, 160) || 'file';
}
const extOf = (n: string) => n.split('.').pop()?.toLowerCase() ?? '';

// ── Magic-byte validation (never trust the browser's MIME type) ───────────
function matchesSignature(ext: string, b: Uint8Array): boolean {
  const ascii = new TextDecoder('latin1').decode(b);
  const starts = (sig: number[]) => sig.every((v, i) => b[i] === v);
  switch (ext) {
    case 'pdf':
      return ascii.startsWith('%PDF');
    case 'png':
      return starts([0x89, 0x50, 0x4e, 0x47]);
    case 'jpg':
    case 'jpeg':
      return starts([0xff, 0xd8, 0xff]);
    case 'zip':
      return starts([0x50, 0x4b, 0x03, 0x04]) || starts([0x50, 0x4b, 0x05, 0x06]);
    case 'psd':
      return ascii.startsWith('8BPS');
    case 'eps':
      return ascii.startsWith('%!PS') || starts([0xc5, 0xd0, 0xd3, 0xc6]);
    case 'ai':
      return ascii.startsWith('%PDF') || ascii.startsWith('%!PS');
    case 'svg': {
      const head = new TextDecoder().decode(b).replace(/^﻿/, '').trimStart().toLowerCase();
      return head.startsWith('<?xml') || head.startsWith('<svg') || head.startsWith('<!--') || head.startsWith('<!doctype svg');
    }
    default:
      return false;
  }
}

async function readHead(path: string): Promise<Uint8Array | null> {
  const { data } = await admin.storage.from(BUCKET).createSignedUrl(path, 60);
  if (!data?.signedUrl) return null;
  const res = await fetch(data.signedUrl, { headers: { Range: 'bytes=0-63' } });
  if (!res.ok && res.status !== 206) return null;
  return new Uint8Array(await res.arrayBuffer()).slice(0, 64);
}

// ── Notification email (Resend) ───────────────────────────────────────────
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

async function notify(quote: Record<string, any>, attachments: number): Promise<{ status: 'sent' | 'failed' | 'not_configured'; error?: string }> {
  const key = env('RESEND_API_KEY');
  const to = env('QUOTE_NOTIFY_EMAIL');
  if (!key || !to) return { status: 'not_configured' };
  const from = env('QUOTE_FROM_EMAIL') || 'NarReklam <onboarding@resend.dev>';
  const details = Object.entries((quote.details ?? {}) as Record<string, string>)
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${esc(k)}</td><td>${esc(String(v))}</td></tr>`)
    .join('');
  const rows: [string, string | null][] = [
    ['Reference', quote.reference],
    ['Type', quote.kind],
    ['Name', quote.full_name],
    ['Company', quote.company],
    ['Phone', quote.phone],
    ['WhatsApp', quote.whatsapp],
    ['Email', quote.email],
    ['Service', quote.service_label || quote.service_slug || quote.category_slug],
    ['Deadline', quote.deadline],
    ['Preferred contact', quote.contact_method],
    ['Language', quote.locale],
    ['Attachments', String(attachments)],
  ];
  const html = `<div style="font-family:system-ui,sans-serif;font-size:14px;color:#171717">
    <h2 style="margin:0 0 12px">New ${quote.kind === 'contact' ? 'message' : 'quotation request'} — ${esc(quote.reference)}</h2>
    <table>${rows.filter(([, v]) => v).map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${k}</td><td><b>${esc(String(v))}</b></td></tr>`).join('')}${details}</table>
    <p style="white-space:pre-wrap;background:#f8f7f4;padding:12px;border-radius:8px">${esc(quote.description)}</p>
    <p style="color:#666">Open the admin dashboard to review attachments and update the status.</p></div>`;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: to.split(',').map((s) => s.trim()),
        reply_to: EMAIL_RE.test(quote.email) ? quote.email : undefined,
        subject: `[NarReklam] ${quote.reference} — ${quote.service_label || quote.kind}`,
        html,
      }),
    });
    if (!res.ok) return { status: 'failed', error: (await res.text()).slice(0, 500) };
    return { status: 'sent' };
  } catch (e) {
    return { status: 'failed', error: String(e).slice(0, 500) };
  }
}

// ── Actions ───────────────────────────────────────────────────────────────
async function create(req: Request, body: any) {
  const p = body?.payload ?? {};
  if (str(p.website, 200)) return json(req, 400, { error: 'invalid' }); // honeypot

  const kind = p.kind === 'contact' ? 'contact' : 'quote';
  const data = {
    kind,
    full_name: str(p.fullName, 120),
    company: str(p.company, 160) || null,
    phone: str(p.phone, 32),
    whatsapp: str(p.whatsapp, 32) || null,
    email: str(p.email, 200).toLowerCase(),
    category_slug: str(p.categorySlug, 80) || null,
    service_slug: str(p.serviceSlug, 80) || null,
    service_label: str(p.serviceLabel, 200) || null,
    description: str(p.description, 5000),
    deadline: /^\d{4}-\d{2}-\d{2}$/.test(str(p.deadline, 10)) ? str(p.deadline, 10) : null,
    contact_method: ['phone', 'whatsapp', 'email'].includes(p.contactMethod) ? p.contactMethod : 'phone',
    locale: ['az', 'ru', 'en'].includes(p.locale) ? p.locale : 'az',
    source_page: str(p.sourcePage, 300) || null,
    user_agent: str(req.headers.get('user-agent'), 300) || null,
  };

  const details: Record<string, string> = {};
  if (p.details && typeof p.details === 'object') {
    for (const [k, v] of Object.entries(p.details).slice(0, 20)) {
      const kk = str(k, 80);
      const vv = str(v, 500);
      if (kk && vv) details[kk] = vv;
    }
  }

  const fields: Record<string, string> = {};
  if (data.full_name.length < 2) fields.fullName = 'required';
  if (!PHONE_RE.test(data.phone)) fields.phone = 'invalid';
  if (data.whatsapp && !PHONE_RE.test(data.whatsapp)) fields.whatsapp = 'invalid';
  if (!EMAIL_RE.test(data.email)) fields.email = 'invalid';
  if (data.description.length < 10) fields.description = 'short';
  if (p.consent !== true) fields.consent = 'required';
  if (kind === 'quote' && (!data.category_slug || !SLUG_RE.test(data.category_slug))) fields.category = 'required';
  if (data.service_slug && !SLUG_RE.test(data.service_slug)) data.service_slug = null;

  const files: { name: string; size: number }[] = Array.isArray(body?.files) ? body.files : [];
  if (kind === 'contact' && files.length) fields.files = 'not_allowed';
  if (files.length > MAX_FILES) fields.files = 'too_many';
  for (const f of files) {
    if (!ALLOWED_EXT.includes(extOf(String(f?.name)) as (typeof ALLOWED_EXT)[number])) fields.files = 'type';
    if (typeof f?.size !== 'number' || f.size <= 0 || f.size > MAX_FILE_BYTES) fields.files = 'size';
  }
  if (Object.keys(fields).length) return json(req, 400, { error: 'validation', fields });

  // Rate limit by salted IP hash (raw IPs are never stored).
  const ip = (req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  const ipHash = ip ? await sha256(`${env('QUOTE_IP_SALT') || 'narreklam'}:${ip}`) : null;
  if (ipHash) {
    const since = new Date(Date.now() - RATE_LIMIT.windowMinutes * 60_000).toISOString();
    const { count } = await admin.from('quote_requests').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('created_at', since);
    if ((count ?? 0) >= RATE_LIMIT.max) return json(req, 429, { error: 'rate_limited' });
  }

  const finalizeToken = crypto.randomUUID() + crypto.randomUUID();
  const { data: quote, error } = await admin
    .from('quote_requests')
    .insert({ ...data, details, consent_at: new Date().toISOString(), ip_hash: ipHash, finalize_token_hash: await sha256(finalizeToken) })
    .select('id, reference')
    .single();
  if (error || !quote) {
    console.error('insert failed', error);
    return json(req, 500, { error: 'insert_failed' });
  }

  const uploads: { attachmentId: string; path: string; token: string; name: string }[] = [];
  for (const f of files) {
    const ext = extOf(f.name);
    const path = `${quote.id}/${crypto.randomUUID()}.${ext}`;
    const { data: att, error: aErr } = await admin
      .from('quote_attachments')
      .insert({ quote_id: quote.id, storage_path: path, original_name: safeName(f.name), size_bytes: f.size })
      .select('id')
      .single();
    if (aErr || !att) continue;
    const { data: signed, error: sErr } = await admin.storage.from(BUCKET).createSignedUploadUrl(path);
    if (sErr || !signed) continue;
    uploads.push({ attachmentId: att.id, path, token: signed.token, name: f.name });
  }

  return json(req, 200, { quoteId: quote.id, reference: quote.reference, finalizeToken, uploads });
}

async function finalize(req: Request, body: any) {
  const quoteId = str(body?.quoteId, 64);
  const token = str(body?.finalizeToken, 128);
  if (!quoteId || !token) return json(req, 400, { error: 'invalid' });

  const { data: quote } = await admin.from('quote_requests').select('*').eq('id', quoteId).maybeSingle();
  if (!quote || quote.finalized_at || quote.finalize_token_hash !== (await sha256(token))) {
    return json(req, 403, { error: 'forbidden' });
  }

  const { data: atts } = await admin.from('quote_attachments').select('*').eq('quote_id', quoteId);
  const { data: objects } = await admin.storage.from(BUCKET).list(quoteId, { limit: 100 });
  const rejected: string[] = [];
  let accepted = 0;

  for (const att of atts ?? []) {
    const fileName = att.storage_path.split('/').pop();
    const obj = objects?.find((o) => o.name === fileName);
    const size = Number(obj?.metadata?.size ?? 0);
    let ok = !!obj && size > 0 && size <= MAX_FILE_BYTES;
    if (ok) {
      const head = await readHead(att.storage_path);
      ok = !!head && matchesSignature(extOf(att.storage_path), head);
    }
    if (ok) {
      accepted++;
      await admin.from('quote_attachments').update({ status: 'uploaded', size_bytes: size, mime_type: obj?.metadata?.mimetype ?? null }).eq('id', att.id);
    } else {
      if (obj) await admin.storage.from(BUCKET).remove([att.storage_path]);
      await admin.from('quote_attachments').update({ status: 'rejected' }).eq('id', att.id);
      // Only report files the client actually tried to upload.
      if ((body?.uploaded ?? []).includes(att.id)) rejected.push(att.original_name);
    }
  }

  const result = await notify(quote, accepted);
  await admin
    .from('quote_requests')
    .update({ finalized_at: new Date().toISOString(), finalize_token_hash: null, notification_status: result.status, notification_error: result.error ?? null })
    .eq('id', quoteId);

  return json(req, 200, { ok: true, notification: result.status, rejected });
}

async function status(req: Request) {
  const jwt = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: user } = await admin.auth.getUser(jwt);
  if (!user?.user) return json(req, 401, { error: 'unauthorized' });
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.user.id).maybeSingle();
  if (!profile || !['admin', 'editor'].includes(profile.role)) return json(req, 403, { error: 'forbidden' });
  return json(req, 200, {
    emailConfigured: Boolean(env('RESEND_API_KEY') && env('QUOTE_NOTIFY_EMAIL')),
    fromConfigured: Boolean(env('QUOTE_FROM_EMAIL')),
    originsRestricted: Boolean(env('ALLOWED_ORIGINS')),
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, 405, { error: 'method_not_allowed' });
  if (Number(req.headers.get('content-length') ?? 0) > 64_000) return json(req, 413, { error: 'too_large' });
  let body: any;
  try {
    body = await req.json();
  } catch {
    return json(req, 400, { error: 'invalid_json' });
  }
  try {
    if (body?.action === 'create') return await create(req, body);
    if (body?.action === 'finalize') return await finalize(req, body);
    if (body?.action === 'status') return await status(req);
    return json(req, 400, { error: 'unknown_action' });
  } catch (e) {
    console.error(e);
    return json(req, 500, { error: 'server_error' });
  }
});
