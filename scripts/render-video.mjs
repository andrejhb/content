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

  for (const format of formats) {
    const inputProps = {
      brief,
      format,
      baseUrl: base,
      durationSec: brief.video.durationSec ?? defaults.defaultDurationSec,
      fps: brief.video.fps ?? defaults.fps,
    };

    const composition = await selectComposition({
      serveUrl,
      id: brief.video.composition,
      inputProps,
    });

    const out = path.join(ROOT, id, `${format}.mp4`);
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation: out,
      inputProps,
    });

    // Poster: a settled frame near the end, used as the hallway thumbnail.
    // RENDER_NO_POSTER=1 keeps an existing static PNG (e.g. a prior image render)
    // as the poster instead of overwriting it with a video frame.
    const noPoster = process.env.RENDER_NO_POSTER === "1";
    if (!noPoster) {
      const poster = path.join(ROOT, id, `${format}.png`);
      await renderStill({
        composition,
        serveUrl,
        output: poster,
        frame: Math.max(0, Math.floor(composition.durationInFrames * 0.85)),
        inputProps,
      });
    }

    console.log(`  ✓ ${format}  (${composition.width}×${composition.height}, ${inputProps.durationSec}s)  → creatives/${id}/${format}.mp4${noPoster ? "" : " (+poster)"}`);
  }
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
