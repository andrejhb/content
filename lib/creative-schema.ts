// Runtime brief validator, kept in step with the Brief type in lib/creatives.ts.
//
// This file is intentionally self-contained (no imports) and uses erasable-only
// TypeScript so plain Node can strip the types and import it directly from
// scripts/qa.mjs (Node >= 22.18): `import { validateBrief } from "../lib/creative-schema.ts"`.
// The app imports the same validateBrief through the normal bundler path.
//
// It does required-field + shape checks against the real brief schema. It is a
// gate, not a scorer: it returns a boolean plus human-readable errors, and never
// mutates the brief. Keep the shape below additive when the Brief type grows.

export type CreativeTemplate =
  | "statement"
  | "proof-card"
  | "image-card"
  | "feature-card"
  | "showcase"
  | "spotlight"
  | "compare"
  | "launch-hello"
  | "launch-index";

export type CreativeFormat = "1x1" | "4x5" | "9x16" | "16x9";

export type BriefCopy = {
  eyebrow?: string;
  headline?: string;
  subhead?: string;
  proof?: string;
  badges?: string[];
  headlineTail?: string;
  cta?: string;
  ctaIcon?: string;
  rotating?: string[];
  items?: { label: string; text: string }[];
  handle?: string;
  compare?: {
    leftTitle?: string;
    rightTitle?: string;
    left: string[];
    right: string[];
    footer?: string;
  };
};

export type BriefVideo = {
  track: "remotion" | "higgsfield";
  composition?: string;
  durationSec?: number;
  fps?: number;
  model?: string;
  prompt?: string;
  audio?: boolean;
  sourceCreativeId?: string;
};

export type BriefSlide = {
  label: string;
  composition: string;
  durationSec?: number;
  image?: string | null;
  variant?: "light" | "dark";
  copy?: BriefCopy;
};

// Mirrors Brief in lib/creatives.ts.
export type CreativeBrief = {
  id: string;
  createdAt: string;
  product: string;
  persona?: string;
  angle: string;
  brief: string;
  kind?: "image" | "video";
  video?: BriefVideo;
  template: CreativeTemplate;
  formats: CreativeFormat[];
  brandMark: boolean;
  image?: string | null;
  panelImage?: string | null;
  variant?: "light" | "dark";
  copy: BriefCopy;
  slides?: BriefSlide[];
  qa?: unknown;
};

export type ValidationResult = { ok: boolean; errors: string[] };

const TEMPLATES: readonly CreativeTemplate[] = [
  "statement",
  "proof-card",
  "image-card",
  "feature-card",
  "showcase",
  "spotlight",
  "compare",
  "launch-hello",
  "launch-index",
];

const FORMATS: readonly CreativeFormat[] = ["1x1", "4x5", "9x16", "16x9"];

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Validate a parsed brief object against the real schema. Returns `{ ok, errors }`
 * with one error string per problem. Does not throw and does not mutate `input`.
 */
export function validateBrief(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isObject(input)) {
    return { ok: false, errors: ["brief is not an object"] };
  }
  const b = input;

  const str = (key: string) => {
    if (typeof b[key] !== "string" || (b[key] as string).length === 0)
      errors.push(`${key} must be a non-empty string`);
  };
  const optStr = (key: string) => {
    if (key in b && typeof b[key] !== "string")
      errors.push(`${key} must be a string when present`);
  };

  // Required scalar fields.
  str("id");
  str("createdAt");
  str("product");
  str("angle");
  str("brief");

  // template: closed set.
  if (typeof b.template !== "string") {
    errors.push("template must be a string");
  } else if (!TEMPLATES.includes(b.template as CreativeTemplate)) {
    errors.push(`template "${b.template}" is not one of ${TEMPLATES.join(", ")}`);
  }

  // formats: array of known keys.
  if (!Array.isArray(b.formats)) {
    errors.push("formats must be an array");
  } else {
    for (const f of b.formats)
      if (typeof f !== "string" || !FORMATS.includes(f as CreativeFormat))
        errors.push(`formats contains invalid value "${String(f)}"`);
  }

  if (typeof b.brandMark !== "boolean") errors.push("brandMark must be a boolean");

  if (!isObject(b.copy)) errors.push("copy must be an object");

  // Optional scalars.
  optStr("persona");
  if ("kind" in b && b.kind !== "image" && b.kind !== "video")
    errors.push('kind must be "image" or "video" when present');
  if ("variant" in b && b.variant !== "light" && b.variant !== "dark")
    errors.push('variant must be "light" or "dark" when present');
  if ("image" in b && b.image !== null && typeof b.image !== "string")
    errors.push("image must be a string or null when present");
  if ("panelImage" in b && b.panelImage !== null && typeof b.panelImage !== "string")
    errors.push("panelImage must be a string or null when present");

  // Optional video block.
  if ("video" in b && b.video !== undefined) {
    if (!isObject(b.video)) {
      errors.push("video must be an object when present");
    } else if (b.video.track !== "remotion" && b.video.track !== "higgsfield") {
      errors.push('video.track must be "remotion" or "higgsfield"');
    }
  }

  // Optional carousel slides.
  if ("slides" in b && b.slides !== undefined) {
    if (!Array.isArray(b.slides)) {
      errors.push("slides must be an array when present");
    } else {
      b.slides.forEach((s, i) => {
        if (!isObject(s)) {
          errors.push(`slides[${i}] must be an object`);
          return;
        }
        if (typeof s.label !== "string") errors.push(`slides[${i}].label must be a string`);
        if (typeof s.composition !== "string")
          errors.push(`slides[${i}].composition must be a string`);
      });
    }
  }

  return { ok: errors.length === 0, errors };
}
