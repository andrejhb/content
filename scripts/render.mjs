#!/usr/bin/env node
// Renders a creative's templates to pixel-accurate PNGs with Playwright.
// Usage: node scripts/render.mjs <id> [<id> ...]
// For each format it sets the viewport to the exact size, opens the chrome-free
// /render/<id>/<format> route, and screenshots the [data-canvas] element into
// creatives/<id>/<format>.png. Uses a running dev server if one is up, otherwise
// starts one and shuts it down afterwards.

import { chromium } from "playwright";
import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { ensureServer, stopServer } from "./server-util.mjs";

const ROOT = path.join(process.cwd(), "creatives");
let BASE = process.env.RENDER_BASE_URL || "http://localhost:3000";

// Supersample: render at SCALE× device pixels for crisp text/edges, then
// downscale back to the exact format size with a high-quality Lanczos filter.
// RENDER_SCALE controls the factor; RENDER_DOWNSCALE=0 keeps the larger master.
const SCALE = Math.max(1, Math.min(4, Number(process.env.RENDER_SCALE) || 3));
const DOWNSCALE = process.env.RENDER_DOWNSCALE !== "0";

const FORMATS = {
  "1x1": { w: 1080, h: 1080 },
  "4x5": { w: 1080, h: 1350 },
  "9x16": { w: 1080, h: 1920 },
  "16x9": { w: 1200, h: 675 },
};

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
    const page = await browser.newPage({ viewport: { width: f.w, height: f.h }, deviceScaleFactor: SCALE });
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
      const shot = await el.screenshot({ type: "png" });
      if (DOWNSCALE && SCALE > 1) {
        // Downscale the supersampled capture to the exact format size.
        await sharp(shot)
          .resize(f.w, f.h, { kernel: "lanczos3" })
          .png({ compressionLevel: 9 })
          .toFile(out);
      } else {
        await writeFile(out, shot);
      }
      const dims = DOWNSCALE ? `${f.w}×${f.h}` : `${f.w * SCALE}×${f.h * SCALE}`;
      console.log(`  ✓ ${key}  (${dims}${SCALE > 1 ? `, ${SCALE}x supersampled` : ""})  → creatives/${id}/${key}.png`);
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

  const server = await ensureServer(process.env.RENDER_BASE_URL);
  BASE = server.base;
  const browser = await chromium.launch();
  try {
    for (const id of ids) {
      console.log(`\nRendering ${id}`);
      await renderCreative(browser, id);
    }
  } finally {
    await browser.close();
    if (server.spawned) stopServer(server.proc);
  }
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
