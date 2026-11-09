export function PageLoader() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center pt-24" role="status" aria-live="polite">
      <span className="flex gap-2" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-3 animate-bounce rounded-full bg-nar motion-reduce:animate-none" style={{ animationDelay: `${i * 0.12}s` }} />
        ))}
      </span>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
