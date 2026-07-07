import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { FormatKey } from "@/lib/formats";

export type TemplateKey =
  | "statement"
  | "proof-card"
  | "image-card"
  | "feature-card"
  | "showcase"
  | "spotlight"
  | "launch-hello"
  | "launch-index";

export type CreativeCopy = {
  eyebrow?: string;
  headline?: string;
  subhead?: string;
  // showcase: Phosphor icon names for the floating badges (e.g. ["Broom","Airplane","House"])
  badges?: string[];
  // spotlight: the muted second half of a two-tone headline, and an optional CTA pill label
  headlineTail?: string;
  cta?: string;
  // spotlight (animated): rotate through these messages one at a time instead of a static headline
  rotating?: string[];
  // launch-index: the three-part index rows (e.g. Host / Stay / Work with a one-line each)
  items?: { label: string; text: string }[];
  // launch-*: small handle/footer marker (e.g. "@wearehububb")
  handle?: string;
};

export type QaCheck = { rule: string; ok: boolean; detail?: string };
export type QaResult = { passed: boolean; checks: QaCheck[]; checkedAt?: string };

// A carousel slide. When a brief carries `slides`, it renders as a multi-slide
// carousel: each slide is its own Remotion composition + copy + optional media,
// rendered per format to s<n>-<format>.mp4 (1-indexed).
export type Slide = {
  label: string;
  composition: string;
  durationSec?: number;
  image?: string | null;
  variant?: "light" | "dark";
  copy?: CreativeCopy;
};

export type VideoSpec = {
  track: "remotion" | "higgsfield";
  composition?: string; // remotion composition id
  durationSec?: number;
  fps?: number;
  model?: string; // higgsfield model actually used
  prompt?: string; // higgsfield generation prompt
  audio?: boolean;
  sourceCreativeId?: string; // still creative this motion piece derives from
};

export type Brief = {
  id: string;
  createdAt: string;
  product: string; // product slug, e.g. "host" — folder under products/
  persona?: string; // persona id this creative speaks to, e.g. "side-hustler"
  angle: string;
  brief: string;
  kind?: "image" | "video"; // absent = image (pre-video briefs)
  video?: VideoSpec;
  template: TemplateKey;
  formats: FormatKey[];
  brandMark: boolean;
  image?: string | null; // a served path, e.g. /asset/host/screens/messaging.png
  variant?: "light" | "dark";
  copy: CreativeCopy;
  slides?: Slide[]; // when present, this creative is a carousel
  qa?: QaResult;
};

const ROOT = path.join(process.cwd(), "creatives");

async function readBriefFromDir(dir: string): Promise<Brief | null> {
  try {
    const raw = await readFile(path.join(ROOT, dir, "brief.json"), "utf8");
    const brief = JSON.parse(raw) as Brief;
    brief.product ||= "host"; // pre-multi-product briefs carry no product field
    return brief;
  } catch {
    return null;
  }
}

/** All creatives in the workboard, newest first; optionally one product's. */
export async function listCreatives(product?: string): Promise<Brief[]> {
  let entries: string[];
  try {
    const dirents = await readdir(ROOT, { withFileTypes: true });
    entries = dirents.filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    return [];
  }
  const briefs = (await Promise.all(entries.map(readBriefFromDir))).filter(
    (b): b is Brief => b !== null && (!product || b.product === product),
  );
  return briefs.sort((a, b) =>
    (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
  );
}

export async function getCreative(id: string): Promise<Brief | null> {
  // Guard against path traversal in the [id] segment.
  if (id.includes("/") || id.includes("..")) return null;
  return readBriefFromDir(id);
}

export type RenderedMedia = { format: FormatKey; ext: "png" | "mp4" };

/**
 * Which formats have a rendered file on disk, in canonical order. Video
 * creatives get an mp4 per format (plus a png poster used for thumbnails);
 * the mp4 wins as the format's medium when both exist.
 */
export async function renderedMedia(id: string): Promise<RenderedMedia[]> {
  const order: FormatKey[] = ["1x1", "4x5", "9x16", "16x9"];
  try {
    const files = await readdir(path.join(ROOT, id));
    const have = new Map<string, "png" | "mp4">();
    for (const f of files) {
      const m = f.match(/^(.+)\.(png|mp4)$/);
      if (!m) continue;
      const [, key, ext] = m;
      if (ext === "mp4" || !have.has(key)) have.set(key, ext as "png" | "mp4");
    }
    return order
      .filter((k) => have.has(k))
      .map((k) => ({ format: k, ext: have.get(k)! }));
  } catch {
    return [];
  }
}

/**
 * Rendered media per carousel slide. Files are named s<n>-<format>.<ext>
 * (1-indexed slide). Returns, for each slide index, the formats present.
 */
export async function renderedSlideMedia(
  id: string,
): Promise<{ slide: number; media: RenderedMedia[] }[]> {
  const order: FormatKey[] = ["1x1", "4x5", "9x16", "16x9"];
  let files: string[];
  try {
    files = await readdir(path.join(ROOT, id));
  } catch {
    return [];
  }
  const bySlide = new Map<number, Map<string, "png" | "mp4">>();
  for (const f of files) {
    const m = f.match(/^s(\d+)-(1x1|4x5|9x16|16x9)\.(png|mp4)$/);
    if (!m) continue;
    const slide = Number(m[1]);
    const key = m[2];
    const ext = m[3] as "png" | "mp4";
    if (!bySlide.has(slide)) bySlide.set(slide, new Map());
    const have = bySlide.get(slide)!;
    if (ext === "mp4" || !have.has(key)) have.set(key, ext);
  }
  return [...bySlide.keys()]
    .sort((a, b) => a - b)
    .map((slide) => ({
      slide,
      media: order
        .filter((k) => bySlide.get(slide)!.has(k))
        .map((k) => ({ format: k, ext: bySlide.get(slide)!.get(k)! })),
    }));
}
