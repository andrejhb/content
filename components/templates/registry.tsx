import type { Brief, TemplateKey } from "@/lib/creatives";
import { StatementTemplate } from "./statement";
import { ProofCardTemplate } from "./proof-card";
import { ImageCardTemplate } from "./image-card";
import { FeatureCardTemplate } from "./feature-card";
import { ShowcaseTemplate } from "./showcase";
import { SpotlightTemplate } from "./spotlight";
import { LaunchHelloTemplate } from "./launch-hello";
import { LaunchIndexTemplate } from "./launch-index";

type TemplateComponent = (props: {
  brief: Brief;
  w: number;
  h: number;
}) => React.ReactElement;

export const TEMPLATES: Record<
  TemplateKey,
  { label: string; blurb: string; Component: TemplateComponent }
> = {
  statement: {
    label: "Statement",
    blurb: "One strong line, pure type on a token background.",
    Component: StatementTemplate,
  },
  "proof-card": {
    label: "Proof card",
    blurb: "Built around the London proof point.",
    Component: ProofCardTemplate,
  },
  "image-card": {
    label: "Image card",
    blurb: "Eyebrow + headline over a large supplied image.",
    Component: ImageCardTemplate,
  },
  "feature-card": {
    label: "Feature card",
    blurb: "Phone mockup floating on a neutral surface panel.",
    Component: FeatureCardTemplate,
  },
  showcase: {
    label: "Showcase",
    blurb: "Headline, icon badges, and a product screenshot.",
    Component: ShowcaseTemplate,
  },
  spotlight: {
    label: "Spotlight",
    blurb: "Full-bleed image or video, two-tone headline, optional CTA.",
    Component: SpotlightTemplate,
  },
  "launch-hello": {
    label: "Launch hello",
    blurb: "Dark editorial greeting for the brand account. Big light-weight type on near-black.",
    Component: LaunchHelloTemplate,
  },
  "launch-index": {
    label: "Launch index",
    blurb: "Dark explainer: flag headline, thesis, and a three-part Host/Stay/Work index.",
    Component: LaunchIndexTemplate,
  },
};

export function CreativeRender({
  brief,
  w,
  h,
}: {
  brief: Brief;
  w: number;
  h: number;
}) {
  const entry = TEMPLATES[brief.template];
  if (!entry) return null;
  const Component = entry.Component;
  return <Component brief={brief} w={w} h={h} />;
}
