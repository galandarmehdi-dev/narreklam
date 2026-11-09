import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Inbox } from 'lucide-react';
import { sb, integrationStatus, must } from '../api';
import { useA } from '../i18n';
import { ErrorBox, Loading, PageHeader, Panel } from '../ui';
import { StatusBadge } from './Quotes';

interface Stats {
  quotes_total: number; contacts_total: number; quotes_new: number; projects_published: number; projects_draft: number;
  services_published: number; services_total: number; notifications_unconfigured: number; notifications_failed: number;
}

export default function Overview() {
  const a = useA();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Record<string, string>[]>([]);
  const [integr, setIntegr] = useState<{ reachable: boolean; emailConfigured?: boolean } | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    (async () => {
      try {
        const client = await sb();
        const [s, r] = await Promise.all([
          client.rpc('admin_overview'),
          client.from('quote_requests').select('id, reference, full_name, service_label, status, kind, created_at').order('created_at', { ascending: false }).limit(8),
        ]);
        setStats(must(s) as Stats);
        setRecent(must(r) || []);
      } catch (e) {
        setError(e);
      }
      setIntegr(await integrationStatus());
    })();
  }, []);

  if (error) return <ErrorBox error={error} />;
  if (!stats) return <Loading />;
  const cards = [
    { label: a.newInquiries, value: stats.quotes_new, to: 'quotes?status=new', accent: true },
    { label: a.total, value: stats.quotes_total, to: 'quotes' },
    { label: a.messages, value: stats.contacts_total, to: 'quotes?kind=contact' },
    { label: a.projectsPublished, value: stats.projects_published, to: 'portfolio' },
    { label: a.projectsDraft, value: stats.projects_draft, to: 'portfolio' },
    { label: a.servicesPublished, value: `${stats.services_published} / ${stats.services_total}`, to: 'services' },
  ];

  return (
    <>
      <PageHeader title={a.overview}>{a.staleNote}</PageHeader>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className={`rounded-2xl p-5 ring-1 transition-shadow hover:shadow-md ${c.accent ? 'bg-nar text-white ring-nar' : 'bg-white ring-line'}`}>
            <p className={`text-sm font-semibold ${c.accent ? 'text-white/80' : 'text-mute'}`}>{c.label}</p>
            <p className="mt-2 font-display text-4xl font-bold">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel title={a.recent}>
          {recent.length === 0 ? (
            <p className="flex items-center gap-2 py-6 text-sm text-mute"><Inbox className="size-4" /> {a.empty}</p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((q) => (
                <li key={q.id}>
                  <Link to={`quotes/${q.id}`} className="flex items-center gap-4 py-3 hover:bg-paper/60">
                    <span className="w-28 shrink-0 font-mono text-xs font-bold">{q.reference}</span>
                    <span className="min-w-0 flex-1 truncate text-sm"><b>{q.full_name}</b> <span className="text-mute">· {q.service_label || (q.kind === 'contact' ? a.contactMsg : '—')}</span></span>
                    <StatusBadge status={q.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title={a.integrations}>
          <ul className="space-y-3 text-sm">
            {integr === null ? (
              <li className="text-mute">{a.loading}</li>
            ) : !integr.reachable ? (
              <li className="flex gap-2 rounded-xl bg-nar-soft p-3 font-semibold text-nar-deep"><AlertTriangle className="size-4 shrink-0" />{a.fnMissing}</li>
            ) : integr.emailConfigured ? (
              <li className="flex gap-2 rounded-xl bg-teal/10 p-3 font-semibold text-teal"><CheckCircle2 className="size-4 shrink-0" />{a.emailOk}</li>
            ) : (
              <li className="flex gap-2 rounded-xl bg-saffron/20 p-3 font-semibold"><AlertTriangle className="size-4 shrink-0" />{a.emailMissing}</li>
            )}
            {stats.notifications_failed > 0 && (
              <li className="flex gap-2 rounded-xl bg-nar-soft p-3 font-semibold text-nar-deep"><AlertTriangle className="size-4 shrink-0" />{a.notifFailed}: {stats.notifications_failed}</li>
            )}
          </ul>
        </Panel>
      </div>
    </>
  );
}
