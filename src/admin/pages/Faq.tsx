import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import type { FaqItem } from '@/lib/types';
import { mapFaq } from '@/data/mappers';
import { sb, must, saveTranslations, swapOrder } from '../api';
import { useA } from '../i18n';
import { DeleteButton, ErrorBox, LField, Loading, MoveButtons, PageHeader, Panel, Toggle, btn, useToast } from '../ui';

export default function Faq() {
  const a = useA();
  const toast = useToast();
  const [list, setList] = useState<FaqItem[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const reload = async () => {
    try {
      const rows = must(await (await sb()).from('faq_items').select('*, faq_translations(*)').order('sort_order')) || [];
      setList(rows.map(mapFaq));
    } catch (e) {
      setError(e);
    }
  };
  useEffect(() => {
    reload();
  }, []);

  if (error) return <ErrorBox error={error} />;
  if (!list) return <Loading />;

  const add = async () => {
    try {
      must(await (await sb()).from('faq_items').insert({ sort_order: list.length, is_published: false }));
      reload();
    } catch (e) {
      toast(String((e as Error).message), 'error');
    }
  };

  return (
    <>
      <PageHeader title={a.faq} actions={<button type="button" className={btn.red} onClick={add}><Plus className="size-4" />{a.addQuestion}</button>} />
      <div className="space-y-3">
        {list.length === 0 && <p className="rounded-2xl bg-white p-10 text-center text-sm text-mute ring-1 ring-line">{a.empty}</p>}
        {list.map((f, i) => <FaqRow key={f.id} item={f} first={i === 0} last={i === list.length - 1} onUp={() => swapOrder('faq_items', f, list[i - 1]).then(reload)} onDown={() => swapOrder('faq_items', f, list[i + 1]).then(reload)} onChanged={reload} />)}
      </div>
    </>
  );
}

function FaqRow({ item, first, last, onUp, onDown, onChanged }: { item: FaqItem; first: boolean; last: boolean; onUp: () => void; onDown: () => void; onChanged: () => void }) {
  const a = useA();
  const toast = useToast();
  const [f, setF] = useState(item);
  const save = async () => {
    try {
      must(await (await sb()).from('faq_items').update({ is_published: f.published }).eq('id', f.id));
      await saveTranslations('faq_translations', 'faq_id', f.id, { question: f.question, answer: f.answer });
      toast(a.saved);
      onChanged();
    } catch (e) {
      toast(String((e as Error).message), 'error');
    }
  };
  return (
    <Panel>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <MoveButtons first={first} last={last} onUp={onUp} onDown={onDown} />
        <Toggle checked={f.published} onChange={(v) => setF({ ...f, published: v })} label={a.published} />
      </div>
      <div className="grid gap-3">
        <LField label={a.question} value={f.question} onChange={(v) => setF({ ...f, question: v })} />
        <LField label={a.answer} value={f.answer} onChange={(v) => setF({ ...f, answer: v })} multiline />
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" className={btn.primary} onClick={save}>{a.save}</button>
        <DeleteButton onConfirm={async () => { must(await (await sb()).from('faq_items').delete().eq('id', f.id)); onChanged(); }} />
      </div>
    </Panel>
  );
}
