---
name: persona-refine
description: Clarify and sharpen a Hububb product's persona — surface gaps, propose jobs-to-be-done, tighten pain points — and persist the refinements to products/<slug>/persona.json. Use when the user says "refine the persona", "sharpen the JTBD", "what's missing from the persona", "help me with the Host/Stay/Work persona", or asks persona questions about a product.
metadata:
  version: 1.0.0
---

# persona-refine

You refine one product's persona document. The persona is the benchmark the
creative engine generates against, so every improvement here sharpens every
future creative.

## Inputs
- A **product** slug (explicit; if exactly one folder exists under `products/`, use it; else ask).
- Optionally a focus ("JTBD only", "pains feel generic", "add a lifestyle section").

## Files
- `products/<slug>/persona.json` — the document you refine. Fluid schema:
  ordered `sections` array of `{key, title, kind, content}` (kinds: `text`,
  `list`, `table` with `columns`/`rows`; new kinds allowed).
- `products/<slug>/product-marketing.md` — the marketing context. Ground every
  proposal in it (or in what the user tells you); never invent market facts.

## Process

### 1. Read and diagnose
Read both files. Assess each section against these bars:
- **Audience** — specific enough that a stranger could point at the person in
  a crowd? (segment, situation, market, decision dynamics)
- **JTBD** — real hires, phrased as outcomes ("run the operation without
  things falling through the cracks"), not features? Is the emotional/
  cognitive job present? Are anti-jobs captured?
- **Pains** — concrete costs (time, money, growth, mental load, risk), in the
  customer's own register, not generic SaaS pain-speak?
- **Lifestyle** — does it read like a person, not a demographic?
- **Archetypes** — 2-3, each with cares/challenge/promise that actually differ?

### 2. Surface gaps and propose
Report what's missing, thin, or generic — be specific about why it fails the
bar. Then propose concrete refinements: draft the missing JTBD, sharpen each
weak pain into an observed cost, split or merge archetypes. Propose new
sections when a real dimension has no home (e.g. "watering holes",
"objections heard verbatim", "trigger moments").

Where the marketing md and persona disagree, flag it — don't silently pick.

### 3. Confirm, then persist
Walk the user through the proposals (grouped, not one-by-one unless asked).
On confirmation, write `products/<slug>/persona.json`:
- keep the ordered-sections shape and pretty-print with 2-space indent
- update `updatedAt` to now (ISO)
- never drop a section the user didn't ask to remove

The Persona screen (`/p/<slug>/persona`) reflects the file immediately; the
user can keep editing inline there.

## Guardrails
- Ground in evidence: the marketing md, the user's answers, verbatim customer
  language. No invented statistics, no fabricated quotes.
- Persona feeds copy: keep the language plain and specific (the same earn
  test as the brand voice — every word earns its place).
- Respect the fluid schema: additive changes preferred; renaming keys breaks
  nothing but loses edit history in diffs, so keep keys stable.
