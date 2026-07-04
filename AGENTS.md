<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Repo layout & data layer

Multi-product marketing engine. A **product is a folder** — discovery is
readdir, nothing registers anywhere:

```
products/<slug>/          # host, stay, work, … ("shared" is reserved)
  product-marketing.md    # positioning, audience, voice, proof (required)
  personas/<id>.json      # one persona doc per file (profile + fluid sections)
  qa.json                 # per-product QA config for scripts/qa.mjs
  assets/<group>/         # source imagery (mockups, screens, photos, …)
assets/shared/            # parent-brand assets (logos), served as /asset/shared/…
creatives/<id>/           # all creatives, live: brief.json + rendered outputs (tracked, no promotion step)
```

**Creatives are all live.** Everything under `creatives/` is tracked and shown by
the app; there is no push-to-live promotion step. (Disabled, reinstatable: the old
workboard rule promoted approved creatives into `creatives-live/` and git-ignored
`creatives/`. To bring it back, restore the `.gitignore` lines noted there and this
promotion convention.)

Served asset paths: `/asset/<slug>/<group>/<file>` and `/asset/shared/…`.
Briefs are flat under `creatives/` with a required `product` field — do not
nest creatives by product.

**Data access seam:** all app filesystem access goes through
`lib/{products,brand,creatives,assets,personas}.ts`. Keep it that way — these
modules are the swap point if flat files ever move to SQLite. The only app
write path is `lib/personas.ts`; briefs are written only by skills and
`scripts/*.mjs` (the offline pipeline, which deliberately uses direct fs).
