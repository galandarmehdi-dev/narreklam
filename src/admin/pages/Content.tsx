import { useEffect, useState } from 'react';
import type { L, Locale } from '@/lib/types';
import { LOCALES } from '@/lib/types';
import { EDITABLE_KEYS, getPath } from '@/i18n/editable';
import { dictionaries } from '@/i18n';
import { sb, must } from '../api';
import { useA } from '../i18n';
import { ErrorBox, LField, Loading, PageHeader, Panel, btn, useToast } from '../ui';

type Values = Record<string, L>;

export default function Content() {
  const a = useA();
  const toast = useToast();
  const [values, setValues] = useState<Values | null>(null);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    (async () => {
      try {
        const rows = must(await (await sb()).from('content_translations').select('block_key, locale, value')) || [];
        const v: Values = {};
        for (const k of EDITABLE_KEYS) v[k.key] = { az: '', ru: '', en: '' };
        for (const r of rows) if (v[r.block_key]) v[r.block_key][r.locale as Locale] = r.value;
        setValues(v);
      } catch (e) {
        setError(e);
      }
    })();
  }, []);

  if (error) return <ErrorBox error={error} />;
  if (!values) return <Loading />;

  const save = async () => {
    setBusy(true);
    try {
      const client = await sb();
      const keys = [...dirty];
      must(await client.from('content_blocks').upsert(keys.map((k) => ({ key: k, grp: EDITABLE_KEYS.find((e) => e.key === k)?.group || 'General' })), { onConflict: 'key' }));
      const upserts = keys.flatMap((k) => LOCALES.filter((l) => values[k][l].trim()).map((l) => ({ block_key: k, locale: l, value: values[k][l].trim() })));
      if (upserts.length) must(await client.from('content_translations').upsert(upserts, { onConflict: 'block_key,locale' }));
      for (const k of keys) {
        const empty = LOCALES.filter((l) => !values[k][l].trim());
        if (empty.length) must(await client.from('content_translations').delete().eq('block_key', k).in('locale', empty));
      }
      setDirty(new Set());
      toast(a.saved);
    } catch (e) {
      toast(String((e as Error).message), 'error');
    } finally {
      setBusy(false);
    }
  };

  const groups = Array.from(new Set(EDITABLE_KEYS.map((k) => k.group)));
  return (
    <>
      <PageHeader title={a.content} actions={<button type="button" className={btn.red} disabled={busy || dirty.size === 0} onClick={save}>{busy ? a.saving : `${a.save}${dirty.size ? ` (${dirty.size})` : ''}`}</button>}>
        {a.overrideHint}
      </PageHeader>
      <div className="space-y-6">
        {groups.map((g) => (
          <Panel key={g} title={g}>
            <div className="grid gap-5 lg:grid-cols-2">
              {EDITABLE_KEYS.filter((k) => k.group === g).map((k) => {
                const placeholder = Object.fromEntries(LOCALES.map((l) => [l, String(getPath(dictionaries[l], k.key) ?? '')])) as L;
                return (
                  <LField
                    key={k.key}
                    label={k.key}
                    multiline={k.multiline}
                    value={values[k.key]}
                    placeholder={placeholder}
                    onChange={(v) => {
                      setValues({ ...values, [k.key]: v });
                      setDirty(new Set(dirty).add(k.key));
                    }}
                  />
                );
              })}
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
