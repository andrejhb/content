"use client";

import ThemeToggle from "@hububb/design-system/theme-toggle";

export function CockpitHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-7 items-center justify-center rounded-md bg-foreground">
            <span className="text-caption font-semibold text-background">H</span>
          </div>
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
        <ThemeToggle />
      </div>
    </header>
  );
}
