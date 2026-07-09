import { getProduct } from "@/lib/products";
import { saveProductAsset } from "@/lib/assets";

// Local drop-to-upload for the Create wizard: copies dropped images/videos into
// products/<slug>/assets/<group>/ and returns their served /asset paths. This is
// the app's only asset write path (see lib/assets.ts saveProductAsset).
export const dynamic = "force-dynamic";

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB per file
const VIDEO_EXT = /\.(mp4|webm|mov)$/i;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!(await getProduct(slug)))
    return Response.json({ error: "Unknown product" }, { status: 404 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json(
      { error: "Expected multipart form data" },
      { status: 400 },
    );
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0)
    return Response.json({ error: "No files provided" }, { status: 400 });
  const groupField =
    typeof form.get("group") === "string" ? String(form.get("group")) : "";

  const saved: {
    name: string;
    group: string;
    kind: "image" | "video";
    path: string;
  }[] = [];

  for (const file of files) {
    if (file.size > MAX_BYTES)
      return Response.json(
        { error: `${file.name} is over the 50 MB limit` },
        { status: 413 },
      );
    const isVideo =
      VIDEO_EXT.test(file.name) || file.type.startsWith("video/");
    const group = groupField || (isVideo ? "videos" : "photos");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const servedPath = await saveProductAsset(slug, group, file.name, bytes);
    if (!servedPath)
      return Response.json(
        { error: `Could not save ${file.name}` },
        { status: 400 },
      );
    saved.push({
      name: servedPath.split("/").pop() ?? file.name,
      group,
      kind: isVideo ? "video" : "image",
      path: servedPath,
    });
  }

  return Response.json({ files: saved }, { status: 201 });
}
