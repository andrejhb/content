import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { FormatKey } from "@/lib/formats";

export type TemplateKey =
  | "statement"
  | "problem-to-calm"
  | "proof-card"
  | "image-card"
  | "feature-card"
  | "showcase";

export type CreativeCopy = {
  eyebrow?: string;
  headline?: string;
  subhead?: string;
  // problem-to-calm
  problemLabel?: string;
  problems?: string[];
  calmLabel?: string;
  calm?: string;
  // showcase — Phosphor icon names for the floating badges (e.g. ["Broom","Airplane","House"])
  badges?: string[];
};

export type QaCheck = { rule: string; ok: boolean; detail?: string };
export type QaResult = { passed: boolean; checks: QaCheck[]; checkedAt?: string };

export type Brief = {
  id: string;
  createdAt: string;
  angle: string;
  brief: string;
  template: TemplateKey;
  formats: FormatKey[];
  brandMark: boolean;
  image?: string | null; // a served path, e.g. /asset/screens/messaging.png
  variant?: "light" | "dark";
  copy: CreativeCopy;
  qa?: QaResult;
};

const ROOT = path.join(process.cwd(), "creatives");

async function readBriefFromDir(dir: string): Promise<Brief | null> {
  try {
    const raw = await readFile(path.join(ROOT, dir, "brief.json"), "utf8");
    return JSON.parse(raw) as Brief;
  } catch {
    return null;
  }
}

/** All creatives in the workboard, newest first. */
export async function listCreatives(): Promise<Brief[]> {
  let entries: string[];
  try {
    const dirents = await readdir(ROOT, { withFileTypes: true });
    entries = dirents.filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    return [];
  }
  const briefs = (await Promise.all(entries.map(readBriefFromDir))).filter(
    (b): b is Brief => b !== null,
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

/** Which formats have a rendered PNG on disk, in canonical order. */
export async function renderedFormats(id: string): Promise<FormatKey[]> {
  const order: FormatKey[] = ["1x1", "4x5", "9x16", "16x9"];
  try {
    const files = await readdir(path.join(ROOT, id));
    const have = new Set(
      files.filter((f) => f.endsWith(".png")).map((f) => f.replace(/\.png$/, "")),
    );
    return order.filter((k) => have.has(k));
  } catch {
    return [];
  }
}
