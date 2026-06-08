import type { Brief, TemplateKey } from "@/lib/creatives";
import { StatementTemplate } from "./statement";
import { ProblemToCalmTemplate } from "./problem-to-calm";
import { ProofCardTemplate } from "./proof-card";

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
  "problem-to-calm": {
    label: "Problem to calm",
    blurb: "The second job versus the calm layer, split.",
    Component: ProblemToCalmTemplate,
  },
  "proof-card": {
    label: "Proof card",
    blurb: "Built around the London proof point.",
    Component: ProofCardTemplate,
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
