import { getBrandDoc, getSections } from "@/lib/brand";
import { Section } from "@/components/site/section";
import { SectionBlocks } from "@/components/brand-kit/section-blocks";
import { Colours } from "@/components/brand-kit/colours";
import { Typography } from "@/components/brand-kit/typography";
import { Foundations } from "@/components/brand-kit/foundations";
import { ComponentsGallery } from "@/components/brand-kit/components-gallery";
import { Icons } from "@/components/brand-kit/icons";
import { Assets } from "@/components/brand-kit/assets";

const CORE_TITLES = [
  "Product Overview",
  "Target Audience",
  "Personas",
  "Problems & Pain Points",
  "Competitive Landscape",
  "Differentiation",
];

const VOICE_TITLES = [
  "Brand Voice",
  "Customer Language",
  "Objections",
  "Switching Dynamics",
  "Proof Points",
  "Goals",
];

const NAV = [
  { id: "brand-core", label: "Brand core" },
  { id: "brand-voice", label: "Voice & guidelines" },
  { id: "colours", label: "Colours" },
  { id: "type", label: "Typography" },
  { id: "foundations", label: "Foundations" },
  { id: "components", label: "Components" },
  { id: "icons", label: "Icons" },
  { id: "assets", label: "Logos, graphics, photos" },
];

export async function BrandKit() {
  const doc = await getBrandDoc();
  const overview = doc.byTitle["Product Overview"]?.body ?? "";
  const headline = overview.match(/Headline:\s*(.+)/)?.[1]?.trim();
  const positioning = overview.match(/Positioning:\s*(.+)/)?.[1]?.trim();
  const oneLiner = overview.match(/\*\*One-liner:\*\*\s*(.+)/)?.[1]?.trim();

  const [coreSections, voiceSections] = await Promise.all([
    getSections(CORE_TITLES),
    getSections(VOICE_TITLES),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* Hero — derived from product-marketing.md, nothing typed by hand */}
      <div className="border-b border-border pb-10">
        <p className="font-mono text-caption tracking-wide text-dim uppercase">
          Hububb Host · brand hub
        </p>
        {headline ? (
          <h1 className="mt-3 max-w-3xl text-display-2 leading-display-2 font-semibold text-t1">
            {headline}
          </h1>
        ) : null}
        {positioning ? (
          <p className="mt-4 max-w-2xl text-body-lg leading-body-lg text-t3">
            {positioning}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-2.5 font-mono text-caption text-muted">
          {oneLiner ? (
            <span className="rounded-full border border-border px-2.5 py-1 text-t2">
              {oneLiner}
            </span>
          ) : null}
          {doc.updated ? <span>updated {doc.updated}</span> : null}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[190px_1fr]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 flex flex-col gap-1">
            <p className="mb-2 font-mono text-caption tracking-wide text-dim uppercase">
              On this page
            </p>
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="rounded-md px-2 py-1.5 text-caption text-t3 transition-colors hover:bg-subtle hover:text-t1"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-col gap-16">
          <Section
            id="brand-core"
            eyebrow="Positioning · audience · differentiation"
            title="Brand core"
            description="The strategic foundation, straight from product-marketing.md."
          >
            <SectionBlocks sections={coreSections} />
          </Section>

          <Section
            id="brand-voice"
            eyebrow="How we sound"
            title="Voice & guidelines"
            description="Voice attributes, the words to use and avoid, proof guardrails, and the glossary copy must get right."
          >
            <SectionBlocks sections={voiceSections} />
          </Section>

          <Section
            id="colours"
            eyebrow="Live from @hububb/design-system"
            title="Colours"
            description="Eight families with 21-step scales, plus the semantic layer components consume."
          >
            <Colours />
          </Section>

          <Section
            id="type"
            eyebrow="Live from @hububb/design-system"
            title="Typography"
            description="The Inter type ramp — display through caption — at app-surface fluid sizes."
          >
            <Typography />
          </Section>

          <Section
            id="foundations"
            eyebrow="Live from @hububb/design-system"
            title="Foundations"
            description="Radius, elevation, spacing, and motion tokens."
          >
            <Foundations />
          </Section>

          <Section
            id="components"
            eyebrow="Live from @hububb/design-system"
            title="Components"
            description="Real primitives rendered from the package — the same ones the product ships."
          >
            <ComponentsGallery />
          </Section>

          <Section
            id="icons"
            eyebrow="Live from @hububb/design-system"
            title="Icons"
            description="The Phosphor set the design system is built on."
          >
            <Icons />
          </Section>

          <Section
            id="assets"
            eyebrow="Placeholders until assets land"
            title="Logos, graphics, photos"
            description="Drop files into brand/ and they appear here."
          >
            <Assets />
          </Section>
        </div>
      </div>
    </div>
  );
}
