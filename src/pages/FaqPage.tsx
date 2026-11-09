import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useSiteData } from '@/data/DataProvider';
import { useSeo } from '@/lib/seo';
import { paths } from '@/lib/paths';
import { PageHero } from '@/components/ui/PageHero';
import { Accordion } from '@/components/ui/Accordion';
import { CtaBand } from '@/components/ui/CtaBand';

export default function FaqPage() {
  const { t, lang, tr } = useI18n();
  const { faq } = useSiteData();
  const items = faq.filter((f) => f.published).map((f) => ({ q: tr(f.question), a: tr(f.answer) })).filter((f) => f.q);
  useSeo({
    title: t.seo.faq.t,
    description: t.seo.faq.d,
    lang,
    path: paths.faq,
    jsonLd: items.length
      ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }
      : undefined,
  });
  return (
    <>
      <PageHero crumbs={[{ label: t.nav.home, to: paths.home(lang) }, { label: t.nav.faq }]} kicker={t.faq.kicker} title={t.faq.title} text={t.faq.text}>
        <Link to={paths.contact(lang)} className="btn btn-dark mt-8">{t.faq.askUs}</Link>
      </PageHero>
      <section className="container-x max-w-4xl py-16 md:py-24">
        {items.length ? <Accordion items={items} /> : <p className="text-center text-mute">{t.faq.empty}</p>}
      </section>
      <CtaBand />
    </>
  );
}
