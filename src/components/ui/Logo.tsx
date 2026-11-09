import { useI18n } from '@/i18n';
import { useSiteData } from '@/data/DataProvider';

/**
 * TEMPORARY WORDMARK — placeholder until the official NarReklam logo is supplied.
 * Upload the real logo in Admin → Company settings (logo_url) and it replaces this automatically.
 */
export function Logo({ tone = 'dark', className = '' }: { tone?: 'dark' | 'light'; className?: string }) {
  const { settings } = useSiteData();
  const { t } = useI18n();
  if (settings.logoUrl) {
    return <img src={settings.logoUrl} alt={settings.companyName} className={`h-9 w-auto ${className}`} />;
  }
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} title={t.a11y.temporaryLogo} data-placeholder="logo">
      <span aria-hidden="true" className="relative grid size-9 place-items-center rounded-full bg-nar">
        <span className="absolute size-1.5 -translate-x-1.5 -translate-y-1 rounded-full bg-white/90" />
        <span className="absolute size-1.5 translate-x-1.5 -translate-y-1 rounded-full bg-white/90" />
        <span className="absolute size-1.5 translate-y-1.5 rounded-full bg-white/90" />
      </span>
      <span className={`font-display text-xl font-extrabold tracking-tight ${tone === 'light' ? 'text-white' : 'text-ink'}`}>
        Nar<span className="text-nar">Reklam</span>
      </span>
      <span className="sr-only">{t.a11y.temporaryLogo}</span>
    </span>
  );
}
