import { readdir, access } from "node:fs/promises";
import path from "node:path";

// Products are folders: products/<slug>/ holding product-marketing.md (required),
// persona.json, qa.json, and assets/. Discovery is readdir — adding a product is
// adding a folder, no registration anywhere.
const ROOT = path.join(process.cwd(), "products");

// "shared" is reserved: /asset/shared/* serves parent-brand files from assets/shared/.
const RESERVED = new Set(["shared"]);

export type Product = {
  slug: string;
  name: string;
};

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]*$/.test(slug) && !RESERVED.has(slug);
}

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** All products, alphabetical by slug. A folder counts once it has a product-marketing.md. */
export async function listProducts(): Promise<Product[]> {
  let dirents;
  try {
    dirents = await readdir(ROOT, { withFileTypes: true });
  } catch {
    return [];
  }
  const products: Product[] = [];
  for (const d of dirents) {
    if (!d.isDirectory() || !isValidSlug(d.name)) continue;
    try {
      await access(path.join(ROOT, d.name, "product-marketing.md"));
      products.push({ slug: d.name, name: titleCase(d.name) });
    } catch {
      // no product-marketing.md — not a product yet
    }
  }
  return products.sort((a, b) => a.slug.localeCompare(b.slug));
}

export async function getProduct(slug: string): Promise<Product | null> {
  if (!isValidSlug(slug)) return null;
  try {
    await access(path.join(ROOT, slug, "product-marketing.md"));
    return { slug, name: titleCase(slug) };
  } catch {
    return null;
  }
}

/** Absolute path to a product's folder. Null for invalid slugs (traversal guard). */
export function productDir(slug: string): string | null {
  if (!isValidSlug(slug)) return null;
  return path.join(ROOT, slug);
}
