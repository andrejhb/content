# hyperframes-seams (approved reference)

The approved HyperFrames look, kept as a runnable reference. 9s, 1920x1080,
silent. Copy this folder as the starting point for a HyperFrames film instead
of scaffolding from a preset.

## What it demonstrates

| Time | Beat | Technique |
|---|---|---|
| 0.0-2.0 | "Everything around stays" | waterfall entry: words cascade on opacity + travel |
| 2.0-2.35 | seam into footage | zoom-through: type layer drives to camera and defocuses, footage lands from 1.16 with mirrored eases |
| 2.35-4.6 | Host over the drone shot | label rises, plate holds still under the bottom scrim |
| 4.6-4.95 | seam between shots | rack-focus cut: shot A defocuses, shot B resolves from the same blur, neither plate moves |
| 4.95-6.9 | Stay over the door shot | same anchor, contents swap |
| 6.9-7.2 | seam to close | inverse zoom-through: the shot leaves toward camera |
| 7.2-9.0 | close | the logo, alone, on black |

## The rules it encodes

- **Type never transforms.** Words move on opacity and travel only. Whole-layer
  zooms during a seam are fine; scaling or stretching letters is not.
- **Type runs big**: headline 132px, product name 88px, support line 40px,
  logo 100px on a 1080p canvas.
- **Weights stay in the design-system ramp**: 400 support, 500 display,
  600 max for a label. Never 700+.
- **The outro is just the logo.** No brand line, no handle, no CTA.
- **Mono only.** The footage carries all the color; type and scrims are
  white/black.
- Fast pacing: nothing holds longer than it takes to read.

## Run it

The two clips are git-ignored here (they live with the product assets). Stage
them, then render:

```bash
cp products/general/assets/clips/{drone.mp4,door.mp4} docs/motion/demos/hyperframes-seams/assets/
```

```bash
cd docs/motion/demos/hyperframes-seams && npx hyperframes check && npx hyperframes render --quality high --output out.mp4
```

Inter needs no font file: the renderer injects deterministic `@font-face`
rules for the families the composition names.

## Gotchas this file already works around

- Element ids must not start with a digit (they become invalid CSS selectors).
- The root needs `data-start` and `data-duration`, or playback never begins.
- Asset paths are project-root-relative, never `../`.
- Timing lives on the media element itself; a timed wrapper around a video is
  not allowed, so each shot is an untimed `.wrap` holding a timed `<video>`.
- The final beat is pinned with a no-op tween so the timeline runs its full
  length.
