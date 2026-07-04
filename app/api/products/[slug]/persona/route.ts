import { listPersonas, createPersona } from "@/lib/personas";
import { getProduct } from "@/lib/products";

// GET the product's persona roster; POST creates a new persona. Per-persona
// reads/writes live under [id]/route.ts. Writes go through lib/personas.ts,
// the app's only filesystem write path.

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!(await getProduct(slug))) {
    return Response.json({ error: "Unknown product" }, { status: 404 });
  }
  return Response.json({ personas: await listPersonas(slug) });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!(await getProduct(slug))) {
    return Response.json({ error: "Unknown product" }, { status: 404 });
  }

  let body: { name?: unknown; headline?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.name !== "string" || !body.name.trim()) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }

  const created = await createPersona(slug, {
    name: body.name,
    headline: typeof body.headline === "string" ? body.headline : undefined,
  });
  if (!created) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(created, { status: 201 });
}
