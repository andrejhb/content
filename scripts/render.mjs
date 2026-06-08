#!/usr/bin/env node
// Renders a creative's templates to pixel-accurate PNGs with Playwright.
// Usage: node scripts/render.mjs <id> [<id> ...]
// For each format it sets the viewport to the exact size, opens the chrome-free
// /render/<id>/<format> route, and screenshots the [data-canvas] element into
// creatives/<id>/<format>.png. Uses a running dev server if one is up, otherwise
// starts one and shuts it down afterwards.

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(process.cwd(), "creatives");
const BASE = process.env.RENDER_BASE_URL || "http://localhost:3000";
const READY_URL = `${BASE}/asset/logos/hububb-symbol.svg`;

const FORMATS = {
  "1x1": { w: 1080, h: 1080 },
  "4x5": { w: 1080, h: 1350 },
  "9x16": { w: 1080, h: 1920 },
  "16x9": { w: 1200, h: 675 },
};

async function isUp() {
  try {
    const r = await fetch(READY_URL, { method: "GET" });
    return r.ok;
  } catch {
    return false;
  }
}

async function waitUntilUp(timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isUp()) return true;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

async function ensureServer() {
  if (await isUp()) return { spawned: false, proc: null };
  console.log("• no dev server detected — starting one…");
  const proc = spawn("npm", ["run", "dev"], {
    cwd: process.cwd(),
    stdio: "ignore",
    env: process.env,
  });
  const ok = await waitUntilUp(90_000);
  if (!ok) {
    proc.kill("SIGTERM");
    throw new Error("dev server did not come up within 90s");
  }
  return { spawned: true, proc };
}

async function renderCreative(browser, id) {
  const brief = JSON.parse(
    await readFile(path.join(ROOT, id, "brief.json"), "utf8"),
  );
  const formats = Array.isArray(brief.formats) && brief.formats.length
    ? brief.formats
    : Object.keys(FORMATS);

  const outDir = path.join(ROOT, id);
  await mkdir(outDir, { recursive: true });

  for (const key of formats) {
    const f = FORMATS[key];
    if (!f) {
      console.warn(`  ! unknown format ${key} — skipping`);
      continue;
    }
    const page = await browser.newPage({ viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1 });
    try {
      await page.goto(`${BASE}/render/${id}/${key}`, {
        waitUntil: "networkidle",
        timeout: 30_000,
      });
      const el = page.locator("[data-canvas]").first();
      await el.waitFor({ state: "visible", timeout: 15_000 });
      await page.evaluate(() => (document.fonts ? document.fonts.ready : null));
      await page
        .waitForFunction(
          () => Array.from(document.images).every((i) => i.complete && i.naturalWidth > 0),
          { timeout: 10_000 },
        )
        .catch(() => {});
      const out = path.join(outDir, `${key}.png`);
      await el.screenshot({ path: out });
      console.log(`  ✓ ${key}  (${f.w}×${f.h})  → creatives/${id}/${key}.png`);
    } finally {
      await page.close();
    }
  }
}

async function main() {
  const ids = process.argv.slice(2);
  if (ids.length === 0) {
    console.error("usage: node scripts/render.mjs <id> [<id> ...]");
    process.exit(2);
  }

  const server = await ensureServer();
  const browser = await chromium.launch();
  try {
    for (const id of ids) {
      console.log(`\nRendering ${id}`);
      await renderCreative(browser, id);
    }
  } finally {
    await browser.close();
    if (server.spawned && server.proc) server.proc.kill("SIGTERM");
  }
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
