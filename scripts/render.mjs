#!/usr/bin/env node
// Renders a creative's templates to pixel-accurate PNGs with Playwright.
// Usage: node scripts/render.mjs <id> [<id> ...]
// For each format it sets the viewport to the exact size, opens the chrome-free
// /render/<id>/<format> route, and screenshots the [data-canvas] element into
// creatives/<id>/<format>.png. Uses a running dev server if one is up, otherwise
// starts one and shuts it down afterwards.

import { chromium } from "playwright";
import sharp from "sharp";
import { spawn } from "node:child_process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import net from "node:net";
import path from "node:path";

const ROOT = path.join(process.cwd(), "creatives");
let BASE = process.env.RENDER_BASE_URL || "http://localhost:3000";
const readyUrl = () => `${BASE}/asset/shared/logos/hububb-symbol.svg`;

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

async function isUp() {
  try {
    // The ready probe must be OUR app: if another project squats the port, this
    // path 404s there and we start our own server instead of rendering into it.
    const r = await fetch(readyUrl(), { method: "GET" });
    return r.ok;
  } catch {
    return false;
  }
}

function portIsFree(p) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once("error", () => resolve(false));
    srv.listen(p, () => srv.close(() => resolve(true)));
  });
}

async function freePort(start = 3100) {
  for (let p = start; p < start + 20; p++) {
    if (await portIsFree(p)) return p;
  }
  throw new Error("no free port between 3100 and 3119");
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
  // Spawn on an explicit free port: relying on the default 3000 breaks when
  // another app owns it (Next would silently move to 3001 while we poll 3000).
  let port;
  if (process.env.RENDER_BASE_URL) {
    port = Number(new URL(BASE).port) || 3000;
    if (!(await portIsFree(port))) {
      throw new Error(
        `nothing serving the app at ${BASE}, and its port ${port} is taken by another process`,
      );
    }
  } else {
    port = await freePort();
    BASE = `http://localhost:${port}`;
  }
  console.log(`• no dev server detected — starting one on :${port}…`);
  // detached so the child gets its own process group — lets us kill the whole
  // tree (npm + next-server) on cleanup instead of orphaning the server.
  const proc = spawn("npm", ["run", "dev", "--", "--port", String(port)], {
    cwd: process.cwd(),
    stdio: "ignore",
    env: process.env,
    detached: true,
  });
  const ok = await waitUntilUp(90_000);
  if (!ok) {
    stopServer(proc);
    throw new Error("dev server did not come up within 90s");
  }
  return { spawned: true, proc };
}

function stopServer(proc) {
  if (!proc) return;
  try {
    process.kill(-proc.pid, "SIGTERM"); // kill the whole process group
  } catch {
    try {
      proc.kill("SIGTERM");
    } catch {}
  }
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

  const server = await ensureServer();
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
