import { getSections } from "@/lib/brand";
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
  { id: "assets", label: "Assets" },
];

export async function BrandKit({ product }: { product: string }) {
  const [coreSections, voiceSections] = await Promise.all([
    getSections(product, CORE_TITLES),
    getSections(product, VOICE_TITLES),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header>
        <p className="font-mono text-caption tracking-wide text-dim uppercase">
          Brand kit
        </p>
        <h2 className="mt-1 text-heading-3 leading-heading-3 text-t1">Brand hub</h2>
        <p className="mt-2 max-w-2xl text-body text-t3">
          Positioning, voice, and the living design system — from
          product-marketing.md and @hububb/design-system. Share it with the team.
        </p>
      </header>

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
                className="rounded-xl px-2 py-1.5 text-caption text-t3 transition-colors hover:bg-subtle hover:text-t1"
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
            eyebrow="Logos · mockups · screens · channels · photos"
            title="Assets"
            description="Product assets live in the product's folder; parent-brand marks are shared. Drop files in and they appear here, ready to use in creatives."
          >
            <Assets product={product} />
          </Section>
        </div>
      </div>
    </div>
  );
}
