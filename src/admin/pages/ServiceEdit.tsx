import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import type { Category, FaqEntry, L, Locale, QuoteFieldKey, Service, ServiceItem } from '@/lib/types';
import { LOCALES } from '@/lib/types';
import { ICONS } from '@/lib/icons';
import { ALL_QUOTE_FIELD_KEYS, QUOTE_FIELDS } from '@/lib/quoteFields';
import { dictionaries } from '@/i18n';
import { slugify } from '@/lib/text';
import { sb, must, saveTranslations, uploadMedia, SLUG_RE } from '../api';
import { useA } from '../i18n';
import { DeleteButton, ErrorBox, Field, ImagePicker, LField, Loading, MoveButtons, PageHeader, Panel, TextInput, Toggle, btn, inputCls, useToast } from '../ui';
import { loadCatalog } from './Services';

const emptyL = (): L => ({ az: '', ru: '', en: '' });
const blank = (categoryId: string): Service => ({
  id: '', slug: '', categoryId, order: 99, published: false, icon: 'Layers', image: null,
  title: emptyL(), short: emptyL(), headline: emptyL(), intro: emptyL(), items: [],
  applications: { az: [], ru: [], en: [] }, faq: { az: [], ru: [], en: [] }, keywords: emptyL(), quoteFields: [], seoTitle: emptyL(), seoDescription: emptyL(),
});

