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
  persona.json            # fluid sectioned persona doc
  qa.json                 # per-product QA config for scripts/qa.mjs
  assets/<group>/         # source imagery (mockups, screens, photos, …)
assets/shared/            # parent-brand assets (logos), served as /asset/shared/…
creatives/<id>/           # git-ignored workboard: brief.json + rendered outputs
creatives-live/<id>/      # approved creatives, promoted manually, committed
```

Served asset paths: `/asset/<slug>/<group>/<file>` and `/asset/shared/…`.
Briefs are flat under `creatives/` with a required `product` field — do not
nest creatives by product.

**Data access seam:** all app filesystem access goes through
`lib/{products,brand,creatives,assets,personas}.ts`. Keep it that way — these
modules are the swap point if flat files ever move to SQLite. The only app
write path is `lib/personas.ts`; briefs are written only by skills and
`scripts/*.mjs` (the offline pipeline, which deliberately uses direct fs).
