import { readFile } from "node:fs/promises";
import path from "node:path";
import { productDir } from "@/lib/products";

// Per-product source of truth for positioning, voice, audience, proof, and
// guardrails: products/<slug>/product-marketing.md. The brand hub is derived
// from this file — nothing is typed by hand.

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

const cached = new Map<string, BrandDoc>();

export async function getBrandDoc(product: string): Promise<BrandDoc | null> {
  const hit = cached.get(product);
  if (hit) return hit;

  const dir = productDir(product);
  if (!dir) return null;

  let raw: string;
  try {
    raw = await readFile(path.join(dir, "product-marketing.md"), "utf8");
  } catch {
    return null;
  }

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
  const doc = { heading, updated, scope, sections, byTitle };
  cached.set(product, doc);
  return doc;
}

/** Pull a set of sections by title, preserving the requested order, skipping any that are missing. */
export async function getSections(
  product: string,
  titles: string[],
): Promise<BrandSection[]> {
  const doc = await getBrandDoc(product);
  if (!doc) return [];
  return titles.map((t) => doc.byTitle[t]).filter(Boolean);
}
