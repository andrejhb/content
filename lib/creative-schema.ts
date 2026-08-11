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
  | "stack"
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
  solid?: boolean;
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
  channels?: { label?: string; icons: string[]; more?: string };
  notifications?: { icon?: string; title: string; text?: string; meta?: string }[];
};

export type BriefVideo = {
  track: "remotion" | "higgsfield" | "hyperframes";
  composition?: string;
  durationSec?: number;
  fps?: number;
  model?: string;
  prompt?: string;
  audio?: boolean;
  sourceCreativeId?: string;
  // hyperframes: the tracked composition source dir inside the creative folder
  sourceDir?: string;
};

// The canonical Remotion composition registry. remotion/root.tsx registers
// exactly this set (its typed map errors at compile time if one is missing),
// lib/templates.ts labels it, and validateBrief checks video.composition and
// slides[].composition against it so a typo fails at QA time, not mid-render.
export const REMOTION_COMPOSITION_IDS = [
  "animated-statement",
  "animated-feature-card",
  "logo-sting",
  "hostie-ad",
  "phone-mockup-ui",
  "phone-showcase",
  "animated-spotlight",
  "animated-stack",
  "launch-hello",
  "launch-statement",
  "launch-spotlight",
  "launch-products",
  "launch-form",
  "launch-cover",
  "motion-film",
  "remocn-demo",
] as const;
export type RemotionCompositionId = (typeof REMOTION_COMPOSITION_IDS)[number];

// motion-film: a beat-driven film assembled from a closed shot vocabulary.
// Mirrors Film/FilmBeat in lib/creatives.ts.
export type FilmShot =
  | "statement"
  | "chat"
  | "stat"
  | "strike"
  | "notify"
  | "media"
  | "roster"
  | "wordmark";

export type FilmTransition = "cut" | "fade" | "push" | "blur";

export type FilmBeat = {
  shot: FilmShot;
  durationSec: number;
  transition?: FilmTransition;
  line?: string;
  tail?: string;
  chat?: {
    question: string;
    answer: string;
    name?: string;
    time?: string;
    avatar?: string;
    tag?: string;
  };
  stat?: { value: number; prefix?: string; suffix?: string; label: string };
  strike?: { from: string; to: string };
  notifications?: { title: string; meta?: string }[];
  media?: string;
  items?: { label: string; text: string }[];
  cta?: string;
};

export type Film = { beats: FilmBeat[] };

export type BriefSlide = {
  label: string;
  composition: string;
  durationSec?: number;
  image?: string | null;
  variant?: "light" | "dark";
  copy?: BriefCopy;
  dim?: number;
  topScrim?: boolean | "soft";
  compactHead?: boolean;
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
  topScrim?: boolean | "soft";
  dim?: number;
  compactHead?: boolean;
  compareLayout?: "hero";
  ctaPill?: boolean;
  copy: BriefCopy;
  slides?: BriefSlide[];
  film?: Film;
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
  "stack",
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
    } else if (
      b.video.track !== "remotion" &&
      b.video.track !== "higgsfield" &&
      b.video.track !== "hyperframes"
    ) {
      errors.push('video.track must be "remotion", "higgsfield" or "hyperframes"');
    } else if (b.video.track === "remotion") {
      const comp = b.video.composition;
      if (typeof comp !== "string" || comp.length === 0) {
        errors.push("video.composition is required for the remotion track");
      } else if (!REMOTION_COMPOSITION_IDS.includes(comp as RemotionCompositionId)) {
        errors.push(
          `video.composition "${comp}" is not a registered composition (${REMOTION_COMPOSITION_IDS.join(", ")})`,
        );
      }
      if (comp === "motion-film") validateFilm(b, errors);
      else if ("film" in b && b.film !== undefined)
        errors.push("film is only valid with video.composition motion-film");
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
        if (typeof s.composition !== "string") {
          errors.push(`slides[${i}].composition must be a string`);
        } else if (
          !REMOTION_COMPOSITION_IDS.includes(s.composition as RemotionCompositionId)
        ) {
          errors.push(
            `slides[${i}].composition "${s.composition}" is not a registered composition`,
          );
        }
      });
    }
  }

  return { ok: errors.length === 0, errors };
}

