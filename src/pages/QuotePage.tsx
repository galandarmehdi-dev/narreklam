import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, FileText, Loader2, Lock, MessageCircle, Paperclip, Trash2, UploadCloud } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useCatalog, useSiteData } from '@/data/DataProvider';
import { useSeo } from '@/lib/seo';
import { paths } from '@/lib/paths';
import { fmt } from '@/lib/text';
import { whatsappLink } from '@/lib/whatsapp';
import { QUOTE_FIELDS } from '@/lib/quoteFields';
import { submitQuote, SubmitError, validateFile, type SubmitResult } from '@/lib/quote';
import { UPLOAD_LIMITS, isSupabaseConfigured } from '@/config/env';
import { PageHero } from '@/components/ui/PageHero';
import { waGeneralMessage, waServiceMessage } from '@/components/ui/CtaBand';

type Method = 'phone' | 'whatsapp' | 'email';

interface FormState {
  fullName: string;
  company: string;
  phone: string;
  whatsapp: string;
  sameAsPhone: boolean;
  email: string;
  category: string;
  service: string;
  description: string;
  deadline: string;
  contactMethod: Method;
  consent: boolean;
  website: string; // honeypot
  details: Record<string, string>;
}

const PHONE_RE = /^[+()\d\s-]{7,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function QuotePage() {
  const { t, lang, tr } = useI18n();
  const { categories, servicesOf, svcBySlug, catById } = useCatalog();
  const { settings } = useSiteData();
  const [params] = useSearchParams();
  const location = useLocation();
  const pre = svcBySlug.get(params.get('service') || '');

  useSeo({ title: t.seo.quote.t, description: t.seo.quote.d, lang, path: paths.quote as (l: typeof lang) => string });

  const [f, setF] = useState<FormState>(() => ({
    fullName: '', company: '', phone: '', whatsapp: '', sameAsPhone: true, email: '',
    category: pre ? catById.get(pre.categoryId)?.slug || '' : '',
    service: pre?.slug || '',
    description: '', deadline: '', contactMethod: 'whatsapp', consent: false, website: '', details: {},
  }));
  // Late-loaded catalog (from Supabase) → apply the preselection once it resolves.
  useEffect(() => {
    if (pre && !f.service) setF((s) => ({ ...s, service: pre.slug, category: catById.get(pre.categoryId)?.slug || '' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pre?.slug]);

  const [files, setFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'submitting' | 'done'>('idle');
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [drag, setDrag] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const cat = categories.find((c) => c.slug === f.category);
  const catServices = cat ? servicesOf(cat.id) : [];
  const service = svcBySlug.get(f.service);
  const extraFields = useMemo(() => (service?.quoteFields || []).map((k) => QUOTE_FIELDS[k]).filter(Boolean), [service]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setF((s) => ({ ...s, [k]: v }));
    if (errors[k as string]) setErrors((e) => ({ ...e, [k as string]: '' }));
  };

  const addFiles = (list: FileList | File[]) => {
    const errs: string[] = [];
    const next = [...files];
    for (const file of Array.from(list)) {
      if (next.length >= UPLOAD_LIMITS.maxFiles) {
        errs.push(fmt(t.quote.files.tooMany, { count: UPLOAD_LIMITS.maxFiles }));
        break;
      }
      const v = validateFile(file);
      if (v === 'type') errs.push(fmt(t.quote.files.badType, { name: file.name }));
      else if (v === 'size') errs.push(fmt(t.quote.files.tooBig, { name: file.name, size: UPLOAD_LIMITS.maxFileMb }));
      else if (!next.some((x) => x.name === file.name && x.size === file.size)) {
        // Ensure unique names (the server keys uploads by name).
        let named = file;
        if (next.some((x) => x.name === file.name)) named = new File([file], `${next.length + 1}-${file.name}`, { type: file.type });
        next.push(named);
      }
    }
    setFiles(next);
    setFileErrors(errs);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (f.fullName.trim().length < 2) e.fullName = t.quote.errors.required;
    if (!PHONE_RE.test(f.phone.trim())) e.phone = f.phone.trim() ? t.quote.errors.phone : t.quote.errors.required;
    if (!f.sameAsPhone && f.whatsapp.trim() && !PHONE_RE.test(f.whatsapp.trim())) e.whatsapp = t.quote.errors.phone;
    if (!EMAIL_RE.test(f.email.trim())) e.email = f.email.trim() ? t.quote.errors.email : t.quote.errors.required;
    if (!f.category) e.category = t.quote.errors.required;
    if (f.description.trim().length < 10) e.description = f.description.trim() ? t.quote.errors.short : t.quote.errors.required;
    if (!f.consent) e.consent = t.quote.errors.consent;
    return e;
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setSubmitError('');
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(e)[0]}"]`);
      first?.focus();
      return;
    }
    setState('submitting');
    try {
      const details: Record<string, string> = {};
      for (const fd of extraFields) if (f.details[fd.key]?.trim()) details[fd.label(t)] = f.details[fd.key].trim();
      const res = await submitQuote(
        {
          kind: 'quote',
          fullName: f.fullName.trim(),
          company: f.company.trim(),
          phone: f.phone.trim(),
          whatsapp: f.sameAsPhone ? f.phone.trim() : f.whatsapp.trim(),
          email: f.email.trim(),
          categorySlug: f.category,
          serviceSlug: f.service || undefined,
          serviceLabel: service ? tr(service.title) : cat ? tr(cat.name) : undefined,
          description: f.description.trim(),
          details,
          deadline: f.deadline || undefined,
          contactMethod: f.contactMethod,
          locale: lang,
          consent: f.consent,
          sourcePage: location.pathname + location.search,
          website: f.website,
        },
        files,
        (done, total) => setProgress({ done, total }),
      );
      setResult(res);
      setState('done');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const code = err instanceof SubmitError ? err.code : 'network';
      setSubmitError(code === 'not_configured' ? t.quote.errors.notConfigured : code === 'rate_limit' ? t.quote.errors.rateLimit : code === 'validation' ? t.quote.errors.summary : t.quote.errors.network);
      if (err instanceof SubmitError && err.fields) setErrors(err.fields);
      setState('idle');
    } finally {
      setProgress(null);
    }
  };

  const wa = (msg: string) => whatsappLink(settings.whatsapp, msg);

  if (state === 'done' && result) {
    const followUp = wa(fmt(t.quote.whatsappMessage, { ref: result.reference }));
    return (
      <section className="flex min-h-[90vh] items-center bg-paper pt-28 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="container-x max-w-3xl text-center">
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.15 }} className="mx-auto grid size-20 place-items-center rounded-full bg-nar text-white">
            <CheckCircle2 className="size-10" aria-hidden />
          </motion.span>
          <h1 className="h-section mt-8" tabIndex={-1} ref={(el) => el?.focus()}>{t.quote.success.title}</h1>
          <p className="lead mx-auto mt-4 max-w-xl">{t.quote.success.text}</p>
          <div className="mx-auto mt-8 inline-flex flex-col rounded-3xl bg-white px-8 py-5 ring-1 ring-line">
            <span className="text-xs font-bold uppercase tracking-widest text-mute">{t.quote.success.reference}</span>
            <span className="mt-1 font-display text-3xl font-extrabold tracking-tight text-nar" data-testid="quote-reference">{result.reference}</span>
          </div>
          {result.failedFiles.length > 0 && (
            <p role="alert" className="mx-auto mt-6 max-w-xl rounded-2xl bg-saffron/20 p-4 text-sm font-semibold">{fmt(t.quote.errors.upload, { names: result.failedFiles.join(', ') })}</p>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {followUp && (
              <a href={followUp} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp"><MessageCircle className="size-5" aria-hidden />{t.quote.success.whatsapp}</a>
            )}
            <Link to={paths.home(lang)} className="btn btn-dark">{t.quote.success.home}</Link>
            <button type="button" className="btn btn-ghost" onClick={() => { setResult(null); setFiles([]); setState('idle'); setF((s) => ({ ...s, description: '', details: {}, consent: false })); }}>{t.quote.success.another}</button>
          </div>
        </motion.div>
      </section>
    );
  }

  const err = (k: string) => errors[k] ? <p id={`${k}-err`} className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-nar"><AlertCircle className="size-4" aria-hidden />{errors[k]}</p> : null;
  const aria = (k: string) => ({ 'aria-invalid': errors[k] ? true : undefined, 'aria-describedby': errors[k] ? `${k}-err` : undefined });
  const fieldset = 'rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-line sm:p-8';
  const legend = 'mb-6 flex items-center gap-3 font-display text-xl font-bold';
  const num = (n: number) => <span className="grid size-8 place-items-center rounded-full bg-ink text-sm text-white">{n}</span>;

  return (
    <>
      <PageHero crumbs={[{ label: t.nav.home, to: paths.home(lang) }, { label: t.nav.quote }]} kicker={t.quote.kicker} title={t.quote.title} text={t.quote.text} />
      <section className="container-x py-12 md:py-20">
        {!isSupabaseConfigured && (
          <p role="note" className="mb-8 rounded-2xl border border-dashed border-nar/40 bg-nar-soft p-4 text-sm font-semibold text-nar-deep">
            {t.quote.errors.notConfigured}
          </p>
        )}
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
          <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-6" aria-describedby={submitError ? 'submit-err' : undefined}>
            {/* Honeypot (hidden from humans and assistive tech) */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set('website', e.target.value)} /></label>
            </div>

            <fieldset className={fieldset}>
              <legend className={legend}>{num(1)}{t.quote.sections.project}</legend>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="q-category" className="label">{t.quote.fields.category} *</label>
                  <select id="q-category" name="category" className="field" value={f.category} onChange={(e) => { set('category', e.target.value); set('service', ''); }} {...aria('category')}>
                    <option value="">{t.quote.select}</option>
                    {categories.map((c) => <option key={c.id} value={c.slug}>{tr(c.name)}</option>)}
                  </select>
                  {err('category')}
                </div>
                <div>
                  <label htmlFor="q-service" className="label">{t.quote.fields.service}</label>
                  <select id="q-service" name="service" className="field" value={f.service} onChange={(e) => set('service', e.target.value)} disabled={!cat}>
                    <option value="">{t.quote.anyService}</option>
                    {catServices.map((s) => <option key={s.id} value={s.slug}>{tr(s.title)}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-5">
                <label htmlFor="q-desc" className="label">{t.quote.fields.description} *</label>
                <textarea id="q-desc" name="description" rows={5} className="field resize-y" placeholder={t.quote.placeholders.description} value={f.description} onChange={(e) => set('description', e.target.value)} {...aria('description')} />
                {err('description')}
              </div>

              <AnimatePresence initial={false}>
                {extraFields.length > 0 && (
                  <motion.div key={f.service} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <p className="mt-6 mb-4 text-sm font-bold uppercase tracking-wider text-mute">{t.quote.sections.details} · {service && tr(service.title)}</p>
                    <div className="grid gap-5 sm:grid-cols-2">
                      {extraFields.map((fd) => (
                        <div key={fd.key}>
                          <label htmlFor={`q-x-${fd.key}`} className="label">{fd.label(t)} <span className="font-normal text-mute">({t.quote.optional})</span></label>
                          {fd.type === 'select' ? (
                            <select id={`q-x-${fd.key}`} className="field" value={f.details[fd.key] || ''} onChange={(e) => set('details', { ...f.details, [fd.key]: e.target.value })}>
                              <option value="">{t.quote.select}</option>
                              {fd.options?.(t).map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : (
                            <input id={`q-x-${fd.key}`} className="field" value={f.details[fd.key] || ''} placeholder={fd.placeholder?.(t)} onChange={(e) => set('details', { ...f.details, [fd.key]: e.target.value })} />
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-5 sm:w-1/2">
                <label htmlFor="q-deadline" className="label">{t.quote.fields.deadline} <span className="font-normal text-mute">({t.quote.optional})</span></label>
                <input id="q-deadline" type="date" className="field" min={new Date().toISOString().slice(0, 10)} value={f.deadline} onChange={(e) => set('deadline', e.target.value)} />
              </div>
            </fieldset>

            <fieldset className={fieldset}>
              <legend className={legend}>{num(2)}{t.quote.sections.files}</legend>
              <div
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${drag ? 'border-nar bg-nar-soft' : 'border-line bg-paper'}`}
              >
                <UploadCloud className="size-10 text-nar" aria-hidden />
                <label htmlFor="q-files" className="mt-3 cursor-pointer font-bold underline decoration-nar decoration-2 underline-offset-4">{t.quote.files.drop}</label>
                <input
                  ref={fileInput}
                  id="q-files"
                  type="file"
                  multiple
                  accept={UPLOAD_LIMITS.extensions.map((e) => `.${e}`).join(',')}
                  className="sr-only"
                  onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
                />
                <p className="mt-2 text-sm text-mute">{fmt(t.quote.files.hint, { size: UPLOAD_LIMITS.maxFileMb, count: UPLOAD_LIMITS.maxFiles })}</p>
              </div>
              {fileErrors.length > 0 && <ul role="alert" className="mt-3 space-y-1 text-sm font-semibold text-nar">{fileErrors.map((m) => <li key={m}>{m}</li>)}</ul>}
              {files.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {files.map((file) => (
                    <li key={file.name} className="flex items-center gap-3 rounded-xl bg-paper px-4 py-3">
                      <FileText className="size-5 shrink-0 text-mute" aria-hidden />
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{file.name}</span>
                      <span className="text-xs text-mute">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                      <button type="button" onClick={() => setFiles(files.filter((x) => x !== file))} className="grid size-9 place-items-center rounded-full hover:bg-white" aria-label={`${t.quote.files.remove}: ${file.name}`}>
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 flex items-center gap-2 text-xs text-mute"><Lock className="size-3.5" aria-hidden />{t.quote.secureNote}</p>
            </fieldset>

            <fieldset className={fieldset}>
              <legend className={legend}>{num(3)}{t.quote.sections.contact}</legend>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="q-name" className="label">{t.quote.fields.fullName} *</label>
                  <input id="q-name" name="fullName" autoComplete="name" className="field" placeholder={t.quote.placeholders.fullName} value={f.fullName} onChange={(e) => set('fullName', e.target.value)} {...aria('fullName')} />
                  {err('fullName')}
                </div>
                <div>
                  <label htmlFor="q-company" className="label">{t.quote.fields.company} <span className="font-normal text-mute">({t.quote.optional})</span></label>
                  <input id="q-company" autoComplete="organization" className="field" placeholder={t.quote.placeholders.company} value={f.company} onChange={(e) => set('company', e.target.value)} />
                </div>
                <div>
                  <label htmlFor="q-phone" className="label">{t.quote.fields.phone} *</label>
                  <input id="q-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" className="field" placeholder={t.quote.placeholders.phone} value={f.phone} onChange={(e) => set('phone', e.target.value)} {...aria('phone')} />
                  {err('phone')}
                  <label className="mt-3 flex items-center gap-2 text-sm">
                    <input type="checkbox" className="size-4 accent-[var(--color-nar)]" checked={f.sameAsPhone} onChange={(e) => set('sameAsPhone', e.target.checked)} />
                    {t.quote.fields.sameAsPhone} (WhatsApp)
                  </label>
                </div>
                {!f.sameAsPhone && (
                  <div>
                    <label htmlFor="q-wa" className="label">{t.quote.fields.whatsapp} <span className="font-normal text-mute">({t.quote.optional})</span></label>
                    <input id="q-wa" name="whatsapp" type="tel" inputMode="tel" className="field" placeholder={t.quote.placeholders.phone} value={f.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} {...aria('whatsapp')} />
                    {err('whatsapp')}
                  </div>
                )}
                <div className={f.sameAsPhone ? '' : 'sm:col-span-2'}>
                  <label htmlFor="q-email" className="label">{t.quote.fields.email} *</label>
                  <input id="q-email" name="email" type="email" inputMode="email" autoComplete="email" className="field" placeholder={t.quote.placeholders.email} value={f.email} onChange={(e) => set('email', e.target.value)} {...aria('email')} />
                  {err('email')}
                </div>
              </div>
              <div className="mt-6">
                <p className="label" id="q-method-label">{t.quote.fields.contactMethod}</p>
                <div role="radiogroup" aria-labelledby="q-method-label" className="grid grid-cols-3 gap-2">
                  {(['whatsapp', 'phone', 'email'] as Method[]).map((m) => (
                    <label key={m} className={`flex cursor-pointer items-center justify-center rounded-2xl px-3 py-3 text-sm font-bold ring-1 transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-nar ${f.contactMethod === m ? 'bg-ink text-white ring-ink' : 'bg-white ring-line hover:ring-ink'}`}>
                      <input type="radio" name="contactMethod" value={m} className="sr-only" checked={f.contactMethod === m} onChange={() => set('contactMethod', m)} />
                      {t.quote.contactMethods[m]}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <label className="flex items-start gap-3 text-sm">
                  <input name="consent" type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[var(--color-nar)]" checked={f.consent} onChange={(e) => set('consent', e.target.checked)} {...aria('consent')} />
                  <span>
                    {t.quote.fields.consent}{' '}
                    <Link to={paths.privacy(lang)} target="_blank" className="font-bold underline">{t.quote.fields.privacyLink}</Link>
                  </span>
                </label>
                {err('consent')}
              </div>
            </fieldset>

            {submitError && (
              <div id="submit-err" role="alert" className="flex items-start gap-3 rounded-2xl bg-nar-soft p-4 text-sm font-semibold text-nar-deep">
                <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
                <div>
                  <p>{submitError}</p>
                  {wa(waGeneralMessage[lang]) && (
                    <a className="mt-2 inline-flex items-center gap-1.5 underline" href={wa(waGeneralMessage[lang])!} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4" aria-hidden />{t.common.whatsapp}</a>
                  )}
                </div>
              </div>
            )}
            {Object.values(errors).some(Boolean) && !submitError && <p role="alert" className="text-sm font-semibold text-nar">{t.quote.errors.summary}</p>}

            <button type="submit" disabled={state === 'submitting'} className="btn btn-primary w-full !min-h-14 text-base disabled:opacity-70 sm:w-auto sm:px-10">
              {state === 'submitting' ? (
                <>
                  <Loader2 className="size-5 animate-spin" aria-hidden />
                  {progress ? fmt(t.quote.uploading, progress) : t.quote.submitting}
                </>
              ) : (
                <>
                  <Paperclip className="size-5" aria-hidden />
                  {t.quote.submit}
                </>
              )}
            </button>
          </form>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            {service && (
              <div className="rounded-[var(--radius-card)] bg-ink p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-white/60">{t.quote.preselected}</p>
                <p className="mt-2 font-display text-xl font-bold">{tr(service.title)}</p>
                <p className="mt-2 text-sm text-white/70">{tr(service.short)}</p>
              </div>
            )}
            <div className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line">
              <p className="font-display text-lg font-bold">{t.home.process.title}</p>
              <ol className="mt-4 space-y-3">
                {t.home.process.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-paper text-xs font-bold text-nar">{i + 1}</span>
                    <span className="font-semibold">{s.t}</span>
                  </li>
                ))}
              </ol>
            </div>
            {wa(waGeneralMessage[lang]) && (
              <a href={wa(service ? fmt(waServiceMessage[lang], { service: tr(service.title) }) : waGeneralMessage[lang])!} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp w-full">
                <MessageCircle className="size-5" aria-hidden />{t.common.whatsapp}
              </a>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
