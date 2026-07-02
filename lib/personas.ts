import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { productDir } from "@/lib/products";

// Persona is a fluid sectioned document, one per product at
// products/<slug>/persona.json. Sections are an ordered array; renderers switch
// on `kind` with a generic fallback, so new sections and new kinds need no
// migration. This module is the app's only write path to disk.

export type PersonaSection = {
  key: string;
  title: string;
  /** "text" | "list" | "table" today; unknown kinds render generically. */
  kind: string;
  content?: string | string[];
  // table kind
  columns?: string[];
  rows?: string[][];
};

export type PersonaDoc = {
  version: number;
  product: string;
  updatedAt: string;
  sections: PersonaSection[];
};

function personaPath(slug: string): string | null {
  const dir = productDir(slug);
  return dir ? path.join(dir, "persona.json") : null;
}

export async function getPersona(slug: string): Promise<PersonaDoc | null> {
  const file = personaPath(slug);
  if (!file) return null;
  try {
    return JSON.parse(await readFile(file, "utf8")) as PersonaDoc;
  } catch {
    return null;
  }
}

/** Persist the persona doc, stamping updatedAt. Pretty-printed for readable git diffs. */
export async function savePersona(
  slug: string,
  doc: Omit<PersonaDoc, "updatedAt"> & { updatedAt?: string },
): Promise<PersonaDoc | null> {
  const file = personaPath(slug);
  if (!file) return null;
  const next: PersonaDoc = {
    version: doc.version ?? 1,
    product: slug,
    updatedAt: new Date().toISOString(),
    sections: doc.sections ?? [],
  };
  await writeFile(file, JSON.stringify(next, null, 2) + "\n");
  return next;
}
