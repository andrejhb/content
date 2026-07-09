# Creative run (end to end)

One command, one angle, all the way through: run hububb-creative for {product}, then gate, render, log, and caption it.

Product: {product}
Angle: {angle}
Speak to: <persona archetype from the Persona screen, or leave it to the engine>
Pillar + funnel: <optional: name the strategy-context.md pillar and funnel stage, or let the engine choose and record them in the brief prose>

Do this in order, and stop if the QA gate fails:

1. Read `docs/strategy-context.md`, then run hububb-creative for {product} on the angle above. Justify the angle against a pillar, and record the pillar and funnel stage in prose inside the brief field (e.g. "pillar: relief, funnel: reach").
2. Choose the templates and formats that fit the angle (hububb-creative Step 3): statement, proof-card, image-card, feature-card, showcase, or spotlight.
3. QA gate: `node scripts/qa.mjs <id>`. If any check fails, fix the copy and re-run. Do not proceed until it passes. On failure, stop here and report what failed.
4. Render, only after QA passes: `node scripts/render.mjs <id>` (four PNGs per creative). For a Remotion video creative, use `node scripts/render-video.mjs <id>` instead.
5. Log it: `npm run memory` to refresh `data/creative-memory.json`.
6. Caption it: run hububb-caption for `<id>` to write the Instagram first line, caption, and hashtags for the {product} account.
7. Report: the review link per creative (`http://localhost:3000/creative/<id>`, adjust to the running dev server port), the pillar and funnel tags, and the caption.
