import { Link } from 'react-router-dom';
import { ArrowUpRight, Instagram, Facebook, Linkedin, Youtube, Mail, MapPin, Phone, Clock } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useCatalog, useSiteData } from '@/data/DataProvider';
import { paths } from '@/lib/paths';
import { telLink } from '@/lib/whatsapp';
import { Logo } from '@/components/ui/Logo';

export function SocialLinks({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const { settings } = useSiteData();
  const items = [
    { href: settings.instagram, label: 'Instagram', Icon: Instagram },
    { href: settings.facebook, label: 'Facebook', Icon: Facebook },
    { href: settings.linkedin, label: 'LinkedIn', Icon: Linkedin },
    { href: settings.youtube, label: 'YouTube', Icon: Youtube },
    { href: settings.tiktok, label: 'TikTok', Icon: TikTokIcon },
  ].filter((i) => i.href);
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map(({ href, label, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={`grid size-11 place-items-center rounded-full border transition-colors ${tone === 'light' ? 'border-white/20 text-white hover:bg-white hover:text-ink' : 'border-line text-ink hover:bg-ink hover:text-white'}`}
          >
            <Icon className="size-5" aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  );
}

function TikTokIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.6c.27 0 .53.04.77.12V9.77a5.7 5.7 0 0 0-.77-.05 5.69 5.69 0 1 0 5.69 5.69V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.3 4.3 0 0 1-3.25-1.48Z" />
    </svg>
  );
}

export function Footer() {
  const { t, lang, tr } = useI18n();
  const { settings } = useSiteData();
  const { categories } = useCatalog();
  const year = new Date().getFullYear();
  const hasContact = settings.phone || settings.email || tr(settings.address);

  return (
    <footer className="on-dark relative overflow-hidden bg-ink pt-20 pb-28 text-white md:pb-12">
      <div aria-hidden className="seeds pointer-events-none absolute -top-20 -left-20 h-80 w-80 text-white/10" />
      <div className="container-x relative">
        <div className="flex flex-col justify-between gap-10 border-b border-white/10 pb-14 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <Logo tone="light" />
            <p className="mt-6 text-lg text-white/70">{t.footer.tagline}</p>
          </div>
          <Link to={paths.quote(lang)} className="group inline-flex items-center gap-4 font-display text-3xl font-bold md:text-5xl">
            <span className="link-underline">{t.nav.quote}</span>
            <span className="grid size-14 place-items-center rounded-full bg-nar transition-transform duration-500 group-hover:rotate-45 md:size-16">
              <ArrowUpRight className="size-7" aria-hidden />
            </span>
          </Link>
        </div>

        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="mb-5 font-sans text-xs font-bold uppercase tracking-[0.2em] text-white/50">{t.footer.services}</h2>
            <ul className="space-y-2.5">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={paths.category(lang, c.slug)} className="text-white/80 hover:text-white">{tr(c.name)}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-5 font-sans text-xs font-bold uppercase tracking-[0.2em] text-white/50">{t.footer.navigate}</h2>
            <ul className="space-y-2.5">
              {[
                [paths.services(lang), t.nav.services],
                [paths.portfolio(lang), t.nav.portfolio],
                [paths.about(lang), t.nav.about],
                [paths.faq(lang), t.nav.faq],
                [paths.contact(lang), t.nav.contact],
                [paths.quote(lang), t.nav.quote],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-white/80 hover:text-white">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="sm:col-span-2">
            <h2 className="mb-5 font-sans text-xs font-bold uppercase tracking-[0.2em] text-white/50">{t.footer.contact}</h2>
            {hasContact ? (
              <ul className="space-y-3 text-white/80">
                {settings.phone && (
                  <li className="flex gap-3"><Phone className="mt-0.5 size-5 text-saffron" aria-hidden /><a href={telLink(settings.phone)} className="hover:text-white">{settings.phone}</a></li>
                )}
                {settings.email && (
                  <li className="flex gap-3"><Mail className="mt-0.5 size-5 text-saffron" aria-hidden /><a href={`mailto:${settings.email}`} className="hover:text-white">{settings.email}</a></li>
                )}
                {tr(settings.address) && (
                  <li className="flex gap-3"><MapPin className="mt-0.5 size-5 text-saffron" aria-hidden /><span>{tr(settings.address)}</span></li>
                )}
                {tr(settings.workingHours) && (
                  <li className="flex gap-3"><Clock className="mt-0.5 size-5 text-saffron" aria-hidden /><span className="whitespace-pre-line">{tr(settings.workingHours)}</span></li>
                )}
              </ul>
            ) : (
              <p className="rounded-2xl border border-dashed border-white/20 p-4 text-sm text-white/60" data-placeholder="contact">{t.footer.placeholder}</p>
            )}
            <div className="mt-6">
              <SocialLinks />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
          <p>© {year} {settings.companyName}. {t.footer.rights}</p>
          <ul className="flex gap-6">
            <li><Link to={paths.privacy(lang)} className="hover:text-white">{t.footer.privacy}</Link></li>
            <li><Link to={paths.cookies(lang)} className="hover:text-white">{t.footer.cookies}</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
