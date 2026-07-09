// Client-safe catalogue of the creative templates the wizard offers and the
// generated prompt steers toward. It unifies the two template families: the
// static image templates (components/templates/*) and the Remotion motion
// compositions (remotion/compositions/*). This is the SINGLE source for their
// display names and blurbs, re-imported by components/templates/registry.tsx and
// lib/creatives.ts so nothing is duplicated.
//
// Keep this module free of node:fs (unlike lib/creatives.ts) so the client wizard
// can import it directly. TemplateKey and ContentType are type-only imports, so
// they erase at build and never pull the server modules into the client bundle.

import type { ContentType } from "@/lib/create";
import type { TemplateKey } from "@/lib/creatives";

// The 8 static image templates: display name + one-line blurb. Moved here from
// components/templates/registry.tsx, which now imports these back and keeps only
// the React Component wiring.
export const TEMPLATE_META: Record<TemplateKey, { label: string; blurb: string }> = {
  statement: {
    label: "Statement",
    blurb: "One strong line, pure type on a token background.",
  },
  "proof-card": {
    label: "Proof card",
    blurb: "Built around the London proof point.",
  },
  "image-card": {
    label: "Image card",
    blurb: "Eyebrow + headline over a large supplied image.",
  },
  "feature-card": {
    label: "Feature card",
    blurb: "Phone mockup floating on a neutral surface panel.",
  },
  showcase: {
    label: "Showcase",
    blurb: "Headline, icon badges, and a product screenshot.",
  },
  spotlight: {
    label: "Spotlight",
    blurb: "Full-bleed image or video, two-tone headline, optional CTA.",
  },
  "launch-hello": {
    label: "Launch hello",
    blurb: "Dark editorial greeting for the brand account. Big light-weight type on near-black.",
  },
  "launch-index": {
    label: "Launch index",
    blurb: "Dark explainer: flag headline, thesis, and a three-part Host/Stay/Work index.",
  },
};

// Friendly names for the Remotion compositions (the motion "templates"). Moved
// here from lib/creatives.ts, which now imports it back for templateLabel().
export const COMPOSITION_LABELS: Record<string, string> = {
  "phone-mockup-ui": "Phone mockup UI",
  "animated-feature-card": "Feature card",
  "animated-statement": "Statement",
  "animated-spotlight": "Spotlight",
  "hostie-ad": "Hostie ad",
  "logo-sting": "Logo sting",
  "launch-hello": "Launch hello",
  "launch-statement": "Launch statement",
  "launch-spotlight": "Launch spotlight",
  "launch-products": "Launch products",
  "launch-form": "Launch form",
  "launch-cover": "Launch cover",
};

export type TemplateEntry = {
  // TemplateKey for static, Remotion composition id for motion. Only unique
  // WITHIN a content type (a static and a motion entry may share an id, e.g.
  // "launch-hello"), so resolve a selection against templatesFor(...), never
  // globally.
  id: string;
  name: string;
  blurb: string;
  kind: "image" | "video";
  track: "static" | "remotion";
  // Which wizard content types this template fits.
  contentTypes: ContentType[];
  // Repo file paths the engine should read to reproduce this template exactly.
  reference: string[];
  // launch-*: parent-brand only, shown when product === "general".
  parentOnly?: boolean;
};

const STATIC_REF = (id: TemplateKey) => [`components/templates/${id}.tsx`];
const MOTION_REF = (id: string) => [`remotion/compositions/${id}.tsx`];

// Static image templates. Spotlight doubles as the carousel template.
const STATIC: TemplateEntry[] = (Object.keys(TEMPLATE_META) as TemplateKey[]).map((id) => ({
  id,
  name: TEMPLATE_META[id].label,
  blurb: TEMPLATE_META[id].blurb,
  kind: "image",
  track: "static",
  contentTypes: id === "spotlight" ? ["static", "carousel"] : ["static"],
  reference: STATIC_REF(id),
  parentOnly: id === "launch-hello" || id === "launch-index",
}));

// Remotion compositions offered for reel/video. phone-mockup-ui also points at
// its template doc. logo-sting is a short brand sting; the six launch-* are
// parent-brand only.
const MOTION_SEED: (Pick<TemplateEntry, "id" | "blurb" | "reference"> & { parentOnly?: boolean })[] = [
  { id: "animated-statement", blurb: "One strong line that animates in, pure type.", reference: MOTION_REF("animated-statement") },
  { id: "animated-feature-card", blurb: "A phone mockup and feature line, animated on a neutral panel.", reference: MOTION_REF("animated-feature-card") },
  {
    id: "phone-mockup-ui",
    blurb: "A real iPhone playing your app UI, with a headline that crossfades into a CTA.",
    reference: ["remotion/compositions/phone-mockup-ui.tsx", "prompts/remotion-motion.md"],
  },
  { id: "animated-spotlight", blurb: "Full-bleed image or video with a two-tone headline, in motion.", reference: MOTION_REF("animated-spotlight") },
  { id: "hostie-ad", blurb: "The Hostie AI answering-guests story, told as a short ad.", reference: MOTION_REF("hostie-ad") },
  { id: "logo-sting", blurb: "A short brand sting on the Hububb logo.", reference: MOTION_REF("logo-sting") },
  { id: "launch-hello", blurb: "Dark editorial greeting for the brand account, animated.", reference: MOTION_REF("launch-hello"), parentOnly: true },
  { id: "launch-statement", blurb: "Dark brand statement in animated big type.", reference: MOTION_REF("launch-statement"), parentOnly: true },
  { id: "launch-spotlight", blurb: "Dark brand spotlight over full-bleed media.", reference: MOTION_REF("launch-spotlight"), parentOnly: true },
  { id: "launch-products", blurb: "The three-part Host, Stay, Work product index, animated.", reference: MOTION_REF("launch-products"), parentOnly: true },
  { id: "launch-form", blurb: "Dark brand call-to-action moment.", reference: MOTION_REF("launch-form"), parentOnly: true },
  { id: "launch-cover", blurb: "Dark brand cover card.", reference: MOTION_REF("launch-cover"), parentOnly: true },
];

const MOTION: TemplateEntry[] = MOTION_SEED.map((m) => ({
  ...m,
  name: COMPOSITION_LABELS[m.id] ?? m.id,
  kind: "video",
  track: "remotion",
  contentTypes: ["reel", "video"],
}));

export const TEMPLATE_CATALOGUE: TemplateEntry[] = [...STATIC, ...MOTION];

/** Templates that fit a content type for a product (launch-* only for general). */
export function templatesFor(ct: ContentType, product: string): TemplateEntry[] {
  return TEMPLATE_CATALOGUE.filter(
    (t) => t.contentTypes.includes(ct) && (!t.parentOnly || product === "general"),
  );
}

/** Resolve a chosen id against an already-filtered list (ids are unique per content type). */
export function templateById(
  entries: TemplateEntry[],
  id: string | null,
): TemplateEntry | null {
  if (!id) return null;
  return entries.find((t) => t.id === id) ?? null;
}
