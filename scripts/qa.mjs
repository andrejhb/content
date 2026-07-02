#!/usr/bin/env node
// QA gate for a creative brief. Enforces the parent-brand voice rules (global
// constants below) plus per-product truth rules from products/<slug>/qa.json.
// Usage: node scripts/qa.mjs <id> [<id> ...]
// Reads creatives/<id>/brief.json, runs checks on the COPY fields, writes the
// result back into brief.json, and exits non-zero if any creative fails.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(process.cwd(), "creatives");
const PRODUCTS = path.join(process.cwd(), "products");

// "all-in-one" was banned under the old "opinionated simplicity" positioning.
// The brand now embraces "all in one app" (everything under one roof), so it is
// intentionally not on this list.
const BANNED = [
  "seamless", "powerful", "revolutionary",
  "innovative", "empower", "unlock", "leverage", "supercharge", "robust",
  "scalable", "holistic", "elevate", "transform", "solution", "best-in-class",
  "world-class", "cutting-edge", "effortless", "effortlessly",
];

const CLICHES = [
  "grow your business", "take your hosting to the next level",
  "we're here to help", "delight your guests",
];

const OPENERS = ["hey there", "did you know", "looking to", "are you tired of"];

// Per-product rules (competitor names, unbuilt features, allowed acronyms)
// come from products/<slug>/qa.json, resolved via the brief's product field.
const qaConfigs = new Map();

async function qaConfig(product) {
  const slug = product || "host";
  if (qaConfigs.has(slug)) return qaConfigs.get(slug);
  let cfg;
  try {
    cfg = JSON.parse(
      await readFile(path.join(PRODUCTS, slug, "qa.json"), "utf8"),
    );
  } catch {
    cfg = {};
  }
  const resolved = {
    competitors: cfg.competitors ?? [],
    unbuiltFeatures: cfg.unbuiltFeatures ?? [],
    acronyms: new Set(cfg.allowedAcronyms ?? []),
  };
  qaConfigs.set(slug, resolved);
  return resolved;
}

const escapeRe = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

function collectCopy(brief) {
  const c = brief.copy ?? {};
  const fields = [
    c.eyebrow, c.headline, c.subhead, c.problemLabel, c.calmLabel, c.calm,
    ...(Array.isArray(c.problems) ? c.problems : []),
  ].filter((s) => typeof s === "string" && s.length);
  return fields;
}

function check(fields, cfg) {
  const text = fields.join("  ");
  const lower = text.toLowerCase();
  const checks = [];
  const add = (rule, ok, detail) => checks.push({ rule, ok, ...(detail ? { detail } : {}) });

  add("no-exclamation", !text.includes("!"), text.includes("!") ? "found '!'" : undefined);

  const dash = text.match(/[—–]/);
  add("no-em-or-en-dash", !dash, dash ? `found '${dash[0]}'` : undefined);

  const bannedHits = BANNED.filter((w) =>
    new RegExp(`(^|[^a-z])${w.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}([^a-z]|$)`, "i").test(lower),
  );
  add("no-banned-words", bannedHits.length === 0, bannedHits.join(", ") || undefined);

  const clicheHits = CLICHES.filter((p) => lower.includes(p));
  add("no-cliches", clicheHits.length === 0, clicheHits.join(", ") || undefined);

  const openerHits = OPENERS.filter((p) => lower.startsWith(p) || fields.some((f) => f.toLowerCase().startsWith(p)));
  add("no-throat-clearing", openerHits.length === 0, openerHits.join(", ") || undefined);

  const compHits = cfg.competitors.filter((c) => new RegExp(`\\b${escapeRe(c)}\\b`, "i").test(lower));
  add("no-competitor-names", compHits.length === 0, compHits.join(", ") || undefined);

  // Sentence case: flag ALL-CAPS words (len>=4, not an allowed acronym), and
  // flag a headline where every long word is capitalised (clear Title Case).
  const allCaps = [...text.matchAll(/\b[A-Z]{4,}\b/g)].map((m) => m[0]).filter((w) => !cfg.acronyms.has(w));
  add("no-shouting", allCaps.length === 0, allCaps.join(", ") || undefined);

  const headline = fields[1] ?? "";
  const longWords = headline.split(/\s+/).filter((w) => w.replace(/[^A-Za-z]/g, "").length >= 4);
  const titleCased = longWords.length >= 3 && longWords.every((w) => /^[A-Z]/.test(w));
  add("sentence-case-headline", !titleCased, titleCased ? "headline looks Title Cased" : undefined);

  // Truth: only "tested on hundreds of real London properties" is allowed.
  // Flag numeric people-counts, count-of-people phrases, ratings, revenue, testimonials.
  const truthFlags = [];
  if (/\b\d[\d,]*\+?\s*(hosts|customers|users|guests|reviews|ratings?|stars?|properties|homes)\b/i.test(text))
    truthFlags.push("numeric count claim");
  if (/\b(hundreds|thousands|millions)\s+of\s+(hosts|customers|users|guests)\b/i.test(text))
    truthFlags.push("count-of-people claim");
  if (/\btrusted by\b|\brated\b|\d(\.\d)?\s*(out of\s*5|stars?|★)/i.test(text))
    truthFlags.push("rating/endorsement claim");
  if (/[£$€]\s?\d/.test(text)) truthFlags.push("revenue/figure claim");
  add("no-fabricated-traction", truthFlags.length === 0, truthFlags.join(", ") || undefined);

  // Coming soon: unbuilt products/features must be labelled.
  const unbuilt =
    cfg.unbuiltFeatures.length > 0 &&
    new RegExp(`\\b(${cfg.unbuiltFeatures.map(escapeRe).join("|")})\\b`, "i").test(text);
  const labelled = /coming soon/i.test(lower);
  add("coming-soon-labelled", !unbuilt || labelled, unbuilt && !labelled ? "mentions unbuilt feature without 'coming soon'" : undefined);

  return checks;
}

async function run(id) {
  const briefPath = path.join(ROOT, id, "brief.json");
  const brief = JSON.parse(await readFile(briefPath, "utf8"));
  const cfg = await qaConfig(brief.product);
  const checks = check(collectCopy(brief), cfg);
  const passed = checks.every((c) => c.ok);
  brief.qa = { passed, checks, checkedAt: new Date().toISOString() };
  await writeFile(briefPath, JSON.stringify(brief, null, 2) + "\n");

  const mark = passed ? "PASS" : "FAIL";
  console.log(`\n[${mark}] ${id}`);
  for (const c of checks) {
    console.log(`  ${c.ok ? "ok  " : "FAIL"} ${c.rule}${c.detail ? `  — ${c.detail}` : ""}`);
  }
  return passed;
}

const ids = process.argv.slice(2);
if (ids.length === 0) {
  console.error("usage: node scripts/qa.mjs <id> [<id> ...]");
  process.exit(2);
}

let allPass = true;
for (const id of ids) {
  try {
    const ok = await run(id);
    allPass = allPass && ok;
  } catch (e) {
    console.error(`error on ${id}: ${e.message}`);
    allPass = false;
  }
}
console.log("");
process.exit(allPass ? 0 : 1);
