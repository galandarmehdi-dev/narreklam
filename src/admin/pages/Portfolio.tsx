import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageOff, Plus, Star } from 'lucide-react';
import type { Category, PortfolioProject } from '@/lib/types';
import { PROJECT_SELECT, coverOf, mapProject } from '@/data/mappers';
import { sb, must, swapOrder } from '../api';
import { useA } from '../i18n';
import { ErrorBox, Loading, MoveButtons, PageHeader, StatusPill, btn, inputCls } from '../ui';
import { loadCatalog } from './Services';

export default function Portfolio() {
  const a = useA();
  const [list, setList] = useState<PortfolioProject[] | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState<unknown>(null);
  const reload = async () => {
    try {
      const client = await sb();
      const [p, c] = await Promise.all([client.from('portfolio_projects').select(PROJECT_SELECT).order('sort_order'), loadCatalog()]);
      setList((must(p) || []).map(mapProject));
      setCats(c.categories);
    } catch (e) {
      setError(e);
    }
  };
  useEffect(() => {
    reload();
  }, []);

  if (error) return <ErrorBox error={error} />;
  if (!list) return <Loading />;
  const shown = filter ? list.filter((p) => p.categoryId === filter) : list;

  return (
    <>
      <PageHeader title={a.portfolio} actions={<Link to="new" className={btn.red}><Plus className="size-4" />{a.newProject}</Link>}>{a.staleNote}</PageHeader>
      <select className={`${inputCls} mb-4 max-w-xs`} value={filter} onChange={(e) => setFilter(e.target.value)} aria-label={a.category}>
        <option value="">{a.category}: {a.all}</option>
        {cats.map((c) => <option key={c.id} value={c.id}>{c.name.az}</option>)}
      </select>
      {shown.length === 0 ? (
        <p className="rounded-2xl bg-white p-10 text-center text-sm text-mute ring-1 ring-line">{a.empty}</p>
      ) : (
        <ul className="space-y-2">
          {shown.map((p, i) => {
            const cover = coverOf(p);
            return (
              <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-line">
                {!filter && <MoveButtons first={i === 0} last={i === shown.length - 1} onUp={() => swapOrder('portfolio_projects', p, shown[i - 1]).then(reload)} onDown={() => swapOrder('portfolio_projects', p, shown[i + 1]).then(reload)} />}
                <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-paper">
                  {cover ? <img src={cover.url} alt="" className="h-full w-full object-cover" /> : <ImageOff className="size-5 text-mute" />}
                </div>
                <Link to={p.id} className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{p.title.az || p.slug}</span>
                  <span className="block truncate text-xs text-mute">{cats.find((c) => c.id === p.categoryId)?.name.az || '—'} · {p.images.length} foto</span>
                </Link>
                {p.featured && <Star className="size-4 fill-saffron text-saffron" aria-label={a.featured} />}
                {p.isDemo && <span className="rounded-full bg-saffron/30 px-2 py-0.5 text-xs font-bold">DEMO</span>}
                <StatusPill published={p.published} />
                <Link to={p.id} className={btn.ghost}>{a.edit}</Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
