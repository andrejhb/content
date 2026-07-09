// Client-safe helpers for the Create wizard: the content-type catalogue and the
// prompt assembler. Kept free of any node:fs import (unlike lib/prompts.ts, which
// is the server-only loader) so the client wizard can import it directly. The
// server page reads the base prompt bodies via lib/prompts.ts and passes them in.

import type { TemplateEntry } from "@/lib/templates";
import type { PersonaDoc } from "@/lib/personas";

export type ContentType = "static" | "carousel" | "reel" | "video" | "motion";

export type ContentTypeSpec = {
  key: ContentType;
  label: string;
  blurb: string;
  // which prompts/<key>.md base prompt this content type builds on
  promptKey: string;
  kind: "image" | "video";
  // hints injected into the base prompt's labelled lines (only lines that exist
  // in the chosen base get filled):
  templates?: string;
  composition?: string;
  formats?: string;
  duration?: string;
};

export const CONTENT_TYPES: ContentTypeSpec[] = [
  {
    key: "static",
    label: "Static",
    blurb: "A single still image.",
    promptKey: "static-creative",
    kind: "image",
    templates: "every template that fits the angle",
    formats: "1x1 / 4x5 / 9x16 / 16x9",
  },
  {
    key: "carousel",
    label: "Carousel",
    blurb: "A multi-slide, swipeable set.",
    promptKey: "static-creative",
    kind: "image",
    templates: "spotlight, built as a carousel with a cover then one slide per point",
    formats: "4x5 / 1x1",
  },
  {
    key: "reel",
    label: "Reel",
    blurb: "A short vertical motion video.",
    promptKey: "remotion-motion",
    kind: "video",
    composition: "let the engine pick",
    formats: "9x16 / 1x1",
    duration: "~8s",
  },
  {
    key: "video",
    label: "Video",
    blurb: "A motion-graphics video, all formats.",
    promptKey: "remotion-motion",
    kind: "video",
    composition: "let the engine pick",
    formats: "1x1 / 4x5 / 9x16 / 16x9",
    duration: "~12s",
  },
  {
    key: "motion",
    label: "Motion",
    blurb: "Generative cinematic video (Higgsfield).",
    promptKey: "higgsfield-motion",
    kind: "video",
  },
];

// Persona portraits available to any persona (assets/shared/avatars): the
// original illustrated set plus photographic headshots added for guest imagery.
export const SHARED_AVATARS = Array.from(
  { length: 18 },
  (_, i) => `/asset/shared/avatars/avatar-${i + 1}.png`,
);

export function contentType(key: ContentType): ContentTypeSpec {
  return CONTENT_TYPES.find((c) => c.key === key) ?? CONTENT_TYPES[0];
}

// Values that can fill the base prompt. Keys map to the labelled lines below.
export type CreatePromptValues = {
  product?: string;
  angle?: string;
  description?: string;
  personaArchetype?: string;
  templates?: string;
  composition?: string;
  formats?: string;
  imagery?: string;
  duration?: string;
};

const LABELS: Record<string, keyof CreatePromptValues> = {
  Angle: "angle",
  Description: "description",
  "Speak to": "personaArchetype",
  Templates: "templates",
  Composition: "composition",
  Formats: "formats",
  Imagery: "imagery",
  Duration: "duration",
};

// Fill a base prompt: substitute {product}/{angle}, then for each "Label: <guidance>"
// line replace the trailing <...> with the provided value. Lines without a value
// keep their <...> guidance so the copied prompt still reads as instructions.
export function fillCreatePrompt(
  body: string,
  values: CreatePromptValues,
): string {
  let out = body;
  if (values.product) out = out.replaceAll("{product}", values.product);
  if (values.angle) out = out.replaceAll("{angle}", values.angle);
  out = out.replace(
    /^(\s*(?:[-*]\s+)?)([A-Za-z][A-Za-z ]*?):[ \t]*<[^>\n]*>/gm,
    (match, prefix: string, label: string) => {
      const key = LABELS[label.trim()];
      const val = key ? values[key] : undefined;
      return val && val.trim() ? `${prefix}${label}: ${val.trim()}` : match;
    },
  );
  return out;
}

