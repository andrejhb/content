import { readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { productDir } from "@/lib/products";

// Source assets live inside each product folder (products/<slug>/assets/<group>/)
// plus a parent-brand pool at assets/shared/. Files are served by the
// /asset/<slug|shared>/... route. This module lists what exists and, via
// saveProductAsset, is the ONE place the app writes an asset to disk (the Create
// wizard's drop-to-upload): the second app write path after lib/personas.ts,
// kept inside the seam, path-guarded, local-tool intent.

const SHARED_ROOT = path.join(process.cwd(), "assets", "shared");

const MEDIA = /\.(svg|png|jpe?g|webp|avif|gif|mp4|webm|mov)$/i;
const GROUP_RE = /^[a-z0-9][a-z0-9-]*$/;

export type AssetGroup = {
  key: string;
  files: string[];
};

async function listMedia(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir);
    return entries.filter((f) => MEDIA.test(f)).sort();
  } catch {
    return [];
  }
}

/** Asset groups for one product: every subfolder of products/<slug>/assets/. */
export async function listProductAssets(slug: string): Promise<AssetGroup[]> {
  const root = productDir(slug);
  if (!root) return [];
  const assetsRoot = path.join(root, "assets");
  let dirents;
  try {
    dirents = await readdir(assetsRoot, { withFileTypes: true });
  } catch {
    return [];
  }
  const groups = await Promise.all(
    dirents
      .filter((d) => d.isDirectory())
      .map(async (d) => ({
        key: d.name,
        files: await listMedia(path.join(assetsRoot, d.name)),
      })),
  );
  return groups.sort((a, b) => a.key.localeCompare(b.key));
}

// Normalise an uploaded filename to a safe, lowercase basename + kept extension.
function sanitizeName(name: string): string {
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot).toLowerCase() : "";
  const base =
    (dot > 0 ? name.slice(0, dot) : name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "asset";
  return base + ext;
}

/**
 * Write an uploaded asset into products/<slug>/assets/<group>/, returning the
 * served /asset path (or null if the slug/group/type is invalid). Guards the
 * slug via productDir, validates the group name, sanitizes the filename, and
 * de-dupes with a -N suffix. Local-dev only; the sole asset write path.
 */
export async function saveProductAsset(
  slug: string,
  group: string,
  filename: string,
  bytes: Uint8Array,
): Promise<string | null> {
  const root = productDir(slug);
  if (!root || !GROUP_RE.test(group)) return null;
  const clean = sanitizeName(filename);
  if (!MEDIA.test(clean)) return null;

  const dir = path.join(root, "assets", group);
  await mkdir(dir, { recursive: true });

  let existing: string[] = [];
  try {
    existing = await readdir(dir);
  } catch {
    /* fresh group */
  }
  let finalName = clean;
  if (existing.includes(finalName)) {
    const dot = clean.lastIndexOf(".");
    const base = clean.slice(0, dot);
    const ext = clean.slice(dot);
    let n = 2;
    while (existing.includes(`${base}-${n}${ext}`)) n++;
    finalName = `${base}-${n}${ext}`;
  }

  await writeFile(path.join(dir, finalName), bytes);
  return `/asset/${slug}/${group}/${finalName}`;
}

/** Parent-brand asset groups from assets/shared/ (logos, and whatever gets added). */
export async function listSharedAssets(): Promise<AssetGroup[]> {
  let dirents;
  try {
    dirents = await readdir(SHARED_ROOT, { withFileTypes: true });
  } catch {
    return [];
  }
  const groups = await Promise.all(
    dirents
      .filter((d) => d.isDirectory())
      .map(async (d) => ({
        key: d.name,
        files: await listMedia(path.join(SHARED_ROOT, d.name)),
      })),
  );
  return groups.sort((a, b) => a.key.localeCompare(b.key));
}
