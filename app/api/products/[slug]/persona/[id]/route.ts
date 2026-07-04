import {
  getPersona,
  savePersona,
  deletePersona,
  type PersonaSection,
  type PersonaProfile,
  type PersonaPrompt,
} from "@/lib/personas";
import { getProduct } from "@/lib/products";

// GET/PUT/DELETE a single persona document. The PUT/DELETE paths are part of
// the app's only filesystem write seam; lib/personas.ts stamps updatedAt and
// pretty-prints so git diffs stay readable.

function isSection(s: unknown): s is PersonaSection {
  if (typeof s !== "object" || s === null) return false;
  const sec = s as Record<string, unknown>;
  return (
    typeof sec.key === "string" &&
    sec.key.length > 0 &&
    typeof sec.title === "string" &&
    typeof sec.kind === "string"
  );
}

function isProfile(p: unknown): p is PersonaProfile {
  if (typeof p !== "object" || p === null) return false;
  const prof = p as Record<string, unknown>;
  if (typeof prof.name !== "string" || !prof.name.trim()) return false;
  if (prof.facts !== undefined) {
    if (!Array.isArray(prof.facts)) return false;
    if (
      !prof.facts.every(
        (f) =>
          typeof f === "object" &&
          f !== null &&
          typeof (f as Record<string, unknown>).label === "string" &&
          typeof (f as Record<string, unknown>).value === "string",
      )
    ) {
      return false;
    }
  }
  return true;
}

function isPrompt(p: unknown): p is PersonaPrompt {
  if (typeof p !== "object" || p === null) return false;
  const pr = p as Record<string, unknown>;
  return typeof pr.title === "string" && typeof pr.body === "string";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;
  const persona = await getPersona(slug, id);
  if (!persona) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(persona);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;
  if (!(await getProduct(slug))) {
    return Response.json({ error: "Unknown product" }, { status: 404 });
  }

  let body: {
    version?: number;
    profile?: unknown;
    sections?: unknown[];
    prompts?: unknown[];
    promptsUpdatedAt?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!Array.isArray(body.sections) || !body.sections.every(isSection)) {
    return Response.json(
      { error: "sections must be an array of {key, title, kind, …}" },
      { status: 400 },
    );
  }
  if (body.profile !== undefined && !isProfile(body.profile)) {
    return Response.json(
      { error: "profile must have a non-empty name and valid facts" },
      { status: 400 },
    );
  }
  if (
    body.prompts !== undefined &&
    (!Array.isArray(body.prompts) || !body.prompts.every(isPrompt))
  ) {
    return Response.json(
      { error: "prompts must be an array of {title, body}" },
      { status: 400 },
    );
  }

  const saved = await savePersona(slug, id, {
    version: body.version ?? 2,
    profile: body.profile,
    sections: body.sections,
    prompts: body.prompts as PersonaPrompt[] | undefined,
    promptsUpdatedAt:
      typeof body.promptsUpdatedAt === "string"
        ? body.promptsUpdatedAt
        : undefined,
  });
  if (!saved) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(saved);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;
  if (!(await getProduct(slug))) {
    return Response.json({ error: "Unknown product" }, { status: 404 });
  }
  const ok = await deletePersona(slug, id);
  if (!ok) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ ok: true });
}
