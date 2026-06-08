import { CockpitHeader } from "@/components/site/cockpit-header";
import { BrandKit } from "@/components/brand-kit/brand-kit";
import { Hallway } from "@/components/creatives/hallway";
import { SkillsList } from "@/components/skills/skills-list";

export const dynamic = "force-dynamic";

function Zone({
  eyebrow,
  title,
  description,
  children,
  first = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <section className={first ? "" : "border-t border-border"}>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="font-mono text-caption tracking-wide text-dim uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-heading-3 leading-heading-3 text-t1">{title}</h2>
        <p className="mt-2 max-w-2xl text-body text-t3">{description}</p>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

export default function CockpitPage() {
  return (
    <div className="min-h-dvh">
      <CockpitHeader />

      <Zone
        first
        eyebrow="Creatives"
        title="The hallway"
        description="Every creative you've made, newest first. Click into one to review its formats and download PNGs."
      >
        <Hallway />
      </Zone>

      <Zone
        eyebrow="Skills"
        title="Generation skills"
        description="Every available skill — the installed marketing skills plus hububb-creative — read live from the skills directory."
      >
        <SkillsList />
      </Zone>

      <section className="border-t border-border">
        <BrandKit />
      </section>
    </div>
  );
}
