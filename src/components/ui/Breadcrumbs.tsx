import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useI18n } from '@/i18n';

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items, tone = 'dark' }: { items: Crumb[]; tone?: 'dark' | 'light' }) {
  const { t } = useI18n();
  const muted = tone === 'light' ? 'text-white/60' : 'text-mute';
  return (
    <nav aria-label={t.a11y.breadcrumb} className="text-sm">
      <ol className={`flex flex-wrap items-center gap-1.5 ${muted}`}>
        {items.map((c, i) => (
          <li key={i} className="inline-flex items-center gap-1.5">
            {i > 0 && <ChevronRight aria-hidden className="size-3.5 opacity-60" />}
            {c.to && i < items.length - 1 ? (
              <Link to={c.to} className="link-underline font-semibold hover:text-current">
                {c.label}
              </Link>
            ) : (
              <span aria-current={i === items.length - 1 ? 'page' : undefined} className={tone === 'light' ? 'text-white' : 'text-ink'}>
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
