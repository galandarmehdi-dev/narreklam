import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Category, ContentOverrides, FaqItem, InstagramPost, PortfolioProject, Service, SiteSettings } from '@/lib/types';
import { defaultCategories, defaultServices } from '@/content/catalog';
import { defaultFaq, demoProjects } from '@/content/demo';
import { defaultSettings } from '@/config/company';
import { env, isSupabaseConfigured } from '@/config/env';
import { getSupabase } from '@/lib/supabase';
import {
  CATEGORY_SELECT, PROJECT_SELECT, SERVICE_SELECT, mapCategory, mapContent, mapFaq, mapInstagram, mapProject,
  mapService, mapSettings,
} from './mappers';

type Status = 'local' | 'loading' | 'ready' | 'error';

interface SiteData {
  /** 'local' = bundled defaults (no backend), 'loading' = fetching live data, 'ready' = live data loaded. */
  status: Status;
  categories: Category[];
  services: Service[];
  settings: SiteSettings;
  content: ContentOverrides;
  faq: FaqItem[];
  instagram: InstagramPost[];
  projects: PortfolioProject[];
  projectsStatus: 'idle' | 'loading' | 'ready' | 'error';
  loadProjects: () => void;
}

const Ctx = createContext<SiteData | null>(null);

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;
const demoFallback = () => (env.showDemo ? demoProjects : []);

export function DataProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>(isSupabaseConfigured ? 'loading' : 'local');
  const [categories, setCategories] = useState(defaultCategories);
  const [services, setServices] = useState(defaultServices);
  const [settings, setSettings] = useState(defaultSettings);
  const [content, setContent] = useState<ContentOverrides>({});
  const [faq, setFaq] = useState(defaultFaq);
  const [instagram, setInstagram] = useState<InstagramPost[]>([]);
  const [projects, setProjects] = useState<PortfolioProject[]>(isSupabaseConfigured ? [] : demoFallback());
  const [projectsStatus, setProjectsStatus] = useState<SiteData['projectsStatus']>(isSupabaseConfigured ? 'idle' : 'ready');
  const projectsRequested = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    (async () => {
      try {
        const sb = await getSupabase();
        if (!sb) return;
        // RLS guarantees anonymous visitors only receive published rows.
        const [cats, svcs, set, cont, fq, ig] = await Promise.all([
          sb.from('service_categories').select(CATEGORY_SELECT).eq('is_published', true),
          sb.from('services').select(SERVICE_SELECT).eq('is_published', true),
          sb.from('site_settings').select('*').eq('id', 1).maybeSingle(),
          sb.from('content_translations').select('block_key, locale, value'),
          sb.from('faq_items').select('*, faq_translations(*)').eq('is_published', true),
          sb.from('instagram_posts').select('*').eq('is_published', true),
        ]);
        if (cancelled) return;
        const err = cats.error || svcs.error;
        if (err) throw err;
        const c = (cats.data || []).map(mapCategory).sort(byOrder);
        const s = (svcs.data || [])
          .map(mapService)
          .map((x) => ({ ...x, items: x.items.filter((i) => i.published) }))
          .sort(byOrder);
        // An empty catalog almost always means migrations/seed were not applied yet — keep defaults visible.
        if (c.length) {
          setCategories(c);
          setServices(s);
        }
        if (!set.error) setSettings(mapSettings(set.data));
        if (!cont.error) setContent(mapContent(cont.data || []));
        if (!fq.error && fq.data?.length) setFaq((fq.data || []).map(mapFaq).sort(byOrder));
        if (!ig.error) setInstagram((ig.data || []).map(mapInstagram).sort(byOrder));
        setStatus('ready');
      } catch (e) {
        console.error('[NarReklam] Live data could not be loaded; showing bundled content.', e);
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadProjects = useCallback(() => {
    if (!isSupabaseConfigured || projectsRequested.current) return;
    projectsRequested.current = true;
    setProjectsStatus('loading');
    (async () => {
      try {
        const sb = await getSupabase();
        if (!sb) return;
        const { data, error } = await sb
          .from('portfolio_projects')
          .select(PROJECT_SELECT)
          .eq('is_published', true)
          .eq('is_demo', false)
          .order('sort_order');
        if (error) throw error;
        const list = (data || []).map(mapProject);
        setProjects(list.length ? list : demoFallback());
        setProjectsStatus('ready');
      } catch (e) {
        console.error('[NarReklam] Portfolio could not be loaded.', e);
        projectsRequested.current = false;
        setProjects(demoFallback());
        setProjectsStatus('error');
      }
    })();
  }, []);

  const value = useMemo<SiteData>(
    () => ({ status, categories, services, settings, content, faq, instagram, projects, projectsStatus, loadProjects }),
    [status, categories, services, settings, content, faq, instagram, projects, projectsStatus, loadProjects],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSiteData(): SiteData {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSiteData must be used inside <DataProvider>');
  return v;
}

/** Portfolio projects, loaded on first use. */
export function useProjects() {
  const { projects, projectsStatus, loadProjects } = useSiteData();
  useEffect(() => loadProjects(), [loadProjects]);
  return { projects, status: projectsStatus };
}

/** Catalog lookup helpers. */
export function useCatalog() {
  const { categories, services, status } = useSiteData();
  return useMemo(() => {
    const catBySlug = new Map(categories.map((c) => [c.slug, c]));
    // Lookups accept either the database id or the slug (demo content references slugs).
    const catById = new Map(categories.flatMap((c) => [[c.id, c], [c.slug, c]] as const));
    const svcBySlug = new Map(services.map((s) => [s.slug, s]));
    const svcById = new Map(services.flatMap((s) => [[s.id, s], [s.slug, s]] as const));
    const servicesOf = (catId: string) => services.filter((s) => s.categoryId === catId);
    return { categories, services, catBySlug, catById, svcBySlug, svcById, servicesOf, loading: status === 'loading' };
  }, [categories, services, status]);
}
