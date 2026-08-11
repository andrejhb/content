# Motion creative (Remotion)

Run hububb-creative for {product}. I want a motion creative (video), Remotion track.

Angle: <one or two sentences, the single idea this creative should land>
Description: <context: the feature or moment it leans on; the feeling it should leave>

Speak to: <persona archetype from the Persona screen, or leave it to the engine>
Composition: <animated-statement | animated-feature-card | phone-mockup-ui | phone-showcase | animated-spotlight | animated-stack | hostie-ad | motion-film | logo-sting, plus launch-* for the general product; the live list is REMOTION_COMPOSITION_IDS in lib/creative-schema.ts. Or let the engine pick.>
Duration: <~8s default; stings run ~4s; phone-mockup-ui ~11s; motion-film derives its duration from its beats>
Formats: <all four | 1x1 / 4x5 / 9x16 / 16x9>
Imagery: <for animated-feature-card: a served path like /asset/{product}/mockups/…>

QA the copy first, render with the video pipeline, and give me the review links.

---

## Template: phone-mockup-ui (generic phone mockup)

This is the GO-TO template for showing a feature as real, in-app UI. Whenever the
ask is "make a UI mockup for a feature" or any "in-app / messages answered /
handled for you" angle, reach for this first. It is a reusable ad form: a real
iPhone (light, clean) sitting in the scene with a headline that crossfades into a
CTA. The phone SCREEN is the swappable part. It ships two screens, selected via
`screen`: `chat` (a guest chat that answers itself) and `agent` (the website
hero's Hostie chat, driven by `beats` + `property`); more app-UI screens plug in
later the same way.

The composition is fully data-driven from the brief, so you build a new one by
supplying your own copy, CTA and conversations, no code changes:

```json
{
  "kind": "video",
  "video": { "track": "remotion", "composition": "phone-mockup-ui", "durationSec": 11, "fps": 30 },
  "screen": "chat",                   // the app UI on the phone ("chat" | "agent")
  "template": "feature-card",
  "formats": ["1x1", "4x5", "9x16", "16x9"],
  "brandMark": true,
  "variant": "light",                 // "dark" = dark scene + light phone
  "rotate": true,                      // cycle every conversation, then the CTA
  "copy": { "headline": "Guest messages answered by AI" },
  "cta": { "button": "Join Hububb" },  // the headline becomes this at the end
  "conversations": [                   // omit to use the built-in defaults
    {
      "guest": "Emma R.",
      "photo": "/asset/general/guests/guest-1.png",
      "listing": "Bright garden flat in De Beauvoir",
      "listingThumb": "/asset/host/photos/listing-de-beauvoir.jpg",
      "channel": "airbnb.png",         // or booking-b.svg (a served channel icon)
      "time": "2:14 AM",
      "question": "Hi, we just landed and cannot find the key box. Any help?",
      "answer": "Welcome. The lockbox is by the blue door, code 4471, and the wifi is on the welcome card inside."
    }
  ]
}
```

Notes:
- Only `copy.headline` is QA-gated marketing copy. `question`, `answer`, `guest`,
  `listing` are reproduced UI (kept out of QA), so write them naturally. Keep the
  answer specific and helpful (a code, a time, a location), the way Hostie really
  replies, so it reads as a product doing the work.
- Guest photos live in `/asset/general/guests/guest-1..10.png`; channel icons in
  `/asset/{product}/channels/` (`airbnb.png`, `booking-b.svg` is just the "B",
  `whatsapp.png`, and so on).
- `variant: "dark"` keeps the phone and its chat light while the background and
  the headline / CTA go dark (a light device glowing on a dark ground).
- Two conversations at ~11s reads well; scale the duration with the count.

The design is tuned and locked; you only choose copy, CTA, variant, rotate and
conversations. The composition already handles, and you should not re-litigate:
- The real iPhone frame (uniform thin bezel, true rounded corners) and the flush,
  seam-free screen fit.
- Dark mode: the phone + chat stay LIGHT on a dark scene. The device sits on a
  light plate that runs flush at the top/bottom and is inset left/right so the side
  buttons protrude onto the dark, so the frame never fringes.
- Transitions between guests are a smooth cross-dissolve (never a slide), and each
  answered thread holds still for ~1s before dissolving to the next guest.
- The headline crossfades into `cta.button` near the end.

To add a NEW app screen beyond `chat` (e.g. a calendar, a dashboard, a pricing
view), add another `<XScreen>` component and a `screen` case in
`remotion/compositions/phone-mockup-ui.tsx`; the frame, scene, dark mode, rotation
and CTA shell are all reusable as-is.

---

## Template: motion-film (beat-driven film)

The richest motion form: a short film assembled from a CLOSED shot vocabulary,
one idea per beat, cut hard by default. Reach for it when the angle wants a
narrative (hook, product moment, proof, close) rather than a single scene.
Powered by the remocn component layer under `remotion/motion/`; strictly
design-system mono, light or dark via `variant`.

Write the beat sheet FIRST and show it in your reply before rendering. Beats
run 1.5-4s (chat up to 8s, notify up to 6s), 2-10 beats, and the film must
close on a `wordmark` beat. Aim for five or fewer words on screen per beat.
The film's duration is the sum of beat durations; write `video.durationSec`
as that sum.

```json
{
  "kind": "video",
  "video": { "track": "remotion", "composition": "motion-film", "durationSec": 14.5, "fps": 30 },
  "template": "statement",
  "formats": ["9x16", "1x1"],
  "brandMark": true,
  "variant": "light",
  "copy": { "headline": "Answered while you sleep" },
  "film": {
    "beats": [
      { "shot": "statement", "durationSec": 2.5, "line": "2:14 am", "tail": "A guest has a question" },
      { "shot": "chat", "durationSec": 6, "transition": "blur",
        "chat": { "question": "…", "answer": "…", "name": "Maya R.", "time": "2:14 am",
                  "avatar": "/asset/general/guests/guest-5.png", "tag": "Answered by Hostie AI" } },
      { "shot": "stat", "durationSec": 3, "transition": "fade",
        "stat": { "value": 90, "suffix": "%", "label": "of the day-to-day, handled" } },
      { "shot": "wordmark", "durationSec": 3, "line": "Hosting that runs itself", "cta": "Connect your Airbnb" }
    ]
  }
}
```

Shots (the closed set; the validator rejects anything else):

| shot | slots | reads as |
|---|---|---|
| `statement` | `line`, `tail` | one line of type, big and centred |
| `chat` | `chat.{question,answer,name,time,avatar,tag}` | a guest question types out, the answer lands |
| `stat` | `stat.{value,prefix,suffix,label}` | a number rolls up odometer-style |
| `strike` | `strike.{from,to}` | the problem struck through, the solution replaces it |
| `notify` | `notifications[2-4].{title,meta}` | the to-do pile arrives, then clears with ticks |
| `media` | `media`, `line`, `tail` | full-bleed photo or clip, Ken Burns, house scrim |
| `roster` | `items[2-4].{label,text}` | the product index staggering in |
| `wordmark` | `line`, `cta` or `tail` | the Hububb close, optional CTA pill |

`transition` names the move OUT of a beat: `cut` (default), `fade`, `push`,
`blur`. Cut hard unless a transition earns its place.

Notes:
- ALL beat copy is QA-gated, the chat exchange included: in a film the
  exchange is full frame and IS the ad (unlike phone-mockup-ui's phone-screen
  chat). Keep the answer specific and helpful, the way Hostie really replies.
- `stat` values must stay inside the product's `allowedProofClaims`; never
  invent an hours-saved or revenue figure.
- After the render, spot-check stills at beat midpoints before calling it
  done (`ffmpeg -ss <t> -i 9x16.mp4 -frames:v 1 still.png`).
- Refinement notes map to single knobs: "beat two is too fast" stretches that
  beat's durationSec only; "too busy" drops a beat or a slot; "softer cut"
  adds a transition.
