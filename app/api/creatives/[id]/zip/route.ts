import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";

const ROOT = path.join(process.cwd(), "creatives");

// Bundles every PNG for a creative into a zip for the download-all button.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (id.includes("..") || id.includes("/")) {
    return new Response("Not found", { status: 404 });
  }

  const dir = path.join(ROOT, id);
  let files: string[];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".png")).sort();
  } catch {
    return new Response("Not found", { status: 404 });
  }
  if (files.length === 0) {
    return new Response("No PNGs yet", { status: 404 });
  }

  const zip = new JSZip();
  for (const f of files) {
    zip.file(f, await readFile(path.join(dir, f)));
  }
  const buf = await zip.generateAsync({ type: "nodebuffer" });

  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${id}.zip"`,
      "Cache-Control": "no-cache",
    },
  });
}
