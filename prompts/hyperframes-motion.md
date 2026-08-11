# Motion creative (HyperFrames)

Run hububb-creative for {product}. I want a motion creative (video), HyperFrames track.

Angle: <one or two sentences, the single idea this film should land>
Description: <the story: beats, imagery, the feeling it should leave>

Duration: <15-30s; past 45s it needs a real narrative arc>
Formats: <16x9 / 9x16 / 1x1; each renders separately>
Imagery: <real photos or clips from products/{product}/assets/, or shared assets>

QA the copy first, then compose and render with the HyperFrames CLI, and give me the review links.

---

## Start from the approved reference

`docs/motion/demos/hyperframes-seams/` is the approved look, runnable. Copy it
as the starting point rather than scaffolding from a preset; its README lists
the seam techniques, the locked type sizes, and the framework gotchas it
already works around.

## How the track works

HyperFrames is the cinematic track: HTML + GSAP compositions with a large
catalog of transitions, caption styles and VFX, rendered locally for free by
its CLI. It is NOT Remotion; nothing here touches the Remotion pipeline.

- Skills: vendored in `.agents/skills/` (hyperframes, hyperframes-core,
  motion-doctrine, cut-the-curve, seam-craft, product-launch-video,
  general-video, motion-graphics, media-use and friends). Load
  `motion-doctrine` FIRST before composing; route the build through the
  `hyperframes` gateway skill.
- Catalog: https://hyperframes.heygen.com/catalog/index.md (append .md to any
  item page for raw markdown).

## Repo conventions (the recipe stays tracked)

- The film's project lives at `creatives/<id>/hyperframes/` and IS the recipe:
  composition HTML, timeline, and frozen media inputs are all tracked
  (`.gitignore` re-includes everything under a `hyperframes/` dir).
- The brief records `"video": { "track": "hyperframes", "durationSec": <n>,
  "sourceDir": "hyperframes" }` and names the catalog blocks used in its
  `brief` prose. QA gates all on-screen copy before composing.
- Render per format into the creative folder, next to brief.json:
  `npx hyperframes render --output ../16x9.mp4` (and again per format). The
  app then lists and plays the mp4s like any other video creative; the label
  reads "HyperFrames film".
- Add a poster: extract a late frame as `<format>.png`, e.g.
  `ffmpeg -sseof -1 -i 16x9.mp4 -frames:v 1 16x9.png`.

## House rules (non-negotiable)

- Hububb mono only: the design-system white-to-black scale, Inter, no neon.
  Photography carries the color; type and scrims stay mono.
- Real photos and clips only, never AI-generated imagery or faked UI.
- Strong scrims under type on photography (match the Remotion house scrims).
- No period at the end of on-image lines; sentence case; no em or en dashes.
- Beat discipline carries over: one idea per beat, roughly 1.5-4s each, hard
  cuts by default, close on the wordmark.
- Silent output; music is added downstream if at all.
