import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, Loader2, Star, Trash2 } from 'lucide-react';
import type { Category, L, PortfolioImage, PortfolioProject, Service } from '@/lib/types';
import { PROJECT_SELECT, mapProject } from '@/data/mappers';
import { slugify } from '@/lib/text';
import { sb, must, saveTranslations, uploadMedia, removeMedia, SLUG_RE } from '../api';
import { useA } from '../i18n';
import { DeleteButton, ErrorBox, Field, LField, Loading, MoveButtons, PageHeader, Panel, TextInput, Toggle, btn, inputCls, useToast } from '../ui';
import { loadCatalog } from './Services';

const emptyL = (): L => ({ az: '', ru: '', en: '' });
const blank = (): PortfolioProject => ({
  id: '', slug: '', categoryId: null, serviceIds: [], title: emptyL(), summary: emptyL(), description: emptyL(), scope: emptyL(), materials: emptyL(),
  location: emptyL(), clientName: '', projectDate: '', coverImageId: null, images: [], published: false, featured: false, isDemo: false, order: 0,
});

export default function ProjectEdit() {
  const a = useA();
  const toast = useToast();
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const isNew = id === 'new';
  const [p, setP] = useState<PortfolioProject | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<unknown>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadProject = async () => {
    const client = await sb();
    return mapProject(must(await client.from('portfolio_projects').select(PROJECT_SELECT).eq('id', id).single()));
  };

  useEffect(() => {
    (async () => {
      try {
        const c = await loadCatalog();
        setCats(c.categories);
        setServices(c.services);
        setP(isNew ? blank() : await loadProject());
      } catch (e) {
        setError(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (error) return <ErrorBox error={error} />;
  if (!p) return <Loading />;
  const set = <K extends keyof PortfolioProject>(k: K, v: PortfolioProject[K]) => setP({ ...p, [k]: v });
  const setImg = (i: number, patch: Partial<PortfolioImage>) => set('images', p.images.map((im, j) => (j === i ? { ...im, ...patch } : im)));

  const save = async () => {
    const slug = p.slug || slugify(p.title.en || p.title.az);
    if (!SLUG_RE.test(slug)) return toast(a.slugHint, 'error');
    if (!p.title.az.trim()) return toast(`${a.title_} (AZ)`, 'error');
    setBusy(true);
    try {
      const client = await sb();
      const row = {
        slug, category_id: p.categoryId || null, client_name: p.clientName || null, project_date: p.projectDate || null,
        cover_image_id: p.coverImageId || null, is_published: p.published, is_featured: p.featured, is_demo: p.isDemo, sort_order: p.order,
      };
      let pid = p.id;
      if (isNew) pid = must(await client.from('portfolio_projects').insert(row).select('id').single()).id;
      else must(await client.from('portfolio_projects').update(row).eq('id', pid));
      await saveTranslations('portfolio_translations', 'project_id', pid, {
        title: p.title, summary: p.summary, description: p.description, scope: p.scope, materials: p.materials, location: p.location || emptyL(),
      });
      must(await client.from('project_services').delete().eq('project_id', pid));
      if (p.serviceIds.length) must(await client.from('project_services').insert(p.serviceIds.map((sid) => ({ project_id: pid, service_id: sid }))));
      for (const [i, im] of p.images.entries()) {
        must(await client.from('portfolio_images').update({ sort_order: i, alt: im.alt, caption: im.caption || {}, focal_x: im.focalX ?? 50, focal_y: im.focalY ?? 50 }).eq('id', im.id));
      }
      toast(a.saved);
      if (isNew) navigate(`../${pid}`, { relative: 'path', replace: true });
      else setP(await loadProject());
    } catch (e) {
      toast(String((e as Error).message), 'error');
    } finally {
      setBusy(false);
    }
  };

  const upload = async (files: FileList) => {
    const client = await sb();
    const list = Array.from(files);
    setUploading(list.length);
    const added: PortfolioImage[] = [];
    for (const [i, f] of list.entries()) {
      try {
        const up = await uploadMedia(f, `portfolio/${p.id}`);
        const alt = { az: p.title.az, ru: p.title.ru, en: p.title.en };
        const row = must(
          await client.from('portfolio_images').insert({ project_id: p.id, storage_path: up.path, url: up.url, alt, sort_order: p.images.length + i, width: up.width, height: up.height }).select('id').single(),
        );
        added.push({ id: row.id, url: up.url, storagePath: up.path, alt, caption: {}, order: p.images.length + i, focalX: 50, focalY: 50 });
      } catch (e) {
        toast(`${f.name}: ${(e as Error).message}`, 'error');
      }
      setUploading(list.length - i - 1);
    }
    const next = { ...p, images: [...p.images, ...added] };
    if (!next.coverImageId && added[0]) {
      next.coverImageId = added[0].id;
      await client.from('portfolio_projects').update({ cover_image_id: added[0].id }).eq('id', p.id);
    }
    setP(next);
  };

  const removeImage = async (im: PortfolioImage) => {
    if (!window.confirm(a.confirmDelete)) return;
    try {
      const client = await sb();
      must(await client.from('portfolio_images').delete().eq('id', im.id));
      await removeMedia(im.storagePath);
      set('images', p.images.filter((x) => x.id !== im.id));
      if (p.coverImageId === im.id) set('coverImageId', null);
    } catch (e) {
      toast(String((e as Error).message), 'error');
    }
  };

  const remove = async () => {
    try {
      const client = await sb();
      const paths = p.images.map((i) => i.storagePath).filter(Boolean) as string[];
      must(await client.from('portfolio_projects').delete().eq('id', p.id));
      if (paths.length) await client.storage.from('media').remove(paths);
      navigate('..', { relative: 'path' });
    } catch (e) {
      toast(String((e as Error).message), 'error');
    }
  };

  return (
    <>
      <Link to=".." relative="path" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-mute hover:text-ink"><ArrowLeft className="size-4" />{a.portfolio}</Link>
      <PageHeader title={isNew ? a.newProject : p.title.az || p.slug} actions={<button type="button" className={btn.red} disabled={busy} onClick={save}>{busy ? a.saving : a.save}</button>} />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Panel>
            <div className="grid gap-5">
              <LField label={a.title_} value={p.title} onChange={(v) => set('title', v)} />
              <LField label={a.summary} value={p.summary} onChange={(v) => set('summary', v)} />
              <LField label={a.description} value={p.description} onChange={(v) => set('description', v)} multiline rows={6} />
              <LField label={a.scope} value={p.scope} onChange={(v) => set('scope', v)} multiline rows={2} />
              <LField label={a.materials} value={p.materials} onChange={(v) => set('materials', v)} />
              <LField label={a.location} value={p.location || {}} onChange={(v) => set('location', v)} />
            </div>
          </Panel>

          <Panel
            title={`${a.images} (${p.images.length})`}
            actions={
              !isNew && (
                <button type="button" className={btn.ghost} disabled={uploading > 0} onClick={() => fileRef.current?.click()}>
                  {uploading > 0 ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                  {uploading > 0 ? `${uploading}…` : a.upload}
                </button>
              )
            }
          >
            <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => { if (e.target.files?.length) upload(e.target.files); e.target.value = ''; }} />
            {isNew ? (
              <p className="text-sm text-mute">{a.saveFirst}</p>
            ) : p.images.length === 0 ? (
              <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-line py-10 text-sm text-mute hover:border-ink">
                <ImagePlus className="size-8" />{a.upload}
              </button>
            ) : (
              <>
                <p className="mb-3 text-xs text-mute">{a.focalHint}</p>
                <ul className="space-y-4">
                  {p.images.map((im, i) => (
                    <li key={im.id} className="grid gap-3 rounded-xl bg-paper p-3 sm:grid-cols-[10rem_1fr]">
                      <button
                        type="button"
                        className="relative aspect-[4/3] overflow-hidden rounded-lg"
                        aria-label={a.focalHint}
                        onClick={(e) => {
                          const r = e.currentTarget.getBoundingClientRect();
                          setImg(i, { focalX: Math.round(((e.clientX - r.left) / r.width) * 100), focalY: Math.round(((e.clientY - r.top) / r.height) * 100) });
                        }}
                      >
                        <img src={im.url} alt="" className="h-full w-full object-cover" style={{ objectPosition: `${im.focalX ?? 50}% ${im.focalY ?? 50}%` }} />
                        <span className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-nar shadow" style={{ left: `${im.focalX ?? 50}%`, top: `${im.focalY ?? 50}%` }} />
                        {p.coverImageId === im.id && <span className="absolute top-1 left-1 rounded-full bg-saffron px-2 py-0.5 text-[0.65rem] font-bold">{a.cover}</span>}
                      </button>
                      <div className="grid gap-2">
                        <LField label={a.alt} value={im.alt} onChange={(v) => setImg(i, { alt: v })} />
                        <LField label={a.caption} value={im.caption || {}} onChange={(v) => setImg(i, { caption: v })} />
                        <div className="flex flex-wrap items-center gap-2">
                          <MoveButtons first={i === 0} last={i === p.images.length - 1} onUp={() => { const im2 = [...p.images]; [im2[i], im2[i - 1]] = [im2[i - 1], im2[i]]; set('images', im2); }} onDown={() => { const im2 = [...p.images]; [im2[i], im2[i + 1]] = [im2[i + 1], im2[i]]; set('images', im2); }} />
                          <button type="button" className={btn.ghost} disabled={p.coverImageId === im.id} onClick={() => set('coverImageId', im.id)}><Star className="size-4" />{a.setCover}</button>
                          <button type="button" className={btn.icon} aria-label={a.delete} onClick={() => removeImage(im)}><Trash2 className="size-4" /></button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel>
            <div className="grid gap-4">
              <Toggle checked={p.published} onChange={(v) => set('published', v)} label={a.published} />
              <Toggle checked={p.featured} onChange={(v) => set('featured', v)} label={a.featured} />
              <Toggle checked={p.isDemo} onChange={(v) => set('isDemo', v)} label={a.demo} />
              <TextInput label={a.slug} hint={a.slugHint} value={p.slug} placeholder={slugify(p.title.en || p.title.az)} onChange={(e) => set('slug', e.target.value.trim())} />
              <Field label={a.category} htmlFor="pr-cat">
                <select id="pr-cat" className={inputCls} value={p.categoryId || ''} onChange={(e) => set('categoryId', e.target.value || null)}>
                  <option value="">—</option>
                  {cats.map((c) => <option key={c.id} value={c.id}>{c.name.az}</option>)}
                </select>
              </Field>
              <TextInput label={a.client} value={p.clientName || ''} onChange={(e) => set('clientName', e.target.value)} />
              <TextInput label={a.date} type="date" value={p.projectDate || ''} onChange={(e) => set('projectDate', e.target.value)} />
            </div>
          </Panel>
          <Panel title={a.servicesUsed}>
            <div className="max-h-80 space-y-4 overflow-y-auto">
              {cats.map((c) => (
                <fieldset key={c.id}>
                  <legend className="mb-1 text-xs font-bold text-mute uppercase">{c.name.az}</legend>
                  {services.filter((s) => s.categoryId === c.id).map((s) => (
                    <label key={s.id} className="flex items-center gap-2 py-0.5 text-sm">
                      <input type="checkbox" className="size-4 accent-[var(--color-nar)]" checked={p.serviceIds.includes(s.id)} onChange={(e) => set('serviceIds', e.target.checked ? [...p.serviceIds, s.id] : p.serviceIds.filter((x) => x !== s.id))} />
                      {s.title.az}
                    </label>
                  ))}
                </fieldset>
              ))}
            </div>
          </Panel>
          {!isNew && <DeleteButton onConfirm={remove} />}
        </div>
      </div>
    </>
  );
}
