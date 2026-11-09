import { lazy, Suspense, useEffect, useState, type FormEvent } from 'react';
import { NavLink, Route, Routes, Link } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import {
  LayoutDashboard, Inbox, Layers, FolderTree, Images, FileText, HelpCircle, Instagram, Settings, LogOut, ExternalLink, Menu, X, KeyRound, Loader2,
} from 'lucide-react';
import { isSupabaseConfigured } from '@/config/env';
import { getSupabase } from '@/lib/supabase';
import { ADMIN_DICTS, AdminI18nCtx, useA, type AdminLang } from './i18n';
import { ToastProvider, btn, inputCls, Loading, useToast } from './ui';

const Overview = lazy(() => import('./pages/Overview'));
const Quotes = lazy(() => import('./pages/Quotes'));
const QuoteDetail = lazy(() => import('./pages/QuoteDetail'));
const Services = lazy(() => import('./pages/Services'));
const ServiceEdit = lazy(() => import('./pages/ServiceEdit'));
const Categories = lazy(() => import('./pages/Categories'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const ProjectEdit = lazy(() => import('./pages/ProjectEdit'));
const Content = lazy(() => import('./pages/Content'));
const Faq = lazy(() => import('./pages/Faq'));
const InstagramPage = lazy(() => import('./pages/InstagramPosts'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

export type Role = 'admin' | 'editor';

function useNoIndex() {
  useEffect(() => {
    document.title = 'Admin — NarReklam';
    const m = document.createElement('meta');
    m.name = 'robots';
    m.content = 'noindex, nofollow';
    document.head.appendChild(m);
    document.documentElement.lang = 'az';
    return () => m.remove();
  }, []);
}

export default function AdminApp() {
  useNoIndex();
  const [lang, setLang] = useState<AdminLang>(() => {
    try {
      return (localStorage.getItem('narreklam-admin-lang') as AdminLang) || 'az';
    } catch {
      return 'az';
    }
  });
  const changeLang = (l: AdminLang) => {
    setLang(l);
    try {
      localStorage.setItem('narreklam-admin-lang', l);
    } catch {
      /* ignore */
    }
  };
  return (
    <AdminI18nCtx.Provider value={ADMIN_DICTS[lang]}>
      <ToastProvider>
        <div className="min-h-screen bg-paper-2/60 text-ink">
          {isSupabaseConfigured ? <AuthGate lang={lang} setLang={changeLang} /> : <NotConfigured />}
        </div>
      </ToastProvider>
    </AdminI18nCtx.Provider>
  );
}

function NotConfigured() {
  const a = useA();
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="max-w-lg rounded-2xl bg-white p-8 ring-1 ring-line">
        <p className="font-display text-xl font-bold">{a.notConfigured}</p>
        <p className="mt-3 text-sm text-mute">{a.notConfiguredText}</p>
        <Link to="/" className={`${btn.ghost} mt-6`}>{a.viewSite}</Link>
      </div>
    </div>
  );
}

function AuthGate({ lang, setLang }: { lang: AdminLang; setLang: (l: AdminLang) => void }) {
  const a = useA();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [role, setRole] = useState<Role | 'none' | undefined>(undefined);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    getSupabase().then((client) => {
      if (!client) return;
      client.auth.getSession().then(({ data }) => setSession(data.session));
      const { data } = client.auth.onAuthStateChange((event, s) => {
        setSession(s);
        if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      });
      unsub = () => data.subscription.unsubscribe();
    });
    return () => unsub?.();
  }, []);

  useEffect(() => {
    if (!session) {
      setRole(undefined);
      return;
    }
    getSupabase().then(async (client) => {
      const { data } = await client!.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
      setRole((data?.role as Role) || 'none');
    });
  }, [session]);

  if (session === undefined || (session && role === undefined)) return <Loading />;
  if (!session) return <Login />;
  if (recovery) return <SetPassword onDone={() => setRecovery(false)} />;
  if (role === 'none') {
    return (
      <div className="grid min-h-screen place-items-center p-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center ring-1 ring-line">
          <p className="font-display text-xl font-bold">{a.denied}</p>
          <p className="mt-2 text-sm text-mute">{a.deniedHint}</p>
          <p className="mt-4 text-xs text-mute">{session.user.email}</p>
          <button type="button" className={`${btn.primary} mt-6`} onClick={async () => (await getSupabase())?.auth.signOut()}>{a.logout}</button>
        </div>
      </div>
    );
  }
  return <Shell session={session} role={role as Role} lang={lang} setLang={setLang} />;
}

function Login() {
  const a = useA();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone: 'ok' | 'err' } | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const client = (await getSupabase())!;
    if (mode === 'login') {
      const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
      if (error) setMsg({ text: a.loginError, tone: 'err' });
    } else {
      await client.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}admin/` });
      setMsg({ text: a.resetSent, tone: 'ok' });
    }
    setBusy(false);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-nar lg:block">
        <div className="seeds absolute inset-0 text-white/20" />
        <div className="absolute bottom-12 left-12 text-white">
          <p className="font-display text-5xl font-extrabold tracking-tight">NarReklam</p>
          <p className="mt-2 text-white/80">Admin</p>
        </div>
      </div>
      <div className="grid place-items-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm">
          <h1 className="font-display text-3xl font-bold tracking-tight">{mode === 'login' ? a.login : a.forgot}</h1>
          <div className="mt-8 space-y-4">
            <div>
              <label htmlFor="ad-email" className="mb-1.5 block text-sm font-bold">{a.email}</label>
              <input id="ad-email" type="email" autoComplete="username" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {mode === 'login' && (
              <div>
                <label htmlFor="ad-pass" className="mb-1.5 block text-sm font-bold">{a.password}</label>
                <input id="ad-pass" type="password" autoComplete="current-password" required className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            )}
            {msg && <p role="alert" className={`rounded-xl p-3 text-sm font-semibold ${msg.tone === 'err' ? 'bg-nar-soft text-nar-deep' : 'bg-teal/10 text-teal'}`}>{msg.text}</p>}
            <button type="submit" disabled={busy} className={`${btn.red} w-full justify-center py-3`}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              {mode === 'login' ? a.login : a.sendReset}
            </button>
            <button type="button" className="text-sm font-semibold text-mute underline" onClick={() => { setMode(mode === 'login' ? 'forgot' : 'login'); setMsg(null); }}>
              {mode === 'login' ? a.forgot : a.backToLogin}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SetPassword({ onDone }: { onDone: () => void }) {
  const a = useA();
  const toast = useToast();
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <form
        className="w-full max-w-sm rounded-2xl bg-white p-8 ring-1 ring-line"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const { error } = await (await getSupabase())!.auth.updateUser({ password: pw });
          setBusy(false);
          if (error) toast(error.message, 'error');
          else {
            toast(a.passwordSet);
            onDone();
          }
        }}
      >
        <h1 className="font-display text-2xl font-bold">{a.setPassword}</h1>
        <label htmlFor="np" className="mt-6 mb-1.5 block text-sm font-bold">{a.newPassword}</label>
        <input id="np" type="password" minLength={10} required autoComplete="new-password" className={inputCls} value={pw} onChange={(e) => setPw(e.target.value)} />
        <button type="submit" disabled={busy} className={`${btn.red} mt-6 w-full justify-center`}>{a.save}</button>
      </form>
    </div>
  );
}

function Shell({ session, role, lang, setLang }: { session: Session; role: Role; lang: AdminLang; setLang: (l: AdminLang) => void }) {
  const a = useA();
  const [open, setOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const nav = [
    { to: '', label: a.overview, Icon: LayoutDashboard, end: true },
    { to: 'quotes', label: a.quotes, Icon: Inbox },
    { to: 'services', label: a.services, Icon: Layers },
    { to: 'categories', label: a.categories, Icon: FolderTree },
    { to: 'portfolio', label: a.portfolio, Icon: Images },
    { to: 'content', label: a.content, Icon: FileText },
    { to: 'faq', label: a.faq, Icon: HelpCircle },
    { to: 'instagram', label: a.instagram, Icon: Instagram },
    ...(role === 'admin' ? [{ to: 'settings', label: a.settings, Icon: Settings }] : []),
  ];

  return (
    <div className="lg:grid lg:grid-cols-[16rem_1fr]">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-ink px-4 py-3 text-white lg:hidden">
        <span className="font-display font-bold">NarReklam Admin</span>
        <button type="button" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open} className="grid size-10 place-items-center rounded-lg bg-white/10">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>
      <aside className={`${open ? 'block' : 'hidden'} fixed inset-0 top-16 z-20 overflow-y-auto bg-ink p-4 text-white lg:sticky lg:top-0 lg:block lg:h-screen`}>
        <p className="mb-8 hidden px-3 pt-2 font-display text-lg font-bold lg:block">Nar<span className="text-nar">Reklam</span> <span className="text-xs text-white/50">admin</span></p>
        <nav className="space-y-1" aria-label="Admin">
          {nav.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${isActive ? 'bg-white text-ink' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}
            >
              <Icon className="size-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-8 space-y-1 border-t border-white/10 pt-4 text-sm">
          <a href={`${import.meta.env.BASE_URL}az/`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/75 hover:bg-white/10 hover:text-white">
            <ExternalLink className="size-4" /> {a.viewSite}
          </a>
          <button type="button" onClick={() => setPwOpen(true)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-white/75 hover:bg-white/10 hover:text-white">
            <KeyRound className="size-4" /> {a.changePassword}
          </button>
          <button type="button" onClick={async () => (await getSupabase())?.auth.signOut()} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-white/75 hover:bg-white/10 hover:text-white">
            <LogOut className="size-4" /> {a.logout}
          </button>
          <div className="flex gap-1 px-3 pt-3">
            {(['az', 'en', 'ru'] as AdminLang[]).map((l) => (
              <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l} className={`rounded-md px-2 py-1 text-xs font-bold uppercase ${lang === l ? 'bg-white text-ink' : 'text-white/60'}`}>{l}</button>
            ))}
          </div>
          <p className="truncate px-3 pt-3 text-xs text-white/40">{session.user.email} · {role}</p>
        </div>
      </aside>
      <main className="min-w-0 p-4 md:p-8 lg:p-10">
        {pwOpen && <SetPasswordModal onClose={() => setPwOpen(false)} />}
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route index element={<Overview />} />
            <Route path="quotes" element={<Quotes />} />
            <Route path="quotes/:id" element={<QuoteDetail role={role} />} />
            <Route path="services" element={<Services />} />
            <Route path="services/:id" element={<ServiceEdit />} />
            <Route path="categories" element={<Categories />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="portfolio/:id" element={<ProjectEdit />} />
            <Route path="content" element={<Content />} />
            <Route path="faq" element={<Faq />} />
            <Route path="instagram" element={<InstagramPage />} />
            {role === 'admin' && <Route path="settings" element={<SettingsPage />} />}
            <Route path="*" element={<Overview />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

function SetPasswordModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-sm">
        <button type="button" onClick={onClose} className="absolute top-3 right-3 z-10 grid size-8 place-items-center rounded-full hover:bg-paper" aria-label="Close"><X className="size-4" /></button>
        <SetPasswordInline onDone={onClose} />
      </div>
    </div>
  );
}

function SetPasswordInline({ onDone }: { onDone: () => void }) {
  const a = useA();
  const toast = useToast();
  const [pw, setPw] = useState('');
  return (
    <form
      className="rounded-2xl bg-white p-8 ring-1 ring-line"
      onSubmit={async (e) => {
        e.preventDefault();
        const { error } = await (await getSupabase())!.auth.updateUser({ password: pw });
        if (error) toast(error.message, 'error');
        else {
          toast(a.passwordSet);
          onDone();
        }
      }}
    >
      <h2 className="font-display text-xl font-bold">{a.changePassword}</h2>
      <label htmlFor="np2" className="mt-5 mb-1.5 block text-sm font-bold">{a.newPassword}</label>
      <input id="np2" type="password" minLength={10} required autoComplete="new-password" className={inputCls} value={pw} onChange={(e) => setPw(e.target.value)} />
      <button type="submit" className={`${btn.red} mt-5 w-full justify-center`}>{a.save}</button>
    </form>
  );
}
