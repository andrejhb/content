#!/usr/bin/env node
// QA gate for a creative brief. Enforces the parent-brand voice rules (global
// constants below) plus per-product truth rules from products/<slug>/qa.json.
// Usage: node scripts/qa.mjs <id> [<id> ...]
// Reads creatives/<id>/brief.json, runs checks on the COPY fields, writes the
// result back into brief.json, and exits non-zero if any creative fails.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { validateBrief } from "../lib/creative-schema.ts";

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
    siblingCapabilities: cfg.siblingCapabilities ?? [],
    allowedProofClaims: cfg.allowedProofClaims ?? [],
  };
  qaConfigs.set(slug, resolved);
  return resolved;
}

const escapeRe = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

function collectCopy(brief) {
  const c = brief.copy ?? {};
  const fields = [
    c.eyebrow,
    c.headline,
    c.subhead,
    c.headlineTail,
    c.cta,
    c.proof,
    ...(Array.isArray(c.rotating) ? c.rotating : []),
    ...(c.compare
      ? [
          c.compare.leftTitle,
          c.compare.rightTitle,
          ...(Array.isArray(c.compare.left) ? c.compare.left : []),
          ...(Array.isArray(c.compare.right) ? c.compare.right : []),
          c.compare.footer,
        ]
      : []),
  ].filter((s) => typeof s === "string" && s.length);
  return fields;
}

function check(fields, cfg, copy) {
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

  const headline = typeof copy.headline === "string" ? copy.headline : "";
  const longWords = headline.split(/\s+/).filter((w) => w.replace(/[^A-Za-z]/g, "").length >= 4);
  const titleCased = longWords.length >= 3 && longWords.every((w) => /^[A-Z]/.test(w));
  add("sentence-case-headline", !titleCased, titleCased ? "headline looks Title Cased" : undefined);

  // Truth: numbers and figures are only allowed inside an allowlisted proof
  // claim (products/<slug>/qa.json allowedProofClaims, verbatim). Strip those
  // claims first, then flag numeric people-counts, count-of-people phrases,
  // ratings, revenue and testimonials in whatever copy remains.
  let truthText = text;
  for (const claim of cfg.allowedProofClaims) {
    if (typeof claim !== "string" || !claim.trim()) continue;
    truthText = truthText.replace(new RegExp(escapeRe(claim), "gi"), " ");
  }
  const truthFlags = [];
  if (/\b\d[\d,]*\+?\s*(hosts|customers|users|guests|reviews|ratings?|stars?|properties|homes)\b/i.test(truthText))
    truthFlags.push("numeric count claim");
  if (/\b(hundreds|thousands|millions)\s+of\s+(hosts|customers|users|guests)\b/i.test(truthText))
    truthFlags.push("count-of-people claim");
  if (/\btrusted by\b|\brated\b|\d(\.\d)?\s*(out of\s*5|stars?|★)/i.test(truthText))
    truthFlags.push("rating/endorsement claim");
  if (/[£$€]\s?\d/.test(truthText)) truthFlags.push("revenue/figure claim");
  add("no-fabricated-traction", truthFlags.length === 0, truthFlags.join(", ") || undefined);

  // Coming soon: unbuilt products/features must be labelled.
  const unbuilt =
    cfg.unbuiltFeatures.length > 0 &&
    new RegExp(`\\b(${cfg.unbuiltFeatures.map(escapeRe).join("|")})\\b`, "i").test(text);
  const labelled = /coming soon/i.test(lower);
  add("coming-soon-labelled", !unbuilt || labelled, unbuilt && !labelled ? "mentions unbuilt feature without 'coming soon'" : undefined);

  // Sibling-capability leakage: phrases that belong to another product (best-effort
  // keyword match, seeded per product in products/<slug>/qa.json siblingCapabilities).
  const siblingHits = cfg.siblingCapabilities.filter((p) => lower.includes(p.toLowerCase()));
  add("no-sibling-leakage", siblingHits.length === 0, siblingHits.join(", ") || undefined);

  // Headline length: advisory word/char counts are always reported; the only hard
  // failure is a headline past 12 words.
  const wordCount = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);
  const hl = typeof copy.headline === "string" ? copy.headline : "";
  const sh = typeof copy.subhead === "string" ? copy.subhead : "";
  const hlWords = wordCount(hl);
  add("headline-length", hlWords <= 12, `headline ${hlWords}w/${hl.length}c, subhead ${wordCount(sh)}w/${sh.length}c`);

  // Proof positivity: if proof-shaped copy appears, it must match one of the
  // product's allowedProofClaims (verbatim or a close token match). This is the
  // positive counterpart to no-fabricated-traction, which rejects the rest.
  const proofShaped =
    /\b\d[\d,]*\+?\s*(hosts|customers|users|guests|reviews|ratings?|stars?|properties|homes)\b/i.test(text) ||
    /\b(hundreds|thousands|millions)\s+of\s+\w+/i.test(text) ||
    /\btested on\b|\btrusted by\b|\brated\b/i.test(text) ||
    /[£$€]\s?\d/.test(text);
  let proofOk = true;
  let proofDetail;
  if (proofShaped) {
    const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
    const nText = norm(text);
    const onList = cfg.allowedProofClaims.some((claim) => {
      const nClaim = norm(claim);
      if (!nClaim) return false;
      if (nText.includes(nClaim) || nClaim.includes(nText)) return true;
      const claimWords = nClaim.split(" ").filter((w) => w.length > 2);
      const hits = claimWords.filter((w) => nText.includes(w)).length;
      return claimWords.length > 0 && hits / claimWords.length >= 0.7;
    });
    proofOk = onList;
    if (!onList) proofDetail = "proof-shaped copy not on allowedProofClaims";
  }
  add("proof-on-allowlist", proofOk, proofDetail);

  return checks;
}

async function run(id) {
  const briefPath = path.join(ROOT, id, "brief.json");
  const brief = JSON.parse(await readFile(briefPath, "utf8"));

  const valid = validateBrief(brief);
  if (!valid.ok) {
    console.log(`\n[FAIL] ${id}`);
    for (const e of valid.errors) console.log(`  FAIL schema: ${e}`);
    return false;
  }

  const cfg = await qaConfig(brief.product);
  const checks = check(collectCopy(brief), cfg, brief.copy ?? {});
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
