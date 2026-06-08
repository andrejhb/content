// Server component — no theme toggle (intentionally removed).
export function CockpitHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand-asset/logos/hububb-symbol.svg"
          alt="Hububb"
          className="site-logo size-7"
        />
        <div className="leading-tight">
          <p className="text-body font-semibold text-t1">Hububb content engine</p>
          <p className="font-mono text-caption text-dim">
            brand hub · creative engine
          </p>
        </div>
        <span className="ml-1 rounded-full border border-border px-2 py-0.5 font-mono text-caption text-muted">
          preview
        </span>
      </div>
    </header>
  );
}
