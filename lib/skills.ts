import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export type Skill = {
  name: string;
  description: string;
  source: string; // which directory it came from
  custom: boolean; // the bespoke hububb-creative skill
};

// Skills live in two project locations: .agents/skills (the universal store the
// `skills` CLI installs into) and .claude/skills (where the custom skill goes).
const DIRS = [
  { rel: ".claude/skills", label: ".claude/skills" },
  { rel: ".agents/skills", label: ".agents/skills" },
];

function parseFrontmatter(md: string): { name?: string; description?: string } {
  const m = md.match(/^---\s*([\s\S]*?)\s*---/);
  if (!m) return {};
  const fm = m[1];
  const name = fm.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  // description may be a long single line; take up to the next top-level key.
  const desc = fm
    .match(/^description:\s*([\s\S]*?)(?:\n[a-zA-Z_]+:|\n*$)/m)?.[1]
    ?.replace(/\s+/g, " ")
    .trim();
  return { name, description: desc };
}

export async function listSkills(): Promise<Skill[]> {
  const seen = new Set<string>();
  const out: Skill[] = [];

  for (const { rel, label } of DIRS) {
    const base = path.join(process.cwd(), rel);
    let names: string[];
    try {
      const dirents = await readdir(base, { withFileTypes: true });
      names = dirents
        .filter((d) => d.isDirectory() || d.isSymbolicLink())
        .map((d) => d.name);
    } catch {
      continue;
    }
    for (const name of names) {
      try {
        const md = await readFile(path.join(base, name, "SKILL.md"), "utf8");
        const fm = parseFrontmatter(md);
        const key = fm.name ?? name;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({
          name: key,
          description: fm.description ?? "",
          source: label,
          custom: key === "hububb-creative",
        });
      } catch {
        // no SKILL.md — skip
      }
    }
  }

  // Custom skill first, then alphabetical.
  return out.sort((a, b) => {
    if (a.custom !== b.custom) return a.custom ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}
