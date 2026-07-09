import type { Brief, TemplateKey } from "@/lib/creatives";
import { TEMPLATE_META } from "@/lib/templates";
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

// The render components, keyed by template. Labels/blurbs come from the shared
// catalogue (lib/templates.ts) so the wizard, the prompt, and this render map all
// read the same names.
const COMPONENTS: Record<TemplateKey, TemplateComponent> = {
  statement: StatementTemplate,
  "proof-card": ProofCardTemplate,
  "image-card": ImageCardTemplate,
  "feature-card": FeatureCardTemplate,
  showcase: ShowcaseTemplate,
  spotlight: SpotlightTemplate,
  "launch-hello": LaunchHelloTemplate,
  "launch-index": LaunchIndexTemplate,
};

export const TEMPLATES = Object.fromEntries(
  (Object.keys(COMPONENTS) as TemplateKey[]).map((k) => [
    k,
    { ...TEMPLATE_META[k], Component: COMPONENTS[k] },
  ]),
) as Record<TemplateKey, { label: string; blurb: string; Component: TemplateComponent }>;

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
