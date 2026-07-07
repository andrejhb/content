#!/usr/bin/env node
// Renders a video creative's Remotion composition to mp4 per format, plus a
// PNG poster for thumbnails. Usage: node scripts/render-video.mjs <id> [<id> ...]
// The brief must have kind: "video" and video.track: "remotion". Assets are
// fetched from the dev server (started on a free port if none serves this app).

import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind-v4";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ensureServer, stopServer } from "./server-util.mjs";

const ROOT = path.join(process.cwd(), "creatives");
const CONFIG = path.join(process.cwd(), "config", "video.json");

async function videoDefaults() {
  try {
    const cfg = JSON.parse(await readFile(CONFIG, "utf8"));
    return { fps: 30, defaultDurationSec: 8, ...cfg.remotion };
  } catch {
    return { fps: 30, defaultDurationSec: 8 };
  }
}

async function renderVideoCreative({ id, serveUrl, base, defaults }) {
  const brief = JSON.parse(await readFile(path.join(ROOT, id, "brief.json"), "utf8"));

  if (brief.kind !== "video" || brief.video?.track !== "remotion") {
    console.warn(`  ! ${id} is not a remotion video creative (kind: ${brief.kind ?? "image"}, track: ${brief.video?.track ?? "none"}) — skipping`);
    return false;
  }
  if (!brief.video.composition) {
    console.warn(`  ! ${id} has no video.composition — skipping`);
    return false;
  }

  const briefFormats = Array.isArray(brief.formats) && brief.formats.length
    ? brief.formats
    : ["1x1", "4x5", "9x16", "16x9"];
  // RENDER_FORMATS=1x1,9x16 restricts which formats get rendered this run.
  const only = (process.env.RENDER_FORMATS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const formats = only.length
    ? briefFormats.filter((f) => only.includes(f))
    : briefFormats;

  // A carousel: render each slide (its own composition + copy + media) to
  // s<n>-<format>.mp4. Otherwise render the single composition to <format>.mp4.
  const slides = Array.isArray(brief.slides) && brief.slides.length ? brief.slides : null;

  async function renderOne({ composition: compId, briefProps, prefix, durationSec }) {
    for (const format of formats) {
      const inputProps = {
        brief: briefProps,
        format,
        baseUrl: base,
        durationSec: durationSec ?? brief.video.durationSec ?? defaults.defaultDurationSec,
        fps: brief.video.fps ?? defaults.fps,
      };
      const composition = await selectComposition({ serveUrl, id: compId, inputProps });
      const out = path.join(ROOT, id, `${prefix}${format}.mp4`);
      await renderMedia({ composition, serveUrl, codec: "h264", outputLocation: out, inputProps });
      const noPoster = process.env.RENDER_NO_POSTER === "1";
      if (!noPoster) {
        await renderStill({
          composition,
          serveUrl,
          output: path.join(ROOT, id, `${prefix}${format}.png`),
          frame: Math.max(0, Math.floor(composition.durationInFrames * 0.85)),
          inputProps,
        });
      }
      console.log(`  ✓ ${prefix}${format}  (${composition.width}×${composition.height}, ${inputProps.durationSec}s)  → creatives/${id}/${prefix}${format}.mp4${noPoster ? "" : " (+poster)"}`);
    }
  }

  if (slides) {
    for (let i = 0; i < slides.length; i++) {
      const s = slides[i];
      const briefProps = {
        ...brief,
        copy: s.copy ?? brief.copy,
        image: s.image ?? brief.image ?? null,
        variant: s.variant ?? brief.variant,
      };
      console.log(`  slide ${i + 1}: ${s.label}`);
      await renderOne({ composition: s.composition, briefProps, prefix: `s${i + 1}-`, durationSec: s.durationSec });
    }
    return true;
  }

  await renderOne({ composition: brief.video.composition, briefProps: brief, prefix: "" });
  return true;
}

async function main() {
  const ids = process.argv.slice(2);
  if (ids.length === 0) {
    console.error("usage: node scripts/render-video.mjs <id> [<id> ...]");
    process.exit(2);
  }

  const defaults = await videoDefaults();
  const server = await ensureServer(process.env.RENDER_BASE_URL);

  console.log("• bundling remotion project…");
  const serveUrl = await bundle({
    entryPoint: path.join(process.cwd(), "remotion", "index.ts"),
    webpackOverride: enableTailwind,
  });

  let ok = true;
  try {
    for (const id of ids) {
      console.log(`\nRendering video ${id}`);
      const done = await renderVideoCreative({ id, serveUrl, base: server.base, defaults });
      ok = ok && done;
    }
  } finally {
    if (server.spawned) stopServer(server.proc);
  }
  console.log("\nDone.");
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
