import { readFile } from "node:fs/promises";
import path from "node:path";

// Serves files from the repo's brand/ folder (which lives outside /public) so
// the brand hub can display logos, graphics, and photos by relative path.
const ROOT = path.join(process.cwd(), "brand");

const TYPES: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await params;
  const abs = path.join(ROOT, ...parts);

  // Block path traversal outside brand/.
  if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) {
    return new Response("Not found", { status: 404 });
  }

  const type = TYPES[path.extname(abs).toLowerCase()];
  if (!type) return new Response("Unsupported media type", { status: 415 });

  try {
    const data = await readFile(abs);
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": type, "Cache-Control": "no-cache" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
