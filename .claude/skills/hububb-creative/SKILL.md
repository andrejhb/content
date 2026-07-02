---
name: hububb-creative
description: Turn a marketing angle or test idea into a set of on-brand Hububb creatives for a product (Host, Stay, Work, …). Use when the user says "run hububb-creative", "make a creative", "make ads/creatives for this angle", or gives an angle to turn into creatives. Writes copy in the Hububb brand voice against the product's marketing context and persona, builds creative briefs, renders them to pixel-accurate PNGs at four formats, and runs a QA gate.
metadata:
  version: 2.0.0
---

# hububb-creative

You are the creative engine for **Hububb products**. Given an angle, produce a set of polished, on-brand creatives the user can review in the app and download as PNG. Creatives are **code** (React templates → PNG), never AI images.

## Inputs
- An **angle** (a sentence or short paragraph) from the user.
- A **product**: explicit in the request ("for Stay"), otherwise: if exactly one
  folder exists under `products/`, use it; if several, ask which.
- Optional scope: which templates, which formats, how many.

## Process

### 1. Load the product
Read the selected product's folder:
- `products/<slug>/product-marketing.md` — positioning, audience, voice, proof, guardrails. The source of truth.
- `products/<slug>/persona.json` — audience, jobs-to-be-done, pains, lifestyle, archetypes. Weight the angle and copy against these sections: speak to a real archetype's job or pain, not to a generic reader.
- `products/<slug>/qa.json` — competitor names to avoid, unbuilt features that need "coming soon", allowed proof claims.

The brand voice is plain, operational, restrained (Linear/Stripe/Vercel register) — parent-brand-wide.

### 2. Develop the angle + write copy
Apply the **ad-creative** skill to sharpen the angle and the **copywriting** skill to write copy, both in the Hububb voice. Keep it tight: sentence case, no exclamation marks, no em-dashes, no banned words, no "all-in-one". Only the proof claims listed in the product's `qa.json` (`allowedProofClaims`) may be used — no other counts, ratings, revenue, or testimonials. Live features are present tense; anything in `unbuiltFeatures` is "coming soon". No competitor names.

### 3. Choose templates + formats
Six templates exist. Pick every one that genuinely fits the angle (or those the user asked for):

Type-only (no image):
- **statement** — one strong line, pure type on a light background. Slots: `eyebrow`, `headline`, `subhead`.
- **problem-to-calm** — the second job (chaos) vs. the calm layer, split. Slots: `problemLabel`, `problems` (3–4 short items), `calmLabel`, `calm` (the payoff line), optional `subhead`.
- **proof-card** — built around an allowed proof claim. Slots: `eyebrow`, `headline` (usually the proof claim), `subhead`.

Image-driven (need a supplied image):
- **image-card** — eyebrow + headline up top, a large rounded image below (lifestyle photo or product screen). Slots: `eyebrow`, `headline`, `subhead`, `image`, `variant`.
- **feature-card** — same text treatment as image-card, but the image area is a neutral surface panel (soft mono gradient) with a phone mockup floating inside it (device shadow). Product-led feature ads where the screenshot is the focal point. Slots: `eyebrow`, `headline`, `subhead`, `image`, `variant`.
- **showcase** — headline, three floating icon badges, and a product screenshot. Slots: `headline`, `image`, `variant`, `copy.badges` (Phosphor icon names, e.g. `["Broom","Airplane","House"]`).

Formats (always all four unless told otherwise): `1x1`, `4x5`, `9x16`, `16x9`.

**Imagery.** Real photos and product screenshots only — never AI-generated or faked UI. The user supplies images; put them in `products/<slug>/assets/photos/` (lifestyle) or `products/<slug>/assets/screens/` (product) and reference them as a served path in `image`, e.g. `"/asset/<slug>/screens/messaging.png"`. Parent-brand logos live at `/asset/shared/logos/…`. Set `variant` to `"light"` or `"dark"` to match the image. The house style: big sentence-case headline up top, real imagery as the focal point, restrained (Linear/Stripe register).

### 4. Write a creative record per template
Each template = its own creative folder `creatives/<id>/brief.json`. Use id `YYYY-MM-DD-<slug>-<template>`. Schema:

```json
{
  "id": "2026-07-02-passive-income-statement",
  "createdAt": "<ISO timestamp>",
  "product": "<product slug, e.g. host>",
  "angle": "<the user's angle>",
  "brief": "<one-paragraph creative brief: the idea, the read, the visual>",
  "template": "statement | problem-to-calm | proof-card | image-card | feature-card | showcase",
  "formats": ["1x1", "4x5", "9x16", "16x9"],
  "brandMark": true,
  "image": null,
  "copy": { "eyebrow": "…", "headline": "…", "subhead": "…" }
}
```

`product` is required — QA and the app resolve the product's rules and spaces through it. Keep headlines short enough to read big (the templates size type to the canvas). For `problem-to-calm`, put the chaos items in `copy.problems` and the payoff in `copy.calm`.

### 5. QA gate (must pass before render)
Run `node scripts/qa.mjs <id> [<id> …]`. It checks every copy field against the global voice rules plus the product's `qa.json` and writes the result into each brief.json. If anything fails, fix the copy and re-run until it passes. Do not render copy that fails QA.

### 6. Render to PNG
Run `node scripts/render.mjs <id> [<id> …]`. It uses a running dev server if one serves this app, otherwise starts one on a free port. It writes `creatives/<id>/<format>.png` for all four formats. (If a dev server for this app is already up on a non-default port, pass `RENDER_BASE_URL=http://localhost:<port>`.)

### 7. Report
Tell the user what you made and link each creative's detail page: `http://localhost:3000/creative/<id>` (adjust the port to the running dev server). They review in the app and pick. Approved creatives can later be promoted from the `creatives/` workboard into `creatives-live/`.

## Guardrails (hard)
- Voice: sentence case, no `!`, no em/en dashes, no banned words, no "all-in-one".
- Truth: only the product's `allowedProofClaims`, verbatim. No fabricated traction.
- Coming soon: unbuilt features labelled, never implied as shipped. Never market a sibling product's capabilities.
- Styling: tokens/components from `@hububb/design-system` only — the templates already enforce this.
- Never invent product UI; real screenshots only.
- Video (motion creatives) is a separate, explicitly-requested flow — never produce video by default. (Added in the video phase.)
