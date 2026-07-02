import { getPersona, savePersona, type PersonaSection } from "@/lib/personas";
import { getProduct } from "@/lib/products";

// GET/PUT the product's persona document. The PUT path is the app's only
// filesystem write; lib/personas.ts stamps updatedAt and pretty-prints so
// git diffs stay readable.

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const persona = await getPersona(slug);
  if (!persona) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(persona);
}

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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!(await getProduct(slug))) {
    return Response.json({ error: "Unknown product" }, { status: 404 });
  }

  let body: { version?: number; sections?: unknown[] };
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

  const saved = await savePersona(slug, {
    version: body.version ?? 1,
    product: slug,
    sections: body.sections,
  });
  if (!saved) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(saved);
}
