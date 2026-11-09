import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowUpRight, CheckCircle2, Clock, Instagram, Loader2, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useSiteData } from '@/data/DataProvider';
import { breadcrumbLd, useSeo } from '@/lib/seo';
import { paths } from '@/lib/paths';
import { telLink, whatsappLink } from '@/lib/whatsapp';
import { submitQuote, SubmitError } from '@/lib/quote';
import { PageHero } from '@/components/ui/PageHero';
import { SocialLinks } from '@/components/layout/Footer';
import { waGeneralMessage } from '@/components/ui/CtaBand';

export default function ContactPage() {
  const { t, lang, tr } = useI18n();
  const { settings } = useSiteData();
  useSeo({
    title: t.seo.contact.t,
    description: t.seo.contact.d,
    lang,
    path: paths.contact,
    jsonLd: breadcrumbLd([{ name: t.nav.home, url: paths.home(lang) }, { name: t.nav.contact, url: paths.contact(lang) }]),
  });
  const wa = whatsappLink(settings.whatsapp, waGeneralMessage[lang]);
  const na = <span className="text-mute italic" data-placeholder="contact">{t.common.notProvided}</span>;

  const cards = [
    { Icon: Phone, label: t.contact.phone, value: settings.phone ? <a href={telLink(settings.phone)} className="link-underline">{settings.phone}</a> : na, extra: settings.phoneSecondary && <a href={telLink(settings.phoneSecondary)} className="link-underline">{settings.phoneSecondary}</a> },
    { Icon: MessageCircle, label: t.contact.whatsapp, value: wa ? <a href={wa} target="_blank" rel="noopener noreferrer" className="link-underline">{settings.whatsapp}</a> : na },
    { Icon: Mail, label: t.contact.email, value: settings.email ? <a href={`mailto:${settings.email}`} className="link-underline">{settings.email}</a> : na },
    { Icon: MapPin, label: t.contact.address, value: tr(settings.address) || na, extra: settings.mapLink && <a href={settings.mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-nar">{t.contact.map}<ArrowUpRight className="size-4" aria-hidden /></a> },
    { Icon: Clock, label: t.contact.hours, value: tr(settings.workingHours) ? <span className="whitespace-pre-line">{tr(settings.workingHours)}</span> : na },
    { Icon: Instagram, label: 'Instagram', value: settings.instagram ? <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="link-underline">{settings.instagram.replace(/^https?:\/\/(www\.)?/, '')}</a> : na },
  ];

  return (
    <>
      <PageHero crumbs={[{ label: t.nav.home, to: paths.home(lang) }, { label: t.nav.contact }]} kicker={t.contact.kicker} title={t.contact.title} text={t.contact.text}>
        <div className="mt-8 flex flex-wrap gap-3">
          {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp"><MessageCircle className="size-5" aria-hidden />{t.common.whatsapp}</a>}
          {settings.phone && <a href={telLink(settings.phone)} className="btn btn-dark"><Phone className="size-5" aria-hidden />{settings.phone}</a>}
        </div>
      </PageHero>
      <section className="container-x py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {cards.map(({ Icon, label, value, extra }) => (
                <li key={label} className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line">
                  <Icon className="size-6 text-nar" aria-hidden />
                  <p className="mt-4 text-xs font-bold uppercase tracking-widest text-mute">{label}</p>
                  <p className="mt-1 font-bold break-words">{value}</p>
                  {extra && <p className="mt-1">{extra}</p>}
                </li>
              ))}
            </ul>
            <div className="mt-6"><SocialLinks tone="dark" /></div>
            <div className="mt-6 rounded-[var(--radius-card)] bg-nar p-6 text-white">
              <p className="font-display text-xl font-bold">{t.contact.quoteTitle}</p>
              <p className="mt-2 text-white/85">{t.contact.quoteText}</p>
              <Link to={paths.quote(lang)} className="btn btn-light mt-5">{t.common.getQuote}</Link>
            </div>
          </div>
          <ContactForm />
        </div>
        {settings.mapEmbedUrl && /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/.test(settings.mapEmbedUrl) && (
          <div className="mt-12 aspect-[16/7] overflow-hidden rounded-[2rem] ring-1 ring-line">
            <iframe title={t.contact.mapTitle} src={settings.mapEmbedUrl} className="h-full w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        )}
      </section>
    </>
  );
}

function ContactForm() {
  const { t, lang } = useI18n();
  const [f, setF] = useState({ fullName: '', phone: '', email: '', message: '', consent: false, website: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.fullName.trim().length < 2) er.fullName = t.quote.errors.required;
    if (!/^[+()\d\s-]{7,20}$/.test(f.phone.trim())) er.phone = t.quote.errors.phone;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) er.email = t.quote.errors.email;
    if (f.message.trim().length < 10) er.message = t.quote.errors.short;
    if (!f.consent) er.consent = t.quote.errors.consent;
    setErrors(er);
    if (Object.keys(er).length) return;
    setState('sending');
    setError('');
    try {
      await submitQuote(
        { kind: 'contact', fullName: f.fullName.trim(), phone: f.phone.trim(), email: f.email.trim(), description: f.message.trim(), contactMethod: 'phone', locale: lang, consent: true, sourcePage: window.location.pathname, website: f.website },
        [],
      );
      setState('sent');
    } catch (err) {
      const code = err instanceof SubmitError ? err.code : 'network';
      setError(code === 'not_configured' ? t.quote.errors.notConfigured : code === 'rate_limit' ? t.quote.errors.rateLimit : t.quote.errors.network);
      setState('idle');
    }
  };

  if (state === 'sent') {
    return (
      <div role="status" className="flex flex-col items-start justify-center rounded-[2rem] bg-white p-8 ring-1 ring-line md:p-12">
        <CheckCircle2 className="size-12 text-nar" aria-hidden />
        <p className="mt-6 font-display text-2xl font-bold">{t.contact.sent}</p>
      </div>
    );
  }

  const field = (k: keyof typeof f, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`c-${k}`} className="label">{label} *</label>
      <input id={`c-${k}`} className="field" value={f[k] as string} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-invalid={errors[k] ? true : undefined} aria-describedby={errors[k] ? `c-${k}-err` : undefined} {...props} />
      {errors[k] && <p id={`c-${k}-err`} className="mt-2 text-sm font-semibold text-nar">{errors[k]}</p>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-[2rem] bg-white p-6 ring-1 ring-line md:p-10">
      <h2 className="mb-6 text-2xl font-bold md:text-3xl">{t.contact.formTitle}</h2>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} />
      </div>
      <div className="grid gap-5">
        {field('fullName', t.quote.fields.fullName, { autoComplete: 'name' })}
        <div className="grid gap-5 sm:grid-cols-2">
          {field('phone', t.quote.fields.phone, { type: 'tel', autoComplete: 'tel', inputMode: 'tel' })}
          {field('email', t.quote.fields.email, { type: 'email', autoComplete: 'email', inputMode: 'email' })}
        </div>
        <div>
          <label htmlFor="c-message" className="label">{t.quote.fields.message} *</label>
          <textarea id="c-message" rows={5} className="field resize-y" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} aria-invalid={errors.message ? true : undefined} aria-describedby={errors.message ? 'c-message-err' : undefined} />
          {errors.message && <p id="c-message-err" className="mt-2 text-sm font-semibold text-nar">{errors.message}</p>}
        </div>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[var(--color-nar)]" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} aria-invalid={errors.consent ? true : undefined} />
          <span>{t.quote.fields.consent} <Link to={paths.privacy(lang)} className="font-bold underline">{t.quote.fields.privacyLink}</Link></span>
        </label>
        {errors.consent && <p className="-mt-3 text-sm font-semibold text-nar">{errors.consent}</p>}
        {error && <p role="alert" className="flex items-start gap-2 rounded-2xl bg-nar-soft p-4 text-sm font-semibold text-nar-deep"><AlertCircle className="size-5 shrink-0" aria-hidden />{error}</p>}
        <button type="submit" disabled={state === 'sending'} className="btn btn-primary w-full disabled:opacity-70 sm:w-auto">
          {state === 'sending' && <Loader2 className="size-5 animate-spin" aria-hidden />}
          {t.contact.send}
        </button>
      </div>
    </form>
  );
}
