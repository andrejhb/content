#!/usr/bin/env node
// Labelled contact sheet of every image in one or more folders, so a skill can
// look at a whole asset group in one image instead of opening files one by one.
// Usage: node scripts/contact-sheet.mjs <out.png> <dir> [<dir> ...]
// Each tile shows the image fitted into a square plus "file · WxH" under it.

import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const TILE = 320;
const LABEL = 44;
const COLS = 5;
const EXT = /\.(png|jpe?g|webp)$/i;

const [out, ...dirs] = process.argv.slice(2);
if (!out || dirs.length === 0) {
  console.error("Usage: node scripts/contact-sheet.mjs <out.png> <dir> [<dir> ...]");
  process.exit(1);
}

const files = [];
for (const dir of dirs) {
  for (const name of (await readdir(dir)).sort()) {
    if (EXT.test(name)) files.push(path.join(dir, name));
  }
}
if (files.length === 0) {
  console.error("No images found.");
  process.exit(1);
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const tiles = await Promise.all(
  files.map(async (file, i) => {
    const meta = await sharp(file).metadata();
    const thumb = await sharp(file)
      .resize(TILE, TILE, { fit: "contain", background: "#eeeeee" })
      .png()
      .toBuffer();
    const name = path.basename(file);
    const short = name.length > 34 ? `${name.slice(0, 31)}...` : name;
    const label = Buffer.from(
      `<svg width="${TILE}" height="${LABEL}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#ffffff"/>
        <text x="6" y="18" font-family="Helvetica, Arial" font-size="14" fill="#111">${esc(short)}</text>
        <text x="6" y="36" font-family="Helvetica, Arial" font-size="12" fill="#666">${meta.width}x${meta.height} · ${esc(path.basename(path.dirname(file)))}</text>
      </svg>`,
    );
    const left = (i % COLS) * TILE;
    const top = Math.floor(i / COLS) * (TILE + LABEL);
    return [
      { input: thumb, left, top },
      { input: label, left, top: top + TILE },
    ];
  }),
);

const rows = Math.ceil(files.length / COLS);
await sharp({
  create: {
    width: COLS * TILE,
    height: rows * (TILE + LABEL),
    channels: 3,
    background: "#ffffff",
  },
})
  .composite(tiles.flat())
  .png()
  .toFile(out);

console.log(`${files.length} images -> ${out}`);
