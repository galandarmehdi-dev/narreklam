import { useI18n } from '@/i18n';
import { useSiteData } from '@/data/DataProvider';
import { organizationLd, useSeo } from '@/lib/seo';
import { paths } from '@/lib/paths';
import { Hero, Marquee } from '@/components/home/Hero';
import { Capabilities, ContactStrip, FeaturedWork, InstagramSection, Process, ServicesSection, Showcase, Why } from '@/components/home/Sections';
import { CtaBand } from '@/components/ui/CtaBand';

export default function HomePage() {
  const { t, lang } = useI18n();
  const { settings } = useSiteData();
  useSeo({ title: t.seo.home.t, description: t.seo.home.d, lang, path: paths.home, jsonLd: organizationLd(settings, lang, t.seo.home.d) });
  return (
    <>
      <Hero />
      <Marquee />
      <ServicesSection />
      <FeaturedWork />
      <Capabilities />
      <Process />
      <Showcase />
      <Why />
      <CtaBand title={t.home.cta.title} text={t.home.cta.text} />
      <InstagramSection />
      <ContactStrip />
    </>
  );
}
