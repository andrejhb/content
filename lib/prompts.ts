import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

// Framework prompts: starter prompts for generation sessions, one markdown
// file per creative type in prompts/. Files are templates — {product} is
// interpolated to the active product. Edited as files, no UI editor.
const ROOT = path.join(process.cwd(), "prompts");

export type FrameworkPrompt = {
  key: string;
  title: string;
  body: string;
};

export async function listPrompts(): Promise<FrameworkPrompt[]> {
  let files: string[];
  try {
    files = await readdir(ROOT);
  } catch {
    return [];
  }
  const prompts: FrameworkPrompt[] = [];
  for (const f of files.filter((n) => n.endsWith(".md")).sort()) {
    const raw = await readFile(path.join(ROOT, f), "utf8");
    const title = raw.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? f.replace(/\.md$/, "");
    const body = raw.replace(/^#\s+.+\n+/, "").trim();
    prompts.push({ key: f.replace(/\.md$/, ""), title, body });
  }
  return prompts;
}

export function fillPrompt(body: string, product: string): string {
  return body.replaceAll("{product}", product);
}
