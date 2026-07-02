---
name: product-onboard
description: Onboard a new Hububb product into the marketing engine by interviewing the user and writing its product folder. Use when the user says "onboard a product", "add a product", "set up Stay/Work", or supplies marketing notes for a product that has no products/<slug>/ folder yet. Creates product-marketing.md, persona.json, and qa.json; the product then appears in the app with zero code changes.
metadata:
  version: 1.0.0
---

# product-onboard

You onboard one product into the marketing engine. A product is a folder:

```
products/<slug>/
  product-marketing.md   # positioning, audience, voice deltas, proof, guardrails
  persona.json           # fluid sectioned persona doc (see schema below)
  qa.json                # per-product QA config consumed by scripts/qa.mjs
  assets/                # source imagery, one subfolder per group (optional at first)
```

The folder appearing with a `product-marketing.md` is all it takes to register —
tabs, spaces, and generation pick it up automatically.

## Ground rules

- **Interview, don't invent.** Every claim in the md must come from the user or
  from material they supplied. If a section has no answer yet, write it as an
  explicit gap ("TBD: …") rather than filling it with plausible text.
- **Inherit the parent voice.** Hububb's brand voice (plain, operational,
  restrained; the earn test and the own-it test; no exclamation marks, no
  em/en dashes, sentence case, banned-word list) is parent-brand-wide. Do not
  re-interview for it — only ask for per-product *deltas* (e.g. Stay speaks to
  guests, not hosts, so warmth may sit differently).
- **Truth rules are per product.** Ask explicitly: what proof claims are real
  and allowed? What is unbuilt and must be labelled "coming soon"? Which
  competitor names must never appear in copy?
- Slug: short, lowercase, kebab-case (`host`, `stay`, `work`). `shared` is
  reserved.

## Process

### 1. Establish scope
Ask which product, confirm the slug, and check `products/<slug>/` doesn't
already exist (if it does, switch to updating it — show what's there first).
Read `products/host/product-marketing.md` as the structural reference.

### 2. Interview, section by section
Work through the sections below in order. For each: if the user has supplied
notes covering it, draft from those and confirm; otherwise ask focused
questions (2-3 at a time, not a wall). Sections mirror the Host md so every
product reads the same way:

1. **Product Overview** — what it is, one-liner, positioning, category, brand
   architecture note (how it sits under Hububb; what siblings must never be
   implied as part of it).
2. **Target Audience** — who, where, decision-maker, primary use case,
   jobs-to-be-done (the hire, core jobs, anti-jobs).
3. **Personas** — 2-3 archetypes worth tailoring creative to: cares about /
   challenge / value we promise.
4. **Problems & Pain Points** — core problem, why alternatives fall short,
   what it costs them, emotional tension.
5. **Competitive Landscape** — job-by-job: what people hire today, why it
   fails, why this product wins. Names allowed internally, never in copy.
6. **Differentiation** — the USP in one line, then support.
7. **Objections** — likely pushback + honest responses.
8. **Customer Language** — verbatim phrases, owned terms, words to avoid.
9. **Brand Voice** — deltas from the parent voice only.
10. **Proof Points** — the allowed claims, verbatim. Hard stop: nothing else
    may be claimed in copy.
11. **Goals** — business goal, first milestone, conversion action.

### 3. Write the files
- `products/<slug>/product-marketing.md` — H1 `# Product Marketing Context`,
  `*Last updated: <date>*` and `*Scope: Hububb <Name> only. …*` lines, then the
  `##` sections above. Follow the Host file's register.
- `products/<slug>/persona.json` — schema:
  ```json
  {
    "version": 1,
    "product": "<slug>",
    "updatedAt": "<ISO timestamp>",
    "sections": [
      { "key": "audience",  "title": "Audience",        "kind": "text",  "content": "…" },
      { "key": "jtbd",      "title": "Jobs to be done", "kind": "list",  "content": ["…"] },
      { "key": "pains",     "title": "Pains",           "kind": "list",  "content": ["…"] },
      { "key": "lifestyle", "title": "Lifestyle",       "kind": "text",  "content": "…" },
      { "key": "archetypes","title": "Archetypes",      "kind": "table", "columns": ["…"], "rows": [["…"]] }
    ]
  }
  ```
  Seed the core sections (audience, jtbd, pains, lifestyle, archetypes) from
  the interview; add more sections freely — the schema is fluid.
- `products/<slug>/qa.json`:
  ```json
  {
    "competitors": ["…"],
    "unbuiltFeatures": ["…"],
    "allowedAcronyms": ["VRBO", "WCAG"],
    "allowedProofClaims": ["…"]
  }
  ```
  `competitors` and `unbuiltFeatures` are matched case-insensitively by
  scripts/qa.mjs. `allowedProofClaims` is advisory context for copywriting.

### 4. Verify and report
Run `node -e "..."` is unnecessary — just confirm the three files parse (JSON)
and tell the user the product is live: it appears in the app's product tabs
immediately. Point them at the Persona screen to refine, and remind them the
`hububb-creative` skill now accepts this product.
