import { readFile } from "node:fs/promises";
import path from "node:path";

// The single source of truth for positioning, voice, audience, proof, and
// guardrails. The brand hub is derived from this file — nothing is typed by hand.
const SOURCE = path.join(process.cwd(), ".agents", "product-marketing.md");

export type BrandSection = {
  title: string;
  slug: string;
  body: string;
};

export type BrandDoc = {
  heading: string;
  updated?: string;
  scope?: string;
  sections: BrandSection[];
  byTitle: Record<string, BrandSection>;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

let cached: BrandDoc | null = null;

export async function getBrandDoc(): Promise<BrandDoc> {
  if (cached) return cached;

  const raw = await readFile(SOURCE, "utf8");

  const heading = raw.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? "Brand";
  const updated = raw.match(/\*Last updated:\s*([^*]+)\*/)?.[1]?.trim();
  const scope = raw.match(/\*Scope:\s*([^*]+)\*/)?.[1]?.trim();

  // Split before every level-2 heading; the preamble (before the first "## ")
  // has no match and is skipped.
  const sections: BrandSection[] = [];
  for (const part of raw.split(/\n(?=## )/g)) {
    const m = part.match(/^##\s+(.+)\n?/);
    if (!m) continue;
    const title = m[1].trim();
    const body = part.slice(m[0].length).trim();
    sections.push({ title, slug: slugify(title), body });
  }

  const byTitle = Object.fromEntries(sections.map((s) => [s.title, s]));
  cached = { heading, updated, scope, sections, byTitle };
  return cached;
}

/** Pull a set of sections by title, preserving the requested order, skipping any that are missing. */
export async function getSections(titles: string[]): Promise<BrandSection[]> {
  const { byTitle } = await getBrandDoc();
  return titles.map((t) => byTitle[t]).filter(Boolean);
}
