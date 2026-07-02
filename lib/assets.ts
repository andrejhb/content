import { readdir } from "node:fs/promises";
import path from "node:path";
import { productDir } from "@/lib/products";

// Source assets live inside each product folder (products/<slug>/assets/<group>/)
// plus a parent-brand pool at assets/shared/. Files are served by the
// /asset/<slug|shared>/... route; this module only lists what exists.

const SHARED_ROOT = path.join(process.cwd(), "assets", "shared");

const IMG = /\.(svg|png|jpe?g|webp|avif|gif)$/i;

export type AssetGroup = {
  key: string;
  files: string[];
};

async function listImages(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir);
    return entries.filter((f) => IMG.test(f)).sort();
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
        files: await listImages(path.join(assetsRoot, d.name)),
      })),
  );
  return groups.sort((a, b) => a.key.localeCompare(b.key));
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
        files: await listImages(path.join(SHARED_ROOT, d.name)),
      })),
  );
  return groups.sort((a, b) => a.key.localeCompare(b.key));
}
