import { Button } from "@hububb/design-system/button";
import { tokens } from "@hububb/design-system/tokens";

// Step 1 proof slice. Replaced by the Cockpit in Step 2. Its only job: show a
// design-system primitive and a token value rendering correctly.
export default function Home() {
  const tokenGroups = Object.keys(tokens as Record<string, unknown>);

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 p-10">
      <header className="flex flex-col gap-2">
        <p className="text-caption uppercase tracking-wide text-t3">
          Step 1 · design system proof
        </p>
        <h1 className="text-heading-1 text-t1">Hububb content engine</h1>
        <p className="text-body text-t2">
          If this card is styled and the buttons below look like Hububb buttons,
          the design system is wired correctly — tokens, Tailwind layer, and
          primitives all resolve from <code className="text-code">@hububb/design-system</code>.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-elevation-2">
        <p className="text-caption text-t3">
          Primitive — <code className="text-code">@hububb/design-system/button</code>
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-elevation-2">
        <p className="text-caption text-t3">
          Tokens — <code className="text-code">@hububb/design-system/tokens</code>
        </p>
        <p className="mt-2 text-body text-t1">
          {tokenGroups.length} top-level token groups loaded
        </p>
        <p className="mt-1 break-words text-code text-muted">
          {tokenGroups.join(" · ")}
        </p>
      </section>

      <section className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-6">
        <div className="size-10 rounded-lg border border-border bg-background" />
        <div className="size-10 rounded-lg border border-border bg-card" />
        <div className="size-10 rounded-lg bg-t1" />
        <div className="size-10 rounded-lg bg-nav-active" />
        <p className="text-caption text-t3">
          Swatches driven by semantic colour tokens (light/dark aware)
        </p>
      </section>
    </main>
  );
}