export default function ServiceEdit() {
  const a = useA();
  const toast = useToast();
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const isNew = id === 'new';
  const [cats, setCats] = useState<Category[]>([]);
  const [s, setS] = useState<Service | null>(null);
  const [originalItems, setOriginalItems] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [faqLang, setFaqLang] = useState<Locale>('az');

  useEffect(() => {
    loadCatalog()
      .then(({ categories, services }) => {
        setCats(categories);
        const found = isNew ? blank(categories[0]?.id || '') : services.find((x) => x.id === id);
        if (!found) throw new Error('Not found');
        setS(structuredClone(found));
        setOriginalItems(found.items.map((i) => i.id));
      })
      .catch(setError);
  }, [id, isNew]);

  if (error) return <ErrorBox error={error} />;
  if (!s) return <Loading />;
  const set = <K extends keyof Service>(k: K, v: Service[K]) => setS({ ...s, [k]: v });
  const setItem = (i: number, patch: Partial<ServiceItem>) => set('items', s.items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const moveItem = (i: number, d: number) => {
    const items = [...s.items];
    [items[i], items[i + d]] = [items[i + d], items[i]];
    set('items', items);
  };
  const setFaq = (list: FaqEntry[]) => set('faq', { ...s.faq, [faqLang]: list });

  const save = async () => {
    const slug = s.slug || slugify(s.title.en || s.title.az);
    if (!SLUG_RE.test(slug)) return toast(a.slugHint, 'error');
    if (!s.title.az.trim()) return toast(`${a.title_} (AZ)`, 'error');
    setBusy(true);
    try {
      const client = await sb();
      const row = { slug, category_id: s.categoryId, is_published: s.published, icon: s.icon, image_url: s.image || null, quote_fields: s.quoteFields, sort_order: s.order };
      let sid = s.id;
      if (isNew) sid = must(await client.from('services').insert(row).select('id').single()).id;
      else must(await client.from('services').update(row).eq('id', sid));

      await saveTranslations('service_translations', 'service_id', sid, {
        title: s.title, short: s.short, headline: s.headline, intro: s.intro, keywords: s.keywords,
        seo_title: s.seoTitle, seo_description: s.seoDescription, applications: s.applications, faq: s.faq,
      });

      // Sub-services: delete removed, upsert the rest in their current order.
      const keep = s.items.filter((it) => !it.id.startsWith('new-')).map((it) => it.id);
      const removed = originalItems.filter((x) => !keep.includes(x));
      if (removed.length) must(await client.from('service_items').delete().in('id', removed));
      for (const [i, it] of s.items.entries()) {
        let iid = it.id;
        if (iid.startsWith('new-')) iid = must(await client.from('service_items').insert({ service_id: sid, sort_order: i, is_published: it.published }).select('id').single()).id;
        else must(await client.from('service_items').update({ sort_order: i, is_published: it.published }).eq('id', iid));
        must(await client.from('service_item_translations').upsert(LOCALES.map((l) => ({ item_id: iid, locale: l, name: it.name[l] })), { onConflict: 'item_id,locale' }));
      }
      toast(a.saved);
      if (isNew) navigate(`../${sid}`, { relative: 'path', replace: true });
      else {
        const fresh = (await loadCatalog()).services.find((x) => x.id === sid)!;
        setS(structuredClone(fresh));
        setOriginalItems(fresh.items.map((i) => i.id));
      }
    } catch (e) {
      toast(String((e as Error).message), 'error');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    try {
      must(await (await sb()).from('services').delete().eq('id', s.id));
      navigate('..', { relative: 'path' });
    } catch (e) {
      toast(String((e as Error).message), 'error');
    }
  };

  return (
    <>
      <Link to=".." relative="path" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-mute hover:text-ink"><ArrowLeft className="size-4" />{a.services}</Link>
      <PageHeader title={isNew ? a.newService : s.title.az || s.slug} actions={<button type="button" className={btn.red} disabled={busy} onClick={save}>{busy ? a.saving : a.save}</button>} />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Panel>
            <div className="grid gap-5">
              <LField label={a.title_} value={s.title} onChange={(v) => set('title', v)} />
              <LField label={a.short} value={s.short} onChange={(v) => set('short', v)} />
              <LField label={a.headline} value={s.headline} onChange={(v) => set('headline', v)} />
              <LField label={a.intro} value={s.intro} onChange={(v) => set('intro', v)} multiline rows={4} />
              <LField
                label={a.applications}
                multiline
                rows={4}
                value={{ az: s.applications.az.join('\n'), ru: s.applications.ru.join('\n'), en: s.applications.en.join('\n') }}
                onChange={(v) => set('applications', { az: lines(v.az), ru: lines(v.ru), en: lines(v.en) })}
              />
              <LField label={a.keywords} value={s.keywords} onChange={(v) => set('keywords', v)} multiline rows={2} />
            </div>
          </Panel>

          <Panel title={`${a.items} (${s.items.length})`} actions={<button type="button" className={btn.ghost} onClick={() => set('items', [...s.items, { id: `new-${Date.now()}`, name: emptyL(), published: true }])}><Plus className="size-4" />{a.addItem}</button>}>
            <ul className="space-y-3">
              {s.items.map((it, i) => (
                <li key={it.id} className="rounded-xl bg-paper p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <MoveButtons first={i === 0} last={i === s.items.length - 1} onUp={() => moveItem(i, -1)} onDown={() => moveItem(i, 1)} />
                    <div className="flex items-center gap-2">
                      <Toggle checked={it.published} onChange={(v) => setItem(i, { published: v })} label={it.published ? a.published : a.draft} />
                      <button type="button" className={btn.icon} aria-label={a.delete} onClick={() => set('items', s.items.filter((_, j) => j !== i))}><Trash2 className="size-4" /></button>
                    </div>
                  </div>
                  <LField label={`${a.name} #${i + 1}`} value={it.name} onChange={(v) => setItem(i, { name: v })} />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title={a.faqTitle}
            actions={
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg bg-paper p-0.5">
                  {LOCALES.map((l) => (
                    <button key={l} type="button" onClick={() => setFaqLang(l)} className={`rounded-md px-2 py-0.5 text-xs font-extrabold uppercase ${faqLang === l ? 'bg-white shadow-sm' : 'text-mute'}`}>{l}</button>
                  ))}
                </div>
                <button type="button" className={btn.ghost} onClick={() => setFaq([...(s.faq[faqLang] || []), { q: '', a: '' }])}><Plus className="size-4" />{a.addQuestion}</button>
              </div>
            }
          >
            <ul className="space-y-3">
              {(s.faq[faqLang] || []).map((f, i, list) => (
                <li key={i} className="space-y-2 rounded-xl bg-paper p-3">
                  <input className={inputCls} placeholder={a.question} value={f.q} onChange={(e) => setFaq(list.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} aria-label={a.question} />
                  <textarea className={`${inputCls} resize-y`} rows={2} placeholder={a.answer} value={f.a} onChange={(e) => setFaq(list.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} aria-label={a.answer} />
                  <button type="button" className="text-xs font-bold text-nar" onClick={() => setFaq(list.filter((_, j) => j !== i))}>{a.delete}</button>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel>
            <div className="grid gap-4">
              <Toggle checked={s.published} onChange={(v) => set('published', v)} label={a.published} />
              <TextInput label={a.slug} hint={a.slugHint} value={s.slug} placeholder={slugify(s.title.en || s.title.az)} onChange={(e) => set('slug', e.target.value.trim())} />
              <Field label={a.category} htmlFor="svc-cat">
                <select id="svc-cat" className={inputCls} value={s.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
                  {cats.map((c) => <option key={c.id} value={c.id}>{c.name.az}</option>)}
                </select>
              </Field>
              <Field label={a.icon} htmlFor="svc-icon">
                <select id="svc-icon" className={inputCls} value={s.icon} onChange={(e) => set('icon', e.target.value)}>
                  {Object.keys(ICONS).map((k) => <option key={k}>{k}</option>)}
                </select>
              </Field>
              <ImagePicker label={a.image} value={s.image} onUpload={async (f) => set('image', (await uploadMedia(f, 'services')).url)} onClear={() => set('image', null)} />
            </div>
          </Panel>
          <Panel title={a.quoteFields}>
            <div className="grid gap-2">
              {ALL_QUOTE_FIELD_KEYS.map((k: QuoteFieldKey) => (
                <label key={k} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="size-4 accent-[var(--color-nar)]" checked={s.quoteFields.includes(k)} onChange={(e) => set('quoteFields', e.target.checked ? [...s.quoteFields, k] : s.quoteFields.filter((x) => x !== k))} />
                  {QUOTE_FIELDS[k].label(dictionaries.az)}
                </label>
              ))}
            </div>
          </Panel>
          <Panel title="SEO">
            <div className="grid gap-4">
              <LField label={a.seoTitle} value={s.seoTitle || {}} onChange={(v) => set('seoTitle', v)} />
              <LField label={a.seoDescription} value={s.seoDescription || {}} onChange={(v) => set('seoDescription', v)} multiline rows={3} />
            </div>
          </Panel>
          {!isNew && <DeleteButton onConfirm={remove} />}
        </div>
      </div>
    </>
  );
}

const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);
