import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Paperclip, Search } from 'lucide-react';
import { sb, must } from '../api';
import { useA, type AdminDict } from '../i18n';
import { ErrorBox, Loading, PageHeader, btn, inputCls } from '../ui';

export const STATUSES = ['new', 'contacted', 'quoted', 'in_progress', 'completed', 'closed'] as const;
export const statusLabel = (a: AdminDict, s: string) => (a as unknown as Record<string, string>)[`st_${s}`] || s;
const tone: Record<string, string> = {
  new: 'bg-nar text-white', contacted: 'bg-saffron/30 text-ink', quoted: 'bg-blush text-nar-deep', in_progress: 'bg-teal/15 text-teal',
  completed: 'bg-ink text-white', closed: 'bg-line text-mute',
};

export function StatusBadge({ status }: { status: string }) {
  const a = useA();
  return <span className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${tone[status] || 'bg-line'}`}>{statusLabel(a, status)}</span>;
}

const PAGE = 25;

export default function Quotes() {
  const a = useA();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const kind = params.get('kind') || '';
  const page = Number(params.get('page') || 0);
  const [q, setQ] = useState(params.get('q') || '');
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [count, setCount] = useState(0);
  const [error, setError] = useState<unknown>(null);

  const update = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    if (k !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setRows(null);
        const client = await sb();
        let query = client
          .from('quote_requests')
          .select('id, reference, kind, full_name, company, phone, email, service_label, status, created_at, quote_attachments(count)', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(page * PAGE, page * PAGE + PAGE - 1);
        if (status) query = query.eq('status', status);
        if (kind) query = query.eq('kind', kind);
        const term = (params.get('q') || '').trim().replace(/[%,()]/g, ' ');
        if (term) query = query.or(`reference.ilike.%${term}%,full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,company.ilike.%${term}%`);
        const res = await query;
        if (cancelled) return;
        setRows(must(res) || []);
        setCount(res.count || 0);
      } catch (e) {
        setError(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, kind, page, params]);

  const pages = Math.ceil(count / PAGE);

  return (
    <>
      <PageHeader title={a.quotes}>{count} · {a.total.toLowerCase()}</PageHeader>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <form className="relative flex-1" onSubmit={(e) => { e.preventDefault(); update('q', q); }}>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-mute" />
          <input className={`${inputCls} pl-9`} placeholder={a.search} value={q} onChange={(e) => setQ(e.target.value)} aria-label={a.search} />
        </form>
        <select className={`${inputCls} lg:w-48`} value={status} onChange={(e) => update('status', e.target.value)} aria-label={a.status}>
          <option value="">{a.status}: {a.all}</option>
          {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(a, s)}</option>)}
        </select>
        <select className={`${inputCls} lg:w-48`} value={kind} onChange={(e) => update('kind', e.target.value)} aria-label={a.kind}>
          <option value="">{a.kind}: {a.all}</option>
          <option value="quote">{a.quote}</option>
          <option value="contact">{a.contactMsg}</option>
        </select>
      </div>
      <ErrorBox error={error} />
      {!rows ? (
        <Loading />
      ) : rows.length === 0 ? (
        <p className="rounded-2xl bg-white p-10 text-center text-sm text-mute ring-1 ring-line">{a.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-line">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-xs tracking-wide text-mute uppercase">
              <tr>
                <th className="px-4 py-3">{a.reference}</th>
                <th className="px-4 py-3">{a.customer}</th>
                <th className="px-4 py-3">{a.service}</th>
                <th className="px-4 py-3">{a.received}</th>
                <th className="px-4 py-3">{a.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => {
                const files = (r.quote_attachments as { count: number }[] | undefined)?.[0]?.count || 0;
                return (
                  <tr key={r.id as string} className="hover:bg-paper/60">
                    <td className="px-4 py-3">
                      <Link to={r.id as string} className="font-mono text-xs font-bold underline-offset-2 hover:underline">{r.reference as string}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={r.id as string} className="font-semibold">{r.full_name as string}</Link>
                      <span className="block text-xs text-mute">{(r.company as string) || (r.phone as string)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {(r.service_label as string) || (r.kind === 'contact' ? a.contactMsg : '—')}
                      {files > 0 && <span className="ml-2 inline-flex items-center gap-0.5 text-xs text-mute"><Paperclip className="size-3" />{files}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-mute">{new Date(r.created_at as string).toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status as string} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
          <button type="button" className={btn.ghost} disabled={page === 0} onClick={() => update('page', String(page - 1))}>{a.prev}</button>
          <span>{a.page} {page + 1} / {pages}</span>
          <button type="button" className={btn.ghost} disabled={page >= pages - 1} onClick={() => update('page', String(page + 1))}>{a.next}</button>
        </div>
      )}
    </>
  );
}
