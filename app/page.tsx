import { CockpitHeader } from "@/components/site/cockpit-header";
import { BrandKit } from "@/components/brand-kit/brand-kit";

function ZonePlaceholder({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="font-mono text-caption tracking-wide text-dim uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-heading-3 leading-heading-3 text-t1">{title}</h2>
        <p className="mt-2 max-w-2xl text-body text-t3">{description}</p>
        <div className="mt-6 flex items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-10">
          <p className="text-caption text-muted">Wired up in the next build steps.</p>
        </div>
      </div>
    </section>
  );
}

export default function CockpitPage() {
  return (
    <div className="min-h-dvh">
      <CockpitHeader />

      {/* Zone 1 — Brand kit (the priority) */}
      <BrandKit />

      {/* Zone 2 — Skills */}
      <ZonePlaceholder
        eyebrow="Skills"
        title="Generation skills"
        description="Every available skill — the installed marketing skills plus hububb-creative — read live from the skills directory."
      />

      {/* Zone 3 — Creatives hallway */}
      <ZonePlaceholder
        eyebrow="Creatives"
        title="The hallway"
        description="Every creative you've made, newest first. Click into one to review its formats and download PNGs."
      />
    </div>
  );
}
