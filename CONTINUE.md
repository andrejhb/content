# Continue Hububb Host motion review

Cursor could not upload to Flask (MCP sign-in succeeds, every tool call returns Unauthorized). You have a working Flask MCP connection — use it. Website upload is paid; only agent MCP uploads are free.

Repo: `/Users/andrejandonov/code/hububb-content`
Branch: `creatives-06`

## Do this first, nothing else

1. Upload only this file to Flask (team root is fine):
   `creatives/2026-08-20-host-90-nights-london-motion/9x16.mp4`
   (13,590,450 bytes, `video/mp4`)
   Title: `Host · London caps 90 nights · 9x16`
2. Give Andrej the flask.do link immediately after `upload_file_start`, before bytes finish.
3. Then `upload_file_complete`. Do not poll ready.
4. `wait_for_feedback` on that asset. Loop with `next_since`.
5. Later cuts of this ad = new versions of the **same** asset (`version_of`). Never a second asset.
6. Do not upload 4x5, other creatives, or stills.

Use the `flask-review` skill. If Flask tools are missing, `/mcp` → flask → browser sign-in.

Engine (already rendered): http://localhost:3100/creative/2026-08-20-host-90-nights-london-motion

Dev server is on **localhost:3100**. Do not spawn a second Next. `RENDER_BASE_URL=http://localhost:3100`.

## What this ad is

8s Remotion `animated-spotlight` of the signed 90/275 Host still. Wordmark top-left, copy on a floor scrim, real London stills cycling day → night behind it. No AI backgrounds.

Copy:

- Headline / setup: `London caps short-term lets at 90 nights`
- Subhead / payoff: `Hububb fills the other 275`
- CTA: `List your unit` (never “Connect your Airbnb”)
- Persona: side-hustler (Marcus Reed)

Timing: setup at ~0.3s, payoff at ~1.3s, setup dims ~1.85s, CTA ~2.55s.

Photos in the brief carousel (Unsplash + existing terrace): thames, street, tower-bridge, notting-hill, terrace-dusk-ad, night.

Engine changes already in: `images[]` on briefs, `PhotoCarousel` in `remotion/compositions/animated-spotlight.tsx`. QA passed.

Brief: `creatives/2026-08-20-host-90-nights-london-motion/brief.json`

## Product truth (do not invent past this)

- Host keeps the listing. Not a takeover. Not the legal PM.
- Admin we take: guest messaging (Hostie), clean dispatch, pricing. Do not say Hostie already runs the property.
- Longer stays is live. Stay is not Fully Managed. Someone still hosts it.
- No HomeHold 10% / Stay 5% as locked figures. No PMS / Pads / Channex / Dubai / Bali as capabilities. No named-host faces. No reprint of July live ads.
- Sentence case for engine copy. SWITCH / PMARRIVED / BIGCALLOUT keep all-caps (template identity).
- Full-opacity type on stills except the signed feeling still (muted setup + bold payoff).
- Follow `docs/strategy-context.md` and `products/host/qa.json`.
- Allowed proof in qa.json does **not** include £18,795 / £37,710 / £56,505. Those are from the live landing page Andrej asked to use on the Paper street ad only.

## Paper

https://app.paper.design/file/01M0CF6JSETA0SEB9YRKYRM5FY

- Discovery = page `1-0`
- Production = page `2-0`

Do not edit the plan file. Do not commit unless asked. Do not start Stay / Work / wearehububb until Host is signed.

## Not the job right now

- Paper SWITCH alt: Andrej is placing the real icon himself. Leave comment `c-k99f3g` open.
- Next PDF briefs (JOBLIST, PROOFCARD, PMARRIVED, BEFOREAFTER, CHATTHREAD, PROBSOLVE, BIGCALLOUT) wait for Host sign-off.

After the Flask link is live, wait for Andrej’s feedback on the 9:16 and iterate.

Delete this file when the Flask review for this cut is done.
