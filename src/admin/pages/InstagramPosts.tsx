import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import type { L } from '@/lib/types';
import { sb, must, uploadMedia, removeMedia, mediaPathFromUrl, swapOrder } from '../api';
import { useA } from '../i18n';
import { DeleteButton, ErrorBox, ImagePicker, LField, Loading, MoveButtons, PageHeader, Panel, TextInput, Toggle, btn, useToast } from '../ui';

interface Post { id: string; image_url: string; post_url: string; caption: Partial<L>; sort_order: number; is_published: boolean }

/** Admin-managed Instagram gallery: real photos + links to real posts (no scraping, no fake feed). */
export default function InstagramPosts() {
  const a = useA();
  const toast = useToast();
  const [list, setList] = useState<Post[] | null>(null);
  const [draft, setDraft] = useState<{ image_url: string; post_url: string; caption: Partial<L> } | null>(null);
  const [error, setError] = useState<unknown>(null);
  const reload = async () => {
    try {
      setList(must(await (await sb()).from('instagram_posts').select('*').order('sort_order')) || []);
    } catch (e) {
      setError(e);
    }
  };
  useEffect(() => {
    reload();
  }, []);
  if (error) return <ErrorBox error={error} />;
  if (!list) return <Loading />;

  const create = async () => {
    if (!draft?.image_url || !/^https:\/\/(www\.)?instagram\.com\//.test(draft.post_url)) return toast(`${a.postUrl}: https://www.instagram.com/p/…`, 'error');
    try {
      must(await (await sb()).from('instagram_posts').insert({ ...draft, sort_order: list.length }));
      setDraft(null);
      reload();
    } catch (e) {
      toast(String((e as Error).message), 'error');
    }
  };

  return (
    <>
      <PageHeader title={a.instagram} actions={<button type="button" className={btn.red} onClick={() => setDraft({ image_url: '', post_url: '', caption: {} })}><Plus className="size-4" />{a.add}</button>}>
        Instagram Graph API requires a Business account + app review; this curated gallery links to your real posts instead.
      </PageHeader>
      {draft && (
        <Panel className="mb-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <ImagePicker label={a.imageUrl} value={draft.image_url} onUpload={async (f) => setDraft({ ...draft, image_url: (await uploadMedia(f, 'instagram')).url })} />
            <div className="grid gap-3">
              <TextInput label={a.postUrl} placeholder="https://www.instagram.com/p/…" value={draft.post_url} onChange={(e) => setDraft({ ...draft, post_url: e.target.value.trim() })} />
              <LField label={a.caption} value={draft.caption} onChange={(v) => setDraft({ ...draft, caption: v })} />
              <div className="flex gap-2"><button type="button" className={btn.primary} onClick={create}>{a.create}</button><button type="button" className={btn.ghost} onClick={() => setDraft(null)}>{a.cancel}</button></div>
            </div>
          </div>
        </Panel>
      )}
      {list.length === 0 && !draft ? (
        <p className="rounded-2xl bg-white p-10 text-center text-sm text-mute ring-1 ring-line">{a.empty}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p, i) => (
            <li key={p.id} className="rounded-2xl bg-white p-3 ring-1 ring-line">
              <img src={p.image_url} alt="" className="aspect-square w-full rounded-xl object-cover" />
              <a href={p.post_url} target="_blank" rel="noopener noreferrer" className="mt-2 block truncate text-xs text-mute underline">{p.post_url}</a>
              <div className="mt-2 flex items-center justify-between">
                <MoveButtons first={i === 0} last={i === list.length - 1} onUp={() => swapOrder('instagram_posts', { id: p.id, order: p.sort_order }, { id: list[i - 1].id, order: list[i - 1].sort_order }).then(reload)} onDown={() => swapOrder('instagram_posts', { id: p.id, order: p.sort_order }, { id: list[i + 1].id, order: list[i + 1].sort_order }).then(reload)} />
                <Toggle checked={p.is_published} onChange={async (v) => { await (await sb()).from('instagram_posts').update({ is_published: v }).eq('id', p.id); reload(); }} label="" />
                <DeleteButton label="" onConfirm={async () => { must(await (await sb()).from('instagram_posts').delete().eq('id', p.id)); await removeMedia(mediaPathFromUrl(p.image_url)); reload(); }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
