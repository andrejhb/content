#!/usr/bin/env node
// Report on the creative library: per product, counts by template / persona /
// angle, QA pass rate, and pillar / funnel tag counts grepped from the brief
// prose (the strategy tags live in the brief text field, not the schema).
// Usage: node scripts/creative-memory-report.mjs   (or: npm run memory:report)

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(process.cwd(), "creatives");

async function readBrief(id) {
  try {
    return JSON.parse(await readFile(path.join(ROOT, id, "brief.json"), "utf8"));
  } catch {
    return null;
  }
}

function tally(map, key) {
  const k = key == null || key === "" ? "(none)" : key;
  map.set(k, (map.get(k) ?? 0) + 1);
}

function printTally(label, map) {
  console.log(`  ${label}:`);
  for (const [k, n] of [...map.entries()].sort((a, b) => b[1] - a[1]))
    console.log(`    ${String(n).padStart(3)}  ${k}`);
}

async function main() {
  let dirs = [];
  try {
    const dirents = await readdir(ROOT, { withFileTypes: true });
    dirs = dirents.filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    dirs = [];
  }

  const byProduct = new Map();
  for (const id of dirs) {
    const b = await readBrief(id);
    if (!b) continue;
    const prod = b.product ?? "host";
    if (!byProduct.has(prod))
      byProduct.set(prod, {
        total: 0,
        qaPass: 0,
        qaRun: 0,
        templates: new Map(),
        personas: new Map(),
        angles: new Map(),
        pillars: new Map(),
        funnels: new Map(),
      });
    const p = byProduct.get(prod);
    p.total++;
    tally(p.templates, b.template);
    tally(p.personas, b.persona);
    tally(p.angles, b.angle);
    if (b.qa && typeof b.qa.passed === "boolean") {
      p.qaRun++;
      if (b.qa.passed) p.qaPass++;
    }
    const prose = typeof b.brief === "string" ? b.brief : "";
    const pillar = prose.match(/pillar:\s*([a-z0-9-]+)/i);
    if (pillar) tally(p.pillars, pillar[1].toLowerCase());
    const funnel = prose.match(/funnel:\s*([a-z0-9-]+)/i);
    if (funnel) tally(p.funnels, funnel[1].toLowerCase());
  }

  const products = [...byProduct.keys()].sort();
  if (products.length === 0) {
    console.log("no creatives found");
    return;
  }
  for (const prod of products) {
    const p = byProduct.get(prod);
    const rate = p.qaRun ? Math.round((p.qaPass / p.qaRun) * 100) : 0;
    console.log(
      `\n=== ${prod}  (${p.total} creatives, QA ${p.qaPass}/${p.qaRun} = ${rate}%) ===`,
    );
    printTally("templates", p.templates);
    printTally("personas", p.personas);
    printTally("angles", p.angles);
    if (p.pillars.size) printTally("pillars (from brief prose)", p.pillars);
    if (p.funnels.size) printTally("funnel stages (from brief prose)", p.funnels);
  }
  console.log("");
}

main();
