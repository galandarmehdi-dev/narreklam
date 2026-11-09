import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import type { ArtVariant, Category, L } from '@/lib/types';
import { ICONS } from '@/lib/icons';
import { slugify } from '@/lib/text';
import { sb, must, saveTranslations, swapOrder, uploadMedia, SLUG_RE } from '../api';
import { useA } from '../i18n';
import { DeleteButton, ErrorBox, Field, ImagePicker, LField, Loading, MoveButtons, PageHeader, Panel, StatusPill, TextInput, Toggle, btn, inputCls, useToast } from '../ui';
import { loadCatalog } from './Services';

const ARTS: ArtVariant[] = ['design', 'space', 'print', 'production', 'promo', 'digital'];
const emptyL = (): L => ({ az: '', ru: '', en: '' });

export default function Categories() {
  const a = useA();
  const [list, setList] = useState<Category[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const reload = () =>
    loadCatalog()
      .then(({ categories, services }) => {
        setList(categories);
        setCounts(Object.fromEntries(categories.map((c) => [c.id, services.filter((s) => s.categoryId === c.id).length])));
      })
      .catch(setError);
  useEffect(() => {
    reload();
  }, []);

  if (error) return <ErrorBox error={error} />;
  if (!list) return <Loading />;
  const newCat: Category = { id: 'new', slug: '', order: list.length, published: false, icon: 'Layers', art: 'design', image: null, name: emptyL(), tagline: emptyL(), description: emptyL(), seoTitle: emptyL(), seoDescription: emptyL() };

  return (
    <>
      <PageHeader title={a.categories} actions={<button type="button" className={btn.red} onClick={() => setOpen('new')}><Plus className="size-4" />{a.newCategory}</button>} />
      <div className="space-y-3">
        {open === 'new' && <CategoryEditor initial={newCat} onDone={() => { setOpen(null); reload(); }} />}
        {list.map((c, i) => (
          <div key={c.id}>
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-line">
              <MoveButtons first={i === 0} last={i === list.length - 1} onUp={() => swapOrder('service_categories', c, list[i - 1]).then(reload)} onDown={() => swapOrder('service_categories', c, list[i + 1]).then(reload)} />
              <span className="min-w-0 flex-1 truncate font-semibold">{c.name.az} <span className="text-xs font-normal text-mute">/{c.slug} · {counts[c.id] || 0}</span></span>
              <StatusPill published={c.published} />
              <button type="button" className={btn.ghost} onClick={() => setOpen(open === c.id ? null : c.id)}>{a.edit}</button>
            </div>
            {open === c.id && <CategoryEditor initial={c} serviceCount={counts[c.id] || 0} onDone={() => { setOpen(null); reload(); }} />}
          </div>
        ))}
      </div>
    </>
  );
}

function CategoryEditor({ initial, onDone, serviceCount = 0 }: { initial: Category; onDone: () => void; serviceCount?: number }) {
  const a = useA();
  const toast = useToast();
  const [c, setC] = useState(structuredClone(initial));
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Category>(k: K, v: Category[K]) => setC({ ...c, [k]: v });
  const isNew = c.id === 'new';

  const save = async () => {
    const slug = c.slug || slugify(c.name.en || c.name.az);
    if (!SLUG_RE.test(slug)) return toast(a.slugHint, 'error');
    setBusy(true);
    try {
      const client = await sb();
      const row = { slug, is_published: c.published, icon: c.icon, art: c.art, image_url: c.image || null, sort_order: c.order };
      let id = c.id;
      if (isNew) id = must(await client.from('service_categories').insert(row).select('id').single()).id;
      else must(await client.from('service_categories').update(row).eq('id', id));
      await saveTranslations('service_category_translations', 'category_id', id, {
        name: c.name, tagline: c.tagline, description: c.description, seo_title: c.seoTitle, seo_description: c.seoDescription,
      });
      toast(a.saved);
      onDone();
    } catch (e) {
      toast(String((e as Error).message), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel className="mt-2 mb-4">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="grid gap-4">
          <LField label={a.name} value={c.name} onChange={(v) => set('name', v)} />
          <LField label={a.tagline} value={c.tagline} onChange={(v) => set('tagline', v)} />
          <LField label={a.description} value={c.description} onChange={(v) => set('description', v)} multiline />
          <LField label={a.seoTitle} value={c.seoTitle || {}} onChange={(v) => set('seoTitle', v)} />
          <LField label={a.seoDescription} value={c.seoDescription || {}} onChange={(v) => set('seoDescription', v)} multiline rows={2} />
        </div>
        <div className="grid content-start gap-4">
          <Toggle checked={c.published} onChange={(v) => set('published', v)} label={a.published} />
          <TextInput label={a.slug} hint={a.slugHint} value={c.slug} placeholder={slugify(c.name.en || c.name.az)} onChange={(e) => set('slug', e.target.value.trim())} />
          <Field label={a.icon} htmlFor={`ci-${c.id}`}>
            <select id={`ci-${c.id}`} className={inputCls} value={c.icon} onChange={(e) => set('icon', e.target.value)}>{Object.keys(ICONS).map((k) => <option key={k}>{k}</option>)}</select>
          </Field>
          <Field label={a.art} htmlFor={`ca-${c.id}`}>
            <select id={`ca-${c.id}`} className={inputCls} value={c.art} onChange={(e) => set('art', e.target.value as ArtVariant)}>{ARTS.map((k) => <option key={k}>{k}</option>)}</select>
          </Field>
          <ImagePicker label={a.image} value={c.image} onUpload={async (f) => set('image', (await uploadMedia(f, 'categories')).url)} onClear={() => set('image', null)} />
          <div className="flex flex-wrap gap-2 pt-2">
            <button type="button" className={btn.red} disabled={busy} onClick={save}>{busy ? a.saving : a.save}</button>
            <button type="button" className={btn.ghost} onClick={onDone}>{a.cancel}</button>
            {!isNew && serviceCount === 0 && (
              <DeleteButton onConfirm={async () => { try { must(await (await sb()).from('service_categories').delete().eq('id', c.id)); onDone(); } catch (e) { toast(String((e as Error).message), 'error'); } }} />
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}
