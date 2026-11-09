import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useSeo } from '@/lib/seo';
import { paths } from '@/lib/paths';
import { useSearchDialog } from '@/components/layout/SearchDialog';
import { Search } from 'lucide-react';

export default function NotFoundPage() {
  const { t, lang } = useI18n();
  const { open } = useSearchDialog();
  useSeo({ title: t.seo.notFound.t, description: t.seo.notFound.d, lang, noindex: true });
  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-paper pt-28 pb-20">
      <div aria-hidden className="seeds pointer-events-none absolute inset-0 text-nar/10" />
      <div className="container-x relative">
        <p aria-hidden className="font-display text-[clamp(7rem,28vw,22rem)] leading-none font-black tracking-tighter text-nar">
          4<span className="text-stroke text-ink">0</span>4
        </p>
        <h1 className="h-section mt-4">{t.notFound.title}</h1>
        <p className="lead mt-4 max-w-xl">{t.notFound.text}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={paths.home(lang)} className="btn btn-dark">{t.notFound.home}</Link>
          <Link to={paths.services(lang)} className="btn btn-primary">{t.notFound.services}</Link>
          <button type="button" onClick={open} className="btn btn-ghost"><Search className="size-5" aria-hidden />{t.nav.search}</button>
        </div>
      </div>
    </section>
  );
}