// Pull the one-line pitch from a Product Overview section body: the "One-liner"
// line if present, else the first sentence of "Positioning". Used to inline a
// tight product description in the generated prompt.
export function extractOneLiner(overviewBody: string): string {
  const one = overviewBody.match(/\*\*One-liner:\*\*\s*(.+)/)?.[1]?.trim();
  if (one) return one;
  const pos = overviewBody.match(/\*\*Positioning:\*\*\s*(.+)/)?.[1]?.trim();
  if (pos) return pos.match(/^.*?[.!?](\s|$)/)?.[0]?.trim() ?? pos;
  return "";
}

function firstListItem(doc: PersonaDoc, key: string): string | undefined {
  const c = doc.sections?.find((s) => s.key === key)?.content;
  if (Array.isArray(c)) return c[0]?.trim() || undefined;
  if (typeof c === "string") return c.trim() || undefined;
  return undefined;
}

// A compact one-to-two line persona summary for the prompt: who they are plus the
// top job-to-be-done and top pain. The engine reads the full persona.json for the
// rest (see buildContextBlock). No em/en dashes.
export function personaBrief(doc: PersonaDoc): string {
  const p = doc.profile;
  const clip = (s: string) => s.trim().replace(/\.\s*$/, ""); // no doubled periods on join
  const parts: string[] = [];
  const who = [p?.name, p?.headline ?? p?.archetype].filter(Boolean).join(", ");
  if (who) parts.push(clip(who));
  const want = firstListItem(doc, "jtbd");
  if (want) parts.push(`Wants: ${clip(want)}`);
  const pain = firstListItem(doc, "pains");
  if (pain) parts.push(`Pain: ${clip(pain)}`);
  return parts.join(". ");
}

export type CreateSelections = {
  product: string;
  contentType: ContentType;
  personaArchetype?: string;
  personaId?: string;
  productOneLiner?: string;
  personaBrief?: string;
  template?: TemplateEntry | null;
  description: string;
  imagery?: string; // comma-separated served /asset paths
};

// A tight, data-driven context block appended after the label-filled base. This
// is where the richer product/persona/template context lives, since
// fillCreatePrompt can only rewrite labelled lines already in the base body.
function buildContextBlock(sel: CreateSelections): string {
  const hasTemplates = sel.contentType !== "motion";
  const ctx: string[] = [];
  if (sel.productOneLiner) ctx.push(`- Product: ${sel.productOneLiner}`);
  if (sel.personaBrief) ctx.push(`- Persona: ${sel.personaBrief}`);
  if (hasTemplates) {
    ctx.push(
      sel.template
        ? `- Template: ${sel.template.name}. ${sel.template.blurb} Read its reference and match it.`
        : "- Template: let the engine pick the best-fitting template for this angle.",
    );
  }

  const refs: string[] = [`products/${sel.product}/product-marketing.md`];
  if (sel.personaId) refs.push(`products/${sel.product}/personas/${sel.personaId}.json`);
  if (sel.template) refs.push(...sel.template.reference);

  const lines: string[] = [];
  if (ctx.length) lines.push("Context for this creative:", ...ctx);
  if (refs.length) {
    if (lines.length) lines.push("");
    lines.push("Read these before you start:", ...refs.map((r) => `- ${r}`));
  }
  return lines.join("\n");
}

// Assemble the final, copy-ready prompt from the wizard selections + the base
// body: fill the base's labelled lines, then append the dynamic context block.
export function assemblePrompt(baseBody: string, sel: CreateSelections): string {
  const spec = contentType(sel.contentType);
  const chosen = sel.template ?? null;
  const filled = fillCreatePrompt(baseBody, {
    product: sel.product,
    angle: sel.description || undefined,
    personaArchetype: sel.personaArchetype,
    // Feed the chosen template into the right label by track. Keep the carousel
    // hint (spec.templates) rather than the bare id when building a carousel.
    templates:
      chosen && chosen.track === "static" && sel.contentType !== "carousel"
        ? chosen.id
        : spec.templates,
    composition: chosen && chosen.track === "remotion" ? chosen.id : spec.composition,
    formats: spec.formats,
    duration: spec.duration,
    imagery: sel.imagery,
  });
  const ctx = buildContextBlock(sel);
  return ctx ? `${filled}\n\n${ctx}` : filled;
}
