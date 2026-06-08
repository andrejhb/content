---
name: hububb-creative
description: Turn a marketing angle or test idea into a set of on-brand Hububb Host creatives. Use when the user says "run hububb-creative", "make a creative", "make ads/creatives for this angle", or gives an angle to turn into creatives. Writes copy in the Hububb brand voice, builds creative briefs, renders them to pixel-accurate PNGs at four formats, and runs a QA gate. Hububb Host only.
metadata:
  version: 1.0.0
---

# hububb-creative

You are the creative engine for **Hububb Host**. Given an angle, produce a set of polished, on-brand creatives the user can review in the app and download as PNG. Creatives are **code** (React templates → PNG), never AI images.

## Inputs
- An **angle** (a sentence or short paragraph) from the user.
- Optional scope: which templates, which formats, how many.

## Process

### 1. Load the brand
Read `.agents/product-marketing.md` — positioning, audience, voice, proof, and the banned-words / guardrail rules. This is the source of truth. The brand voice is plain, operational, restrained (Linear/Stripe/Vercel register).

### 2. Develop the angle + write copy
Apply the **ad-creative** skill to sharpen the angle and the **copywriting** skill to write copy, both in the Hububb voice. Keep it tight: sentence case, no exclamation marks, no em-dashes, no banned words, no "all-in-one". The only proof claim allowed is **"tested on hundreds of real London properties"** — no host counts, ratings, revenue, or testimonials. Live features are present tense (AI guest messaging is live); anything unbuilt is "coming soon". No competitor names.

### 3. Choose templates + formats
Six templates exist. Pick every one that genuinely fits the angle (or those the user asked for):

Type-only (no image):
- **statement** — one strong line, pure type on a dark background. Slots: `eyebrow`, `headline`, `subhead`.
- **problem-to-calm** — the second job (chaos) vs. the calm layer, split. Slots: `problemLabel`, `problems` (3–4 short items), `calmLabel`, `calm` (the payoff line), optional `subhead`.
- **proof-card** — built around the London proof point. Slots: `eyebrow`, `headline` (usually the proof claim), `subhead`.

Image-driven (need a supplied image):
- **image-card** — eyebrow + headline up top, a large rounded image below (lifestyle photo or product screen). Slots: `eyebrow`, `headline`, `subhead`, `image`, `variant`.
- **feature-card** — same text treatment as image-card, but the image area is a neutral surface panel (soft mono gradient) with a phone mockup floating inside it (device shadow). Product-led feature ads where the screenshot is the focal point. Slots: `eyebrow`, `headline`, `subhead`, `image`, `variant`.
- **showcase** — headline, three floating icon badges, and a product screenshot. Slots: `headline`, `image`, `variant`, `copy.badges` (Phosphor icon names, e.g. `["Broom","Airplane","House"]`).

Formats (always all four unless told otherwise): `1x1`, `4x5`, `9x16`, `16x9`.

**Imagery.** Real photos and product screenshots only — never AI-generated or faked UI. The user supplies images; put them in `brand/photos/` (lifestyle) or `brand/screens/` (product) and reference them as a served path in `image`, e.g. `"/brand-asset/screens/messaging.png"`. Set `variant` to `"light"` or `"dark"` to match the image. The house style: big sentence-case headline up top, real imagery as the focal point, restrained (Linear/Stripe register), light + dark variants. (Swipefile best practices: one dominant message, benefit-led headline, customer-first, a single clear visual focal point.)

### 4. Write a creative record per template
Each template = its own creative folder `creatives/<id>/brief.json`. Use id `YYYY-MM-DD-<slug>-<template>`. Schema:

```json
{
  "id": "2026-06-08-passive-income-statement",
  "createdAt": "<ISO timestamp>",
  "angle": "<the user's angle>",
  "brief": "<one-paragraph creative brief: the idea, the read, the visual>",
  "template": "statement | problem-to-calm | proof-card",
  "formats": ["1x1", "4x5", "9x16", "16x9"],
  "brandMark": true,
  "image": null,
  "copy": { "eyebrow": "…", "headline": "…", "subhead": "…" }
}
```

Keep headlines short enough to read big (the templates size type to the canvas). For `problem-to-calm`, put the chaos items in `copy.problems` and the payoff in `copy.calm`.

### 5. QA gate (must pass before render)
Run `node scripts/qa.mjs <id> [<id> …]`. It checks every copy field and writes the result into each brief.json. If anything fails, fix the copy and re-run until it passes. Do not render copy that fails QA.

### 6. Render to PNG
Make sure the dev server is running (`npm run dev`), then `node scripts/render.mjs <id> [<id> …]`. It writes `creatives/<id>/<format>.png` for all four formats. (The script will start a dev server itself if none is up.)

### 7. Report
Tell the user what you made and link each creative's detail page: `http://localhost:3000/creative/<id>`. They review in the app and pick. Approved creatives can later be promoted from the `creatives/` workboard into `creatives-live/`.

## Guardrails (hard)
- Voice: sentence case, no `!`, no em/en dashes, no banned words, no "all-in-one".
- Truth: only "tested on hundreds of real London properties". No fabricated traction.
- Coming soon: unbuilt features labelled, never implied as shipped.
- Styling: tokens/components from `@hububb/design-system` only — the templates already enforce this.
- Never invent product UI; real screenshots only.
