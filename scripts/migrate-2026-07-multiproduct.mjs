#!/usr/bin/env node
// One-off migration for the multi-product refactor (July 2026).
// For every brief in creatives/ and creatives-live/:
//   - sets "product": "host" when the field is missing
//   - rewrites image paths /asset/<group>/… → /asset/host/<group>/…
//     (groups that moved into products/host/assets/; shared logos untouched)
// Idempotent: re-running changes nothing. Prints a summary of what changed.

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const BOARDS = ["creatives", "creatives-live"];
const PRODUCT = "host";
const MOVED_GROUPS = ["channels", "mockups", "photos", "screens"];
const IMAGE_RE = new RegExp(`^/asset/(${MOVED_GROUPS.join("|")})/`);

let touched = 0;
let skipped = 0;

for (const board of BOARDS) {
  const root = path.join(process.cwd(), board);
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    continue; // board dir missing — nothing to do
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const briefPath = path.join(root, entry.name, "brief.json");
    let brief;
    try {
      brief = JSON.parse(await readFile(briefPath, "utf8"));
    } catch {
      continue; // no brief.json in this folder
    }

    const changes = [];
    if (!brief.product) {
      brief.product = PRODUCT;
      changes.push(`product → "${PRODUCT}"`);
    }
    if (typeof brief.image === "string" && IMAGE_RE.test(brief.image)) {
      const next = brief.image.replace(IMAGE_RE, `/asset/${PRODUCT}/$1/`);
      changes.push(`image ${brief.image} → ${next}`);
      brief.image = next;
    }

    if (changes.length) {
      await writeFile(briefPath, JSON.stringify(brief, null, 2) + "\n");
      touched += 1;
      console.log(`✓ ${board}/${entry.name}`);
      for (const c of changes) console.log(`    ${c}`);
    } else {
      skipped += 1;
    }
  }
}

console.log(`\n${touched} brief(s) migrated, ${skipped} already current.`);
