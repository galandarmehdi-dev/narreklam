import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp, MessageCircle } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useSiteData } from '@/data/DataProvider';
import { whatsappLink } from '@/lib/whatsapp';
import { fmt } from '@/lib/text';
import { paths } from '@/lib/paths';
import { waGeneralMessage, waServiceMessage } from '@/components/ui/CtaBand';

/** Lets a page (e.g. a service page) put its service name into the WhatsApp message. */
const WaCtx = createContext<{ setService: (s: string | null) => void }>({ setService: () => {} });
const WaValue = createContext<string | null>(null);

export function WhatsAppContextProvider({ children }: { children: ReactNode }) {
  const [service, setService] = useState<string | null>(null);
  return (
    <WaCtx.Provider value={{ setService }}>
      <WaValue.Provider value={service}>{children}</WaValue.Provider>
    </WaCtx.Provider>
  );
}

export function useWhatsAppService(name: string | null) {
  const { setService } = useContext(WaCtx);
  useEffect(() => {
    setService(name);
    return () => setService(null);
  }, [name, setService]);
}

export function FloatingActions() {
  const { t, lang } = useI18n();
  const { settings } = useSiteData();
  const service = useContext(WaValue);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 1200);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const message = service ? fmt(waServiceMessage[lang], { service }) : waGeneralMessage[lang];
  const wa = whatsappLink(settings.whatsapp, message);
  const btn = 'grid size-14 place-items-center rounded-full shadow-[0_12px_30px_-10px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:scale-105';

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 md:right-6 md:bottom-6" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
      <AnimatePresence>
        {showTop && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label={t.a11y.backToTop}
            className="pointer-events-auto grid size-11 place-items-center rounded-full bg-white text-ink shadow-lg ring-1 ring-line hover:bg-paper"
          >
            <ArrowUp className="size-5" aria-hidden />
          </motion.button>
        )}
      </AnimatePresence>
      {wa ? (
        <a href={wa} target="_blank" rel="noopener noreferrer" aria-label={t.a11y.whatsapp} className={`pointer-events-auto bg-[#1f9d55] text-white ${btn}`}>
          <WhatsAppGlyph />
        </a>
      ) : (
        // No WhatsApp number configured yet → still functional: leads to the contact page.
        <Link to={paths.contact(lang)} aria-label={t.nav.contact} title="WhatsApp number not configured (Admin → Company settings)" className={`pointer-events-auto bg-[#1f9d55] text-white ${btn}`}>
          <MessageCircle className="size-6" aria-hidden />
        </Link>
      )}
    </div>
  );
}

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-7" fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35ZM12.04 21.5h-.01a9.43 9.43 0 0 1-4.8-1.31l-.35-.21-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.44 9.45-9.44 2.52 0 4.89.99 6.67 2.77a9.37 9.37 0 0 1 2.76 6.68c0 5.2-4.24 9.43-9.44 9.43Zm8.04-17.47A11.3 11.3 0 0 0 12.04.7C5.77.7.66 5.8.66 12.08c0 2 .52 3.96 1.52 5.69L.57 23.7l6.06-1.59a11.35 11.35 0 0 0 5.4 1.38h.01c6.27 0 11.38-5.1 11.38-11.38 0-3.04-1.18-5.9-3.34-8.06Z" />
    </svg>
  );
}
