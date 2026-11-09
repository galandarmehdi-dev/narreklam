import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { Category, Service } from '@/lib/types';
import { CATEGORY_SELECT, SERVICE_SELECT, mapCategory, mapService } from '@/data/mappers';
import { iconFor } from '@/lib/icons';
import { sb, must, swapOrder } from '../api';
import { useA } from '../i18n';
import { ErrorBox, Loading, MoveButtons, PageHeader, StatusPill, Toggle, btn, useToast } from '../ui';

export async function loadCatalog(): Promise<{ categories: Category[]; services: Service[] }> {
  const client = await sb();
  const [c, s] = await Promise.all([
    client.from('service_categories').select(CATEGORY_SELECT).order('sort_order'),
    client.from('services').select(SERVICE_SELECT).order('sort_order'),
  ]);
  return { categories: (must(c) || []).map(mapCategory), services: (must(s) || []).map(mapService) };
}

export default function Services() {
  const a = useA();
  const toast = useToast();
  const [data, setData] = useState<{ categories: Category[]; services: Service[] } | null>(null);
  const [error, setError] = useState<unknown>(null);
  const reload = () => loadCatalog().then(setData).catch(setError);
  useEffect(() => {
    reload();
  }, []);

  const togglePublish = async (s: Service, v: boolean) => {
    try {
      must(await (await sb()).from('services').update({ is_published: v }).eq('id', s.id));
      reload();
    } catch (e) {
      toast(String((e as Error).message), 'error');
    }
  };

  if (error) return <ErrorBox error={error} />;
  if (!data) return <Loading />;

  return (
    <>
      <PageHeader title={a.services} actions={<Link to="new" className={btn.red}><Plus className="size-4" />{a.newService}</Link>}>{a.staleNote}</PageHeader>
      {data.categories.length === 0 && <p className="rounded-2xl bg-saffron/20 p-4 text-sm font-semibold">No categories found — apply supabase/seed.sql (see README).</p>}
      <div className="space-y-6">
        {data.categories.map((c) => {
          const list = data.services.filter((s) => s.categoryId === c.id);
          return (
            <section key={c.id} className="rounded-2xl bg-white ring-1 ring-line">
              <header className="flex items-center justify-between border-b border-line px-5 py-3">
                <h2 className="font-sans text-sm font-bold tracking-normal">{c.name.az} <span className="font-normal text-mute">· {list.length}</span></h2>
                <StatusPill published={c.published} />
              </header>
              <ul className="divide-y divide-line">
                {list.map((s, i) => {
                  const Icon = iconFor(s.icon);
                  return (
                    <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                      <MoveButtons first={i === 0} last={i === list.length - 1} onUp={() => swapOrder('services', s, list[i - 1]).then(reload)} onDown={() => swapOrder('services', s, list[i + 1]).then(reload)} />
                      <Icon className="size-4 text-nar" />
                      <Link to={s.id} className="min-w-0 flex-1 truncate font-semibold hover:underline">{s.title.az || s.slug}</Link>
                      <span className="hidden text-xs text-mute sm:inline">{s.items.filter((x) => x.published).length}/{s.items.length}</span>
                      <Toggle checked={s.published} onChange={(v) => togglePublish(s, v)} label="" />
                      <Link to={s.id} className={btn.ghost}>{a.edit}</Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
