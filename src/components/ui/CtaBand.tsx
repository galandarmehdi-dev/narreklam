import { Link } from 'react-router-dom';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useSiteData } from '@/data/DataProvider';
import { paths } from '@/lib/paths';
import { whatsappLink } from '@/lib/whatsapp';
import { fmt } from '@/lib/text';
import { Reveal } from './Reveal';

/** Big red quotation call-to-action used across the site. */
export function CtaBand({ title, text, service, serviceName }: { title?: string; text?: string; service?: string; serviceName?: string }) {
  const { t, lang } = useI18n();
  const { settings } = useSiteData();
  const msg = serviceName ? fmt(waServiceMessage[lang], { service: serviceName }) : waGeneralMessage[lang];
  const wa = whatsappLink(settings.whatsapp, msg);
  return (
    <section className="container-x py-16 md:py-24">
      <Reveal className="relative overflow-hidden rounded-[2rem] bg-nar px-6 py-14 text-white md:px-16 md:py-20">
        <div aria-hidden className="seeds pointer-events-none absolute inset-y-0 right-0 w-2/3 text-white/20 [mask-image:linear-gradient(to_left,black,transparent)]" />
        <div aria-hidden className="pointer-events-none absolute -right-24 -bottom-24 size-96 rounded-full bg-nar-deep/60 blur-2xl" />
        <div className="relative max-w-3xl">
          <h2 className="h-section">{title || t.home.cta.title}</h2>
          <p className="mt-5 max-w-xl text-lg text-white/85">{text || t.home.cta.text}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to={paths.quote(lang, service)} className="btn btn-light group">
              {t.common.getQuote}
              <ArrowUpRight className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </Link>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-ghost text-white">
                <MessageCircle className="size-5" aria-hidden />
                {t.common.whatsapp}
              </a>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export const waGeneralMessage = {
  az: 'Salam! NarReklam xidmətləri haqqında məlumat və qiymət təklifi almaq istəyirəm.',
  ru: 'Здравствуйте! Хочу получить информацию об услугах NarReklam и расчёт стоимости.',
  en: "Hello! I'd like to learn more about NarReklam services and get a quote.",
};
export const waServiceMessage = {
  az: 'Salam! "{service}" xidməti ilə bağlı məlumat və qiymət təklifi almaq istəyirəm.',
  ru: 'Здравствуйте! Хочу получить информацию и расчёт по услуге «{service}».',
  en: 'Hello! I\'d like information and a quote for "{service}".',
};
