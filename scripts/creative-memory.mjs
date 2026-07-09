#!/usr/bin/env node
// Creative memory: derive one queryable record per creative from its brief.json,
// merged non-destructively with any hand-edited performance data. Every run
// rebuilds the derived fields; it preserves the hand-edited published /
// performance / learning fields by matching on id. Atomic write (temp + rename).
// Usage: node scripts/creative-memory.mjs   (or: npm run memory)

import { readFile, writeFile, readdir, rename, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(process.cwd(), "creatives");
const DATA_DIR = path.join(process.cwd(), "data");
const OUT = path.join(DATA_DIR, "creative-memory.json");

async function readBrief(id) {
  try {
    return JSON.parse(await readFile(path.join(ROOT, id, "brief.json"), "utf8"));
  } catch {
    return null;
  }
}

async function loadExisting() {
  const map = new Map();
  try {
    const raw = JSON.parse(await readFile(OUT, "utf8"));
    for (const r of Array.isArray(raw) ? raw : []) if (r && r.id) map.set(r.id, r);
  } catch {
    // no prior file yet
  }
  return map;
}

async function main() {
  let dirs = [];
  try {
    const dirents = await readdir(ROOT, { withFileTypes: true });
    dirs = dirents.filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    dirs = [];
  }

  const prior = await loadExisting();
  const records = [];
  for (const id of dirs) {
    const b = await readBrief(id);
    if (!b) continue;
    const kept = prior.get(b.id ?? id) ?? {};
    records.push({
      id: b.id ?? id,
      product: b.product ?? "host",
      persona: b.persona ?? null,
      template: b.template ?? null,
      kind: b.kind ?? "image",
      formats: Array.isArray(b.formats) ? b.formats : [],
      headline: b.copy?.headline ?? "",
      angle: b.angle ?? "",
      qaPassed: b.qa?.passed ?? null,
      createdAt: b.createdAt ?? "",
      // Hand-edited, preserved across rebuilds:
      published: kept.published ?? false,
      performance: kept.performance ?? null,
      learning: kept.learning ?? "",
    });
  }

  records.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  await mkdir(DATA_DIR, { recursive: true });
  const tmp = OUT + ".tmp";
  await writeFile(tmp, JSON.stringify(records, null, 2) + "\n");
  await rename(tmp, OUT);

  console.log(
    `creative-memory: ${records.length} records -> ${path.relative(process.cwd(), OUT)}`,
  );
}

main();
