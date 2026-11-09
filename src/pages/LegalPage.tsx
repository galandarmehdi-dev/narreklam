import { useI18n } from '@/i18n';
import { useSeo } from '@/lib/seo';
import { paths } from '@/lib/paths';
import { PageHero } from '@/components/ui/PageHero';

/** Privacy & cookie policies. Review with a legal adviser before launch. */
export default function LegalPage({ kind }: { kind: 'privacy' | 'cookies' }) {
  const { t, lang } = useI18n();
  const title = kind === 'privacy' ? t.legal.privacyTitle : t.legal.cookiesTitle;
  const sections = kind === 'privacy' ? t.legal.privacy : t.legal.cookies;
  const seo = kind === 'privacy' ? t.seo.privacy : t.seo.cookies;
  useSeo({ title: seo.t, description: seo.d, lang, path: kind === 'privacy' ? paths.privacy : paths.cookies });
  return (
    <>
      <PageHero crumbs={[{ label: t.nav.home, to: paths.home(lang) }, { label: title }]} title={title} />
      <article className="container-x prose-nar max-w-3xl py-16 md:py-24">
        {sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            <p>{s.p}</p>
          </section>
        ))}
      </article>
    </>
  );
}
