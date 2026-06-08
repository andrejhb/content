import { readFile } from "node:fs/promises";
import path from "node:path";

// Serves rendered PNGs from creatives/<id>/<file> (the workboard lives outside
// /public). Used by the detail screen's <img> and download links.
const ROOT = path.join(process.cwd(), "creatives");

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; file: string }> },
) {
  const { id, file } = await params;
  if (
    id.includes("..") ||
    id.includes("/") ||
    file.includes("..") ||
    file.includes("/")
  ) {
    return new Response("Not found", { status: 404 });
  }
  if (path.extname(file).toLowerCase() !== ".png") {
    return new Response("Unsupported media type", { status: 415 });
  }

  const abs = path.join(ROOT, id, file);
  if (!abs.startsWith(ROOT + path.sep)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const data = await readFile(abs);
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": "image/png", "Cache-Control": "no-cache" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
