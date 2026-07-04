---
name: persona-refine
description: Clarify and sharpen a Hububb product's personas — surface gaps, propose jobs-to-be-done, tighten pain points — and persist the refinements to products/<slug>/personas/<id>.json. Use when the user says "refine the persona", "sharpen the JTBD", "what's missing from the persona", "help me with the Host/Stay/Work persona", or asks persona questions about a product.
metadata:
  version: 1.0.0
---

# persona-refine

You refine a product's personas. A product can have several — each is a real
human the creative engine generates against, so every improvement here sharpens
every future creative.

## Inputs
- A **product** slug (explicit; if exactly one folder exists under `products/`, use it; else ask).
- A **persona** id (which persona to refine). If the product has several and the
  user didn't say, list them and ask — or refine "all" if asked.
- Optionally a focus ("JTBD only", "pains feel generic", "tighten the bio").

## Files
- `products/<slug>/personas/<id>.json` — one persona document per file. Each has:
  - a `profile` (the human: `name`, `headline`, `location`, `bio`, optional
    `avatar`/`cover` served `/asset` paths, `archetype`, and `facts` as
    `{label, value}` chips), and
  - an ordered `sections` array of `{key, title, kind, content}` (kinds: `text`,
    `list`, `table` with `columns`/`rows`; new kinds allowed).
  Discovery is readdir — adding a persona is adding a file.
- `products/<slug>/product-marketing.md` — the marketing context. Ground every
  proposal in it (or in what the user tells you); never invent market facts.

Legacy: a product predating the folder may still have a single
`products/<slug>/persona.json`. If so, migrate it into `personas/` (give it an
id, lift a `profile` from the audience/archetype content) rather than editing it
in place.

## Process

### 1. Read and diagnose
Read the persona file(s) and the marketing md. Assess against these bars:
- **Profile** — does it read like one specific human? `name`, a `headline` that
  names the archetype, `location`, a `bio` in their own register, and `facts`
  chips (segment, situation, market, decision dynamics) a stranger could use to
  point at them in a crowd.
- **JTBD** — real hires, phrased as outcomes ("run the operation without
  things falling through the cracks"), not features? Is the emotional/
  cognitive job present? Are anti-jobs captured?
- **Pains** — concrete costs (time, money, growth, mental load, risk), in the
  customer's own register, not generic SaaS pain-speak?
- **Lifestyle** — does it read like a person, not a demographic?
- **Across personas** — do the product's personas actually differ in cares,
  challenge, and the value promised? If two collapse into one, merge them; if
  one hides two, split into separate files.

### 2. Surface gaps and propose
Report what's missing, thin, or generic — be specific about why it fails the
bar. Then propose concrete refinements: fill out the profile (bio, facts),
draft the missing JTBD, sharpen each weak pain into an observed cost, split or
merge personas. Propose new sections when a real dimension has no home (e.g.
"watering holes", "objections heard verbatim", "trigger moments").

Where the marketing md and persona disagree, flag it — don't silently pick.

### 3. Confirm, then persist
Walk the user through the proposals (grouped, not one-by-one unless asked).
On confirmation, write `products/<slug>/personas/<id>.json`:
- keep the `profile` + ordered-`sections` shape and pretty-print with 2-space indent
- set `version` to 2 and update `updatedAt` to now (ISO)
- never drop a section or profile field the user didn't ask to remove
- leave any `prompts` / `promptsUpdatedAt` fields intact — those are owned by the
  `persona-prompts` skill; editing the persona will flag them as out of date in the app

The Persona screen (`/p/<slug>/persona?persona=<id>`) reflects the file
immediately; the user can keep editing the profile and sections inline there.
After a meaningful refinement, suggest rerunning the `persona-prompts` skill so the
persona's starter prompts reflect the new data.

## Guardrails
- Ground in evidence: the marketing md, the user's answers, verbatim customer
  language. No invented statistics, no fabricated quotes.
- Persona feeds copy: keep the language plain and specific (the same earn
  test as the brand voice — every word earns its place).
- Respect the fluid schema: additive changes preferred; renaming keys breaks
  nothing but loses edit history in diffs, so keep keys stable.
