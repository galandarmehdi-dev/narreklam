import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { DataProvider } from '@/data/DataProvider';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/lib/types';
import { isLocale } from '@/lib/paths';
import SiteLayout from '@/components/layout/SiteLayout';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import { PageLoader } from '@/components/ui/PageLoader';

const ServicesPage = lazy(() => import('@/pages/ServicesPage'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const ServicePage = lazy(() => import('@/pages/ServicePage'));
const PortfolioPage = lazy(() => import('@/pages/PortfolioPage'));
const ProjectPage = lazy(() => import('@/pages/ProjectPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const QuotePage = lazy(() => import('@/pages/QuotePage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const FaqPage = lazy(() => import('@/pages/FaqPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const LegalPage = lazy(() => import('@/pages/LegalPage'));
const AdminApp = lazy(() => import('@/admin/AdminApp'));

const s = (el: React.ReactNode) => <Suspense fallback={<PageLoader />}>{el}</Suspense>;

function RootRedirect() {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem('narreklam-lang');
  } catch {
    /* ignore */
  }
  const lang: Locale = isLocale(saved ?? undefined) ? (saved as Locale) : DEFAULT_LOCALE;
  return <Navigate to={`/${lang}/`} replace />;
}

// basename lets the same build run at /<repo>/ on GitHub Pages or at / on a custom domain.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

const siteChildren = [
  { index: true, element: <HomePage /> },
  { path: 'services', element: s(<ServicesPage />) },
  { path: 'services/:categorySlug', element: s(<CategoryPage />) },
  { path: 'services/:categorySlug/:serviceSlug', element: s(<ServicePage />) },
  { path: 'portfolio', element: s(<PortfolioPage />) },
  { path: 'portfolio/:slug', element: s(<ProjectPage />) },
  { path: 'about', element: s(<AboutPage />) },
  { path: 'quote', element: s(<QuotePage />) },
  { path: 'contact', element: s(<ContactPage />) },
  { path: 'faq', element: s(<FaqPage />) },
  { path: 'search', element: s(<SearchPage />) },
  { path: 'privacy', element: s(<LegalPage kind="privacy" />) },
  { path: 'cookies', element: s(<LegalPage kind="cookies" />) },
  { path: '*', element: <NotFoundPage /> },
];

const router = createBrowserRouter(
  [
    { path: '/', element: <RootRedirect /> },
    { path: '/admin/*', element: s(<AdminApp />) },
    // Explicit language prefixes (not a /:lang param) so /admin/* can never be mistaken for a language.
    ...LOCALES.map((l) => ({ path: `/${l}`, element: <SiteLayout lang={l} />, children: siteChildren })),
    { path: '*', element: <SiteLayout invalid /> },
  ],
  { basename },
);

export default function App() {
  return (
    <DataProvider>
      <RouterProvider router={router} />
    </DataProvider>
  );
}
