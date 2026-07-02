import { readFile } from "node:fs/promises";
import path from "node:path";
import { isValidSlug } from "@/lib/products";

// Serves source assets (which live outside /public) by served path:
//   /asset/shared/<group>/<file>  → assets/shared/<group>/<file>   (parent brand)
//   /asset/<slug>/<group>/<file>  → products/<slug>/assets/<group>/<file>
const SHARED_ROOT = path.join(process.cwd(), "assets", "shared");

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
  const [scope, ...rest] = parts;
  if (!scope || rest.length === 0) return new Response("Not found", { status: 404 });

  let root: string;
  if (scope === "shared") {
    root = SHARED_ROOT;
  } else if (isValidSlug(scope)) {
    root = path.join(process.cwd(), "products", scope, "assets");
  } else {
    return new Response("Not found", { status: 404 });
  }

  // Block path traversal outside the resolved root.
  const abs = path.join(root, ...rest);
  if (abs !== root && !abs.startsWith(root + path.sep)) {
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
