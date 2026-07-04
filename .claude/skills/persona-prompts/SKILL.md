---
name: persona-prompts
description: Generate starter prompts for a Hububb product's personas, ready-to-run hububb-creative invocations drawn from each persona's pains and jobs, and persist them to products/<slug>/personas/<id>.json. Use when the user says "generate starter prompts", "make prompts for the persona", "update the persona prompts", "run persona-prompts", or wants creative angles derived from a persona.
metadata:
  version: 1.0.0
---

# persona-prompts

You turn a persona into a set of concrete, copy-paste starter prompts for the
creative engine. Each prompt is aimed at one specific person and grounded in one
specific pain or job, so running it produces a creative that speaks to a real
archetype, never a generic reader. The persona is the source of truth; these
prompts are its output.

## Inputs
- A **product** slug (explicit; if exactly one folder exists under `products/`, use it; else ask).
- A **persona** id, or `"all"` to regenerate every persona for the product. If the
  product has several personas and the user didn't say, list them and ask.

## Files
- `products/<slug>/personas/<id>.json`, the persona you draw from and write back.
  Read the `profile` (name, headline, facts) and `sections` (especially `pains`,
  `jtbd`, `lifestyle`). You add/replace the top-level `prompts` array and set
  `promptsUpdatedAt`.
- `products/<slug>/product-marketing.md`, positioning, live features, proof, voice,
  guardrails. Ground every angle in it (or in what the user tells you); never invent
  features or proof claims.
- `products/<slug>/qa.json`, competitors to avoid, unbuilt features (must be "coming
  soon"), allowed proof claims. Respect it in the angles you draft.
- `prompts/static-creative.md`, the invocation template each prompt `body` follows.

## Process

### 1. Read and select
Read the persona file and the marketing md. For each targeted persona, list its real
pains and jobs. Pick the 3-5 sharpest, the ones a creative could land in one image.

### 2. Draft the prompts
For each chosen pain/job, write one `PersonaPrompt`:
- `title`, a short angle label (e.g. "Reclaim the evenings", "Never miss a clean").
- `body`, a filled-in copy of `prompts/static-creative.md`:
  - `Run hububb-creative for <slug>.`
  - `Angle:` one or two sentences drawn from THIS pain/job, in the persona's register.
  - `Description:` the feature, proof point, or moment it leans on, and the feeling to leave.
  - `Speak to: <profile.name>, <headline or archetype>` (always name the persona).
  - `Templates:` the ones that fit (or "all that fit").
  - `Formats:` all four unless the angle wants otherwise.
  - `Imagery:` `none`, or a real `/asset/<slug>/…` path if you know one from the Assets space.
  - `Render when QA passes and give me the review links.`

Keep every angle runnable as-is and grounded in a real pain, no invented statistics,
no competitor names, live features in present tense, unbuilt ones as "coming soon".

### 3. Persist
Write the **whole** persona JSON back to `products/<slug>/personas/<id>.json`:
- add or replace the top-level `prompts` array with the drafted prompts,
- set `version` to 2, stamp `updatedAt` to now (ISO), and set `promptsUpdatedAt` to the
  **same** timestamp (so the app shows them as fresh, not stale),
- **never drop** `profile` or `sections`, read, mutate, write the full doc,
- pretty-print with 2-space indent and a trailing newline.

The Persona screen (`/p/<slug>/persona?persona=<id>`) shows the prompts immediately,
each with a copy button. If the persona is later edited, the screen flags the prompts
as possibly out of date until you rerun this skill.

## Guardrails
- Ground in evidence: the marketing md, the persona's sections, the user's answers. No
  invented facts.
- One pain per prompt, sharper than a prompt that tries to say everything.
- Same voice rules as the brand: plain, specific, sentence case, no exclamation marks,
  no em/en dashes, no banned words.
- Prompts must be copy-paste runnable against the `hububb-creative` skill.
