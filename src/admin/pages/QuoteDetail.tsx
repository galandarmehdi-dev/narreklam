import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Eye, FileWarning, Mail, MessageCircle, Phone } from 'lucide-react';
import { sb, must } from '../api';
import { useA } from '../i18n';
import { DeleteButton, ErrorBox, Loading, PageHeader, Panel, btn, inputCls, useToast } from '../ui';
import { STATUSES, StatusBadge, statusLabel } from './Quotes';
import type { Role } from '../AdminApp';
import { telLink, whatsappLink } from '@/lib/whatsapp';

type Row = Record<string, any>;
const PREVIEWABLE = ['jpg', 'jpeg', 'png'];

export default function QuoteDetail({ role }: { role: Role }) {
  const a = useA();
  const toast = useToast();
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const [q, setQ] = useState<Row | null>(null);
  const [files, setFiles] = useState<Row[]>([]);
  const [notes, setNotes] = useState<Row[]>([]);
  const [note, setNote] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    try {
      const client = await sb();
      const [qr, fr, nr] = await Promise.all([
        client.from('quote_requests').select('*').eq('id', id).single(),
        client.from('quote_attachments').select('*').eq('quote_id', id).order('created_at'),
        client.from('quote_internal_notes').select('*, profiles(email, full_name)').eq('quote_id', id).order('created_at'),
      ]);
      setQ(must(qr));
      setFiles(must(fr) || []);
      setNotes(must(nr) || []);
    } catch (e) {
      setError(e);
    }
  }, [id]);
  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (status: string) => {
    try {
      const client = await sb();
      must(await client.from('quote_requests').update({ status }).eq('id', id));
      setQ((x) => (x ? { ...x, status } : x));
      toast(a.saved);
    } catch (e) {
      toast(String((e as Error).message), 'error');
    }
  };

  /** Short-lived signed URL; non-images are forced to download (never rendered inline). */
  const signed = async (f: Row, download: boolean) => {
    const client = await sb();
    const { data, error } = await client.storage.from('quote-attachments').createSignedUrl(f.storage_path, 120, download ? { download: f.original_name } : undefined);
    if (error || !data) {
      toast(error?.message || a.error, 'error');
      return null;
    }
    return data.signedUrl;
  };

  const addNote = async () => {
    if (!note.trim()) return;
    try {
      const client = await sb();
      const { data: u } = await client.auth.getUser();
      must(await client.from('quote_internal_notes').insert({ quote_id: id, body: note.trim(), author_id: u.user?.id }));
      setNote('');
      load();
    } catch (e) {
      toast(String((e as Error).message), 'error');
    }
  };

  if (error) return <ErrorBox error={error} />;
  if (!q) return <Loading />;

  const wa = whatsappLink(q.whatsapp || q.phone || '', `Salam, ${q.full_name}! NarReklam — ${q.reference}`);
  const rows: [string, React.ReactNode][] = [
    [a.kind, q.kind === 'contact' ? a.contactMsg : a.quote],
    [a.company, q.company],
    [a.phone, q.phone && <a className="underline" href={telLink(q.phone)}>{q.phone}</a>],
    [a.whatsapp, q.whatsapp],
    [a.email, q.email && <a className="underline" href={`mailto:${q.email}?subject=${encodeURIComponent(q.reference)}`}>{q.email}</a>],
    [a.service, q.service_label || q.service_slug || q.category_slug],
    [a.deadline, q.deadline],
    [a.contactMethod, q.contact_method],
    [a.language, q.locale?.toUpperCase()],
    [a.received, new Date(q.created_at).toLocaleString()],
    [a.notification, q.notification_status + (q.notification_error ? ` — ${q.notification_error}` : '')],
    [a.source, q.source_page],
  ];

  return (
    <>
      <Link to=".." relative="path" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-mute hover:text-ink"><ArrowLeft className="size-4" /> {a.quotes}</Link>
      <PageHeader
        title={`${q.reference} · ${q.full_name}`}
        actions={
          <>
            {q.phone && <a href={telLink(q.phone)} className={btn.ghost}><Phone className="size-4" />{a.phone}</a>}
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className={btn.ghost}><MessageCircle className="size-4" />WhatsApp</a>}
            {q.email && <a href={`mailto:${q.email}?subject=${encodeURIComponent(q.reference)}`} className={btn.ghost}><Mail className="size-4" />{a.email}</a>}
          </>
        }
      >
        <StatusBadge status={q.status} />
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Panel title={a.description}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{q.description}</p>
            {q.details && Object.keys(q.details).length > 0 && (
              <>
                <h3 className="mt-6 mb-2 font-sans text-xs font-bold tracking-wide text-mute uppercase">{a.details}</h3>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  {Object.entries(q.details as Record<string, string>).map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-paper p-3"><dt className="text-xs text-mute">{k}</dt><dd className="font-semibold">{v}</dd></div>
                  ))}
                </dl>
              </>
            )}
          </Panel>

          <Panel title={`${a.attachments} (${files.length})`}>
            {files.length === 0 ? (
              <p className="text-sm text-mute">—</p>
            ) : (
              <ul className="divide-y divide-line">
                {files.map((f) => {
                  const ext = f.original_name.split('.').pop()?.toLowerCase();
                  return (
                    <li key={f.id} className="flex items-center gap-3 py-3 text-sm">
                      {f.status !== 'uploaded' && <FileWarning className="size-4 text-nar" aria-label={f.status} />}
                      <span className="min-w-0 flex-1 truncate font-semibold">{f.original_name}</span>
                      <span className="text-xs text-mute">{f.size_bytes ? `${(f.size_bytes / 1024 / 1024).toFixed(1)} MB` : ''} {f.status === 'rejected' ? `· ${a.rejected}` : f.status === 'pending' ? `· ${a.pending}` : ''}</span>
                      {f.status === 'uploaded' && (
                        <>
                          {PREVIEWABLE.includes(ext) && (
                            <button type="button" className={btn.icon} aria-label={a.preview} onClick={async () => setPreview(await signed(f, false))}><Eye className="size-4" /></button>
                          )}
                          <button type="button" className={btn.icon} aria-label={a.download} onClick={async () => { const u = await signed(f, true); if (u) window.location.href = u; }}><Download className="size-4" /></button>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            {preview && (
              <div className="mt-4">
                <img src={preview} alt="" className="max-h-[60vh] rounded-xl ring-1 ring-line" />
                <button type="button" className={`${btn.ghost} mt-2`} onClick={() => setPreview(null)}>{a.cancel}</button>
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title={a.status}>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map((s) => (
                <button key={s} type="button" onClick={() => setStatus(s)} aria-pressed={q.status === s} className={`rounded-xl px-3 py-2 text-sm font-bold ring-1 ${q.status === s ? 'bg-ink text-white ring-ink' : 'ring-line hover:ring-ink'}`}>
                  {statusLabel(a, s)}
                </button>
              ))}
            </div>
          </Panel>
          <Panel>
            <dl className="divide-y divide-line text-sm">
              {rows.filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2"><dt className="text-mute">{k}</dt><dd className="text-right font-semibold break-all">{v}</dd></div>
              ))}
            </dl>
          </Panel>
          <Panel title={a.notes}>
            <ul className="mb-4 space-y-3">
              {notes.map((n) => (
                <li key={n.id} className="rounded-xl bg-paper p-3 text-sm">
                  <p className="whitespace-pre-wrap">{n.body}</p>
                  <p className="mt-1 text-xs text-mute">{n.profiles?.email || '—'} · {new Date(n.created_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
            <textarea className={`${inputCls} resize-y`} rows={3} placeholder={a.notePh} value={note} onChange={(e) => setNote(e.target.value)} aria-label={a.addNote} />
            <button type="button" className={`${btn.primary} mt-2`} onClick={addNote} disabled={!note.trim()}>{a.addNote}</button>
          </Panel>
          {role === 'admin' && (
            <DeleteButton
              onConfirm={async () => {
                try {
                  const client = await sb();
                  const paths = files.map((f) => f.storage_path);
                  if (paths.length) await client.storage.from('quote-attachments').remove(paths);
                  must(await client.from('quote_requests').delete().eq('id', id));
                  navigate('..', { relative: 'path' });
                } catch (e) {
                  toast(String((e as Error).message), 'error');
                }
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
