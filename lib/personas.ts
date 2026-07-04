import { readdir, readFile, writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { productDir } from "@/lib/products";

// Personas are fluid sectioned documents living one-per-file under
// products/<slug>/personas/<id>.json. Each doc carries a `profile` (the human:
// name, headline, avatar, facts) plus an ordered `sections[]` body; renderers
// switch on section `kind` with a generic fallback, so new sections and kinds
// need no migration. Discovery is readdir — adding a persona is adding a file.
//
// Back-compat: products predating this layout keep a single
// products/<slug>/persona.json. When no personas/ folder exists we read that
// legacy file as one "default" persona so nothing breaks mid-migration.
//
// This module is the app's only write path to disk.

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

export type PersonaFact = { label: string; value: string };

/** A ready-to-run hububb-creative starter prompt, generated from the persona's data. */
export type PersonaPrompt = { title: string; body: string };

export type PersonaProfile = {
  name: string;
  headline?: string;
  location?: string;
  bio?: string;
  /** Served /asset path (e.g. /asset/host/personas/marcus.png), or null for a monogram. */
  avatar?: string | null;
  /** Served /asset path for the cover band, or null for a gradient fallback. */
  cover?: string | null;
  archetype?: string;
  facts?: PersonaFact[];
};

export type PersonaDoc = {
  version: number;
  id: string;
  product: string;
  updatedAt: string;
  profile?: PersonaProfile;
  sections: PersonaSection[];
  /** Starter prompts generated from this persona's data by the persona-prompts skill. */
  prompts?: PersonaPrompt[];
  /** When prompts were last generated (ISO). Stale when updatedAt is newer. */
  promptsUpdatedAt?: string;
};

/** Lightweight shape for the switcher — avoids shipping full sections to the tab row. */
export type PersonaSummary = {
  id: string;
  name: string;
  headline?: string;
  location?: string;
  avatar?: string | null;
  archetype?: string;
};

const LEGACY_ID = "default";

function personasDir(slug: string): string | null {
  const dir = productDir(slug);
  return dir ? path.join(dir, "personas") : null;
}

function legacyPath(slug: string): string | null {
  const dir = productDir(slug);
  return dir ? path.join(dir, "persona.json") : null;
}

/** Persona ids become filenames — guard traversal exactly like isValidSlug. */
export function isValidPersonaId(id: string): boolean {
  return /^[a-z0-9][a-z0-9-]*$/.test(id);
}

function slugifyKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toSummary(doc: PersonaDoc): PersonaSummary {
  const p = doc.profile;
  return {
    id: doc.id,
    name: p?.name ?? doc.id,
    headline: p?.headline,
    location: p?.location,
    avatar: p?.avatar ?? null,
    archetype: p?.archetype,
  };
}

/** Read every persona doc for a product (folder first, legacy file as fallback). */
export async function getPersonas(slug: string): Promise<PersonaDoc[]> {
  const dir = personasDir(slug);
  if (!dir) return [];

  let names: string[] | null = null;
  try {
    names = (await readdir(dir)).filter((n) => n.endsWith(".json")).sort();
  } catch {
    names = null; // folder missing — fall back to legacy below
  }

  if (names && names.length > 0) {
    const docs: PersonaDoc[] = [];
    for (const name of names) {
      try {
        const doc = JSON.parse(
          await readFile(path.join(dir, name), "utf8"),
        ) as PersonaDoc;
        // Trust the on-disk id, but default it from the filename if absent.
        doc.id = doc.id || name.replace(/\.json$/, "");
        docs.push(doc);
      } catch {
        // skip unreadable/malformed files rather than 500 the page
      }
    }
    return docs;
  }

  const legacy = await readLegacy(slug);
  return legacy ? [legacy] : [];
}

async function readLegacy(slug: string): Promise<PersonaDoc | null> {
  const file = legacyPath(slug);
  if (!file) return null;
  try {
    const raw = JSON.parse(await readFile(file, "utf8")) as Partial<PersonaDoc>;
    return {
      version: raw.version ?? 1,
      id: LEGACY_ID,
      product: slug,
      updatedAt: raw.updatedAt ?? new Date(0).toISOString(),
      profile: raw.profile,
      sections: raw.sections ?? [],
    };
  } catch {
    return null;
  }
}

/** Persona summaries for the switcher. */
export async function listPersonas(slug: string): Promise<PersonaSummary[]> {
  return (await getPersonas(slug)).map(toSummary);
}

/** One persona by id (folder first, legacy file when id === "default"). */
export async function getPersona(
  slug: string,
  id: string,
): Promise<PersonaDoc | null> {
  const dir = personasDir(slug);
  if (!dir || !isValidPersonaId(id)) return null;
  try {
    const doc = JSON.parse(
      await readFile(path.join(dir, `${id}.json`), "utf8"),
    ) as PersonaDoc;
    doc.id = doc.id || id;
    return doc;
  } catch {
    // no folder file — try the legacy single-persona document
    if (id === LEGACY_ID) return readLegacy(slug);
    return null;
  }
}

/** Persist one persona, stamping updatedAt. Pretty-printed for readable git diffs. */
export async function savePersona(
  slug: string,
  id: string,
  doc: Omit<PersonaDoc, "updatedAt" | "product" | "id"> & {
    updatedAt?: string;
  },
): Promise<PersonaDoc | null> {
  const dir = personasDir(slug);
  if (!dir || !isValidPersonaId(id)) return null;
  const next: PersonaDoc = {
    version: doc.version ?? 2,
    id,
    product: slug,
    updatedAt: new Date().toISOString(),
    profile: doc.profile,
    sections: doc.sections ?? [],
    // Pass-through: prompts are skill-generated; callers round-trip them so an
    // inline profile/section edit never clobbers them. Undefined stays out of JSON.
    prompts: doc.prompts,
    promptsUpdatedAt: doc.promptsUpdatedAt,
  };
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${id}.json`), JSON.stringify(next, null, 2) + "\n");
  return next;
}

/** Create a persona from a name — slugifies to a unique id and seeds empty core sections. */
export async function createPersona(
  slug: string,
  input: { name: string; headline?: string },
): Promise<PersonaDoc | null> {
  const dir = personasDir(slug);
  if (!dir) return null;
  const name = input.name.trim();
  if (!name) return null;

  const base = slugifyKey(name) || "persona";
  const existing = new Set((await getPersonas(slug)).map((d) => d.id));
  let id = base;
  let n = 2;
  while (existing.has(id) || !isValidPersonaId(id)) {
    id = `${base}-${n++}`;
  }

  return savePersona(slug, id, {
    version: 2,
    profile: {
      name,
      headline: input.headline?.trim() || undefined,
      avatar: null,
      cover: null,
      facts: [],
    },
    sections: [
      { key: "jtbd", title: "Jobs to be done", kind: "list", content: [] },
      { key: "pains", title: "Pains", kind: "list", content: [] },
      { key: "lifestyle", title: "Lifestyle", kind: "text", content: "" },
    ],
  });
}

/** Delete personas/<id>.json. Returns false if the id is invalid or the file is missing. */
export async function deletePersona(slug: string, id: string): Promise<boolean> {
  const dir = personasDir(slug);
  if (!dir || !isValidPersonaId(id)) return false;
  try {
    await unlink(path.join(dir, `${id}.json`));
    return true;
  } catch {
    return false;
  }
}