// Beat bounds mirror remotion/motion/craft.ts (kept inline because this file
// stays import-free so scripts/qa.mjs can load it under plain Node).
const FILM_SHOTS: readonly FilmShot[] = [
  "statement",
  "chat",
  "stat",
  "strike",
  "notify",
  "media",
  "roster",
  "wordmark",
];
const FILM_TRANSITIONS: readonly FilmTransition[] = ["cut", "fade", "push", "blur"];
const BEAT_MIN_SEC = 1.5;
const BEAT_MAX_SEC = 4;
const BEAT_CHAT_MAX_SEC = 8;
const BEAT_NOTIFY_MAX_SEC = 6;
const MIN_BEATS = 2;
const MAX_BEATS = 10;

function validateFilm(b: Record<string, unknown>, errors: string[]) {
  if (!isObject(b.film) || !Array.isArray((b.film as Record<string, unknown>).beats)) {
    errors.push("film.beats is required for motion-film");
    return;
  }
  const beats = (b.film as { beats: unknown[] }).beats;
  if (beats.length < MIN_BEATS || beats.length > MAX_BEATS) {
    errors.push(`film.beats must have ${MIN_BEATS}-${MAX_BEATS} beats (has ${beats.length})`);
  }
  beats.forEach((raw, i) => {
    const at = `film.beats[${i}]`;
    if (!isObject(raw)) {
      errors.push(`${at} must be an object`);
      return;
    }
    const beat = raw as Partial<FilmBeat> & Record<string, unknown>;
    const shot = beat.shot as FilmShot;
    if (!FILM_SHOTS.includes(shot)) {
      errors.push(`${at}.shot "${String(beat.shot)}" is not one of ${FILM_SHOTS.join(", ")}`);
      return;
    }
    if ("transition" in beat && !FILM_TRANSITIONS.includes(beat.transition as FilmTransition)) {
      errors.push(
        `${at}.transition "${String(beat.transition)}" is not one of ${FILM_TRANSITIONS.join(", ")}`,
      );
    }
    const max =
      shot === "chat" ? BEAT_CHAT_MAX_SEC : shot === "notify" ? BEAT_NOTIFY_MAX_SEC : BEAT_MAX_SEC;
    if (typeof beat.durationSec !== "number" || beat.durationSec < BEAT_MIN_SEC || beat.durationSec > max) {
      errors.push(`${at}.durationSec must be a number between ${BEAT_MIN_SEC} and ${max} for ${shot}`);
    }
    const reqStr = (obj: Record<string, unknown> | undefined, key: string, label: string) => {
      if (!obj || typeof obj[key] !== "string" || (obj[key] as string).length === 0)
        errors.push(`${at}.${label} must be a non-empty string`);
    };
    if (shot === "statement") reqStr(beat, "line", "line");
    if (shot === "chat") {
      reqStr(beat.chat as Record<string, unknown>, "question", "chat.question");
      reqStr(beat.chat as Record<string, unknown>, "answer", "chat.answer");
    }
    if (shot === "stat") {
      if (typeof beat.stat?.value !== "number") errors.push(`${at}.stat.value must be a number`);
      reqStr(beat.stat as unknown as Record<string, unknown>, "label", "stat.label");
    }
    if (shot === "strike") {
      reqStr(beat.strike as Record<string, unknown>, "from", "strike.from");
      reqStr(beat.strike as Record<string, unknown>, "to", "strike.to");
    }
    if (shot === "notify") {
      const cards = beat.notifications;
      if (!Array.isArray(cards) || cards.length < 2 || cards.length > 4) {
        errors.push(`${at}.notifications must be an array of 2-4 cards`);
      } else {
        cards.forEach((n, j) => reqStr(n as Record<string, unknown>, "title", `notifications[${j}].title`));
      }
    }
    if (shot === "media") reqStr(beat, "media", "media");
    if (shot === "roster") {
      const items = beat.items;
      if (!Array.isArray(items) || items.length < 2 || items.length > 4) {
        errors.push(`${at}.items must be an array of 2-4 rows`);
      } else {
        items.forEach((it, j) => {
          reqStr(it as Record<string, unknown>, "label", `items[${j}].label`);
          reqStr(it as Record<string, unknown>, "text", `items[${j}].text`);
        });
      }
    }
  });
  const last = beats[beats.length - 1];
  if (isObject(last) && (last as { shot?: string }).shot !== "wordmark") {
    errors.push("film.beats must close on a wordmark beat");
  }
}
