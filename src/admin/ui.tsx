import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2, X } from 'lucide-react';
import type { L, Locale } from '@/lib/types';
import { LOCALES } from '@/lib/types';
import { useA } from './i18n';

/* ── Toasts ────────────────────────────────────────────────────────────── */
type Toast = { id: number; text: string; tone: 'ok' | 'error' };
const ToastCtx = createContext<(text: string, tone?: Toast['tone']) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Toast['tone'] = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === 'error' ? 7000 : 3000);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed right-4 bottom-4 z-[90] flex flex-col gap-2" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`max-w-sm rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${t.tone === 'error' ? 'bg-nar text-white' : 'bg-ink text-white'}`}>{t.text}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ── Layout primitives ─────────────────────────────────────────────────── */
export function PageHeader({ title, actions, children }: { title: string; actions?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {children && <div className="mt-2 text-sm text-mute">{children}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, children, className = '', actions }: { title?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={`rounded-2xl bg-white p-5 ring-1 ring-line md:p-6 ${className}`}>
      {(title || actions) && (
        <div className="mb-5 flex items-center justify-between gap-3">
          {title && <h2 className="font-sans text-base font-bold tracking-normal">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export const btn = {
  primary: 'inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white hover:bg-ink-3 disabled:opacity-60',
  red: 'inline-flex items-center gap-2 rounded-xl bg-nar px-4 py-2.5 text-sm font-bold text-white hover:bg-nar-deep disabled:opacity-60',
  ghost: 'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-ink ring-1 ring-line hover:ring-ink disabled:opacity-60',
  icon: 'grid size-9 place-items-center rounded-lg text-mute hover:bg-paper hover:text-ink disabled:opacity-30',
  danger: 'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-nar ring-1 ring-nar/30 hover:bg-nar-soft',
};

export const inputCls = 'w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-ink focus:ring-4 focus:ring-ink/5';

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-bold tracking-wide text-ink-3 uppercase">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-mute">{hint}</p>}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  const { label, hint, id, ...rest } = props;
  const fid = id || `f-${label.replace(/\W+/g, '-')}`;
  return (
    <Field label={label} hint={hint} htmlFor={fid}>
      <input id={fid} className={inputCls} {...rest} />
    </Field>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-semibold">
      <span className="relative">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="block h-6 w-11 rounded-full bg-line transition-colors peer-checked:bg-nar peer-focus-visible:ring-4 peer-focus-visible:ring-nar/30" />
        <span className="absolute top-1 left-1 size-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
      {label}
    </label>
  );
}

export function StatusPill({ published, labels }: { published: boolean; labels?: [string, string] }) {
  const a = useA();
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${published ? 'bg-teal/10 text-teal' : 'bg-line text-mute'}`}>
      {published ? labels?.[0] || a.published : labels?.[1] || a.draft}
    </span>
  );
}

export function MoveButtons({ onUp, onDown, first, last }: { onUp: () => void; onDown: () => void; first: boolean; last: boolean }) {
  const a = useA();
  return (
    <span className="inline-flex">
      <button type="button" className={btn.icon} onClick={onUp} disabled={first} aria-label={a.moveUp}><ArrowUp className="size-4" /></button>
      <button type="button" className={btn.icon} onClick={onDown} disabled={last} aria-label={a.moveDown}><ArrowDown className="size-4" /></button>
    </span>
  );
}

/* ── Localized (az/ru/en) field editor ─────────────────────────────────── */
export function LField({
  label, value, onChange, multiline, rows = 3, placeholder, hint,
}: { label: string; value: Partial<L>; onChange: (v: L) => void; multiline?: boolean; rows?: number; placeholder?: Partial<L>; hint?: string }) {
  const [tab, setTab] = useState<Locale>('az');
  const full: L = { az: value.az || '', ru: value.ru || '', en: value.en || '' };
  const id = `lf-${label.replace(/\W+/g, '-')}-${tab}`;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-xs font-bold tracking-wide text-ink-3 uppercase">{label}</label>
        <div className="flex rounded-lg bg-paper p-0.5" role="tablist" aria-label={label}>
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={tab === l}
              onClick={() => setTab(l)}
              className={`relative rounded-md px-2 py-0.5 text-[0.7rem] font-extrabold uppercase ${tab === l ? 'bg-white shadow-sm' : 'text-mute'}`}
            >
              {l}
              {!full[l] && <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-saffron" aria-label="empty" />}
            </button>
          ))}
        </div>
      </div>
      {multiline ? (
        <textarea id={id} rows={rows} className={`${inputCls} resize-y`} value={full[tab]} placeholder={placeholder?.[tab]} onChange={(e) => onChange({ ...full, [tab]: e.target.value })} />
      ) : (
        <input id={id} className={inputCls} value={full[tab]} placeholder={placeholder?.[tab]} onChange={(e) => onChange({ ...full, [tab]: e.target.value })} />
      )}
      {hint && <p className="mt-1 text-xs text-mute">{hint}</p>}
    </div>
  );
}

/* ── Image picker (uploads via callback) ───────────────────────────────── */
export function ImagePicker({ value, onUpload, onClear, label }: { value?: string | null; onUpload: (f: File) => Promise<void>; onClear?: () => void; label: string }) {
  const a = useA();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-paper ring-1 ring-line">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="size-6 text-mute" />}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btn.ghost} disabled={busy} onClick={() => ref.current?.click()}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            {value ? a.replace : a.upload}
          </button>
          {value && onClear && (
            <button type="button" className={btn.icon} onClick={onClear} aria-label={a.remove}><X className="size-4" /></button>
          )}
        </div>
        <input
          ref={ref}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (!f) return;
            setBusy(true);
            try {
              await onUpload(f);
            } catch (err) {
              toast(String((err as Error).message || err), 'error');
            } finally {
              setBusy(false);
            }
          }}
        />
      </div>
    </Field>
  );
}

export function DeleteButton({ onConfirm, label }: { onConfirm: () => void | Promise<void>; label?: string }) {
  const a = useA();
  return (
    <button
      type="button"
      className={btn.danger}
      onClick={async () => {
        if (window.confirm(a.confirmDelete)) await onConfirm();
      }}
    >
      <Trash2 className="size-4" /> {label || a.delete}
    </button>
  );
}

export function Loading() {
  const a = useA();
  return (
    <div className="flex items-center gap-2 py-10 text-sm text-mute" role="status">
      <Loader2 className="size-4 animate-spin" /> {a.loading}
    </div>
  );
}

export function ErrorBox({ error }: { error: unknown }) {
  const a = useA();
  if (!error) return null;
  const msg = error instanceof Error ? error.message : typeof error === 'object' && error && 'message' in error ? String((error as { message: string }).message) : String(error);
  return <p role="alert" className="rounded-xl bg-nar-soft p-3 text-sm font-semibold text-nar-deep">{a.error}: {msg}</p>;
}
