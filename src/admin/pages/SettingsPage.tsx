import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';
import { mapSettings, settingsToRow } from '@/data/mappers';
import { sb, must, uploadMedia, integrationStatus } from '../api';
import { useA } from '../i18n';
import { ErrorBox, ImagePicker, LField, Loading, PageHeader, Panel, TextInput, btn, useToast } from '../ui';

export default function SettingsPage() {
  const a = useA();
  const toast = useToast();
  const [s, setS] = useState<SiteSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [integr, setIntegr] = useState<{ reachable: boolean; emailConfigured?: boolean } | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    (async () => {
      try {
        setS(mapSettings(must(await (await sb()).from('site_settings').select('*').eq('id', 1).maybeSingle())));
      } catch (e) {
        setError(e);
      }
      setIntegr(await integrationStatus());
    })();
  }, []);

  if (error) return <ErrorBox error={error} />;
  if (!s) return <Loading />;
  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setS({ ...s, [k]: v });
  const urlOk = (u: string) => !u || /^https:\/\//.test(u);

  const save = async () => {
    const urls = [s.instagram, s.facebook, s.tiktok, s.linkedin, s.youtube, s.mapLink, s.mapEmbedUrl];
    if (!urls.every(urlOk)) return toast('URLs must start with https://', 'error');
    setBusy(true);
    try {
      must(await (await sb()).from('site_settings').upsert(settingsToRow(s), { onConflict: 'id' }));
      toast(a.saved);
    } catch (e) {
      toast(String((e as Error).message), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title={a.settings} actions={<button type="button" className={btn.red} disabled={busy} onClick={save}>{busy ? a.saving : a.save}</button>}>
        {!s.phone && !s.email && <span className="font-semibold text-nar">{a.placeholderWarn}</span>}
      </PageHeader>
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title={a.settings}>
          <div className="grid gap-4">
            <TextInput label={a.companyName} value={s.companyName} onChange={(e) => set('companyName', e.target.value)} />
            <ImagePicker label={a.logo} value={s.logoUrl} onUpload={async (f) => set('logoUrl', (await uploadMedia(f, 'brand')).url)} onClear={() => set('logoUrl', null)} />
            <p className="-mt-2 text-xs text-mute">{a.logoHint}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label={a.phone} type="tel" placeholder="+994 …" value={s.phone} onChange={(e) => set('phone', e.target.value)} />
              <TextInput label={a.phone2} type="tel" value={s.phoneSecondary} onChange={(e) => set('phoneSecondary', e.target.value)} />
              <TextInput label={a.whatsapp} type="tel" placeholder="+994 …" hint="wa.me" value={s.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
              <TextInput label={a.email} type="email" value={s.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <LField label={a.address} value={s.address} onChange={(v) => set('address', v)} />
            <LField label={a.hours} value={s.workingHours} onChange={(v) => set('workingHours', v)} multiline rows={2} />
            <TextInput label={a.mapLink} placeholder="https://maps.app.goo.gl/…" value={s.mapLink} onChange={(e) => set('mapLink', e.target.value.trim())} />
            <TextInput label={a.mapEmbed} placeholder="https://www.google.com/maps/embed?pb=…" value={s.mapEmbedUrl} onChange={(e) => set('mapEmbedUrl', e.target.value.trim())} />
          </div>
        </Panel>
        <div className="space-y-6">
          <Panel title={a.social}>
            <div className="grid gap-4">
              {(['instagram', 'facebook', 'tiktok', 'linkedin', 'youtube'] as const).map((k) => (
                <TextInput key={k} label={k} placeholder={`https://www.${k}.com/…`} value={s[k]} onChange={(e) => set(k, e.target.value.trim())} />
              ))}
            </div>
          </Panel>
          <Panel title={a.integrations}>
            {integr === null ? (
              <p className="text-sm text-mute">{a.loading}</p>
            ) : !integr.reachable ? (
              <p className="flex gap-2 rounded-xl bg-nar-soft p-3 text-sm font-semibold text-nar-deep"><AlertTriangle className="size-4 shrink-0" />{a.fnMissing}</p>
            ) : integr.emailConfigured ? (
              <p className="flex gap-2 rounded-xl bg-teal/10 p-3 text-sm font-semibold text-teal"><CheckCircle2 className="size-4 shrink-0" />{a.emailOk}</p>
            ) : (
              <p className="flex gap-2 rounded-xl bg-saffron/20 p-3 text-sm font-semibold"><AlertTriangle className="size-4 shrink-0" />{a.emailMissing}</p>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
