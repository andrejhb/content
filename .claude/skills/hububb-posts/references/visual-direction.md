# Visual direction: how to brief the picture

Direction is directional. It tells a designer, Paper, or the engine what the frame must do and what it should feel like, then points at real assets. It is not a pixel spec.

## 1. What every post's direction contains

- **Frame:** format and aspect (4:5 feed default, 1:1, 9:16), light or dark.
- **Image:** subject, shot, light, place. One sentence a photographer could act on.
- **Proof device:** the one element that makes the copy true on screen (see section 4). If the copy makes a claim, the frame must show it.
- **Type:** where it sits (which negative space), hierarchy (line 2 grey or 80 percent), any chip or pill.
- **Motion** (reels and animated posts): beat by beat, what moves and how it transitions.
- **Assets:** real repo paths, verified with `ls`, and look at the image before naming it unless the filename leaves no doubt. If nothing fits, write "Source:" and what to get (shoot, stock, or generate from a real photo), honestly labelled.
- **Build route:** engine template or Remotion composition, Paper, HyperFrames, or Higgsfield (section 7).

## 2. The owner shot (Blueground's grammar, Hububb's light)

Andrej chose Blueground's art direction for owner framing. The team has also flagged a draft as "not a direct copy of Blueground". So take the grammar and change the surface.

**Keep (the grammar):** one real-feeling person, shot from slightly below, with their building in frame; a hand on a railing, a door, a window ledge says "this is mine". A big clean field of negative space above the head for type. One idea, one pill. Calm, adult, nothing shouting.

**Change (the surface):**
- Light: London dusk or dawn, warm, or soft overcast. Never a flat blue sky gradient.
- Architecture: London stock brick terraces, white stucco, mansion block balconies, sash windows, a front door with a number. Not glass towers.
- Brand: the H icon small or nothing; no wordmark lockup top-left as a fixed system. Black or white pill, never navy.
- People: owner-age (30s to 50s), dressed like they have a day job, relaxed, never a stock-photo grin. Never a real named host's face.

**Variations to rotate:** owner at their front door with keys at dusk; owner on a balcony rail, the block behind; owner on the front steps with a coffee, early light; back-to-camera owner looking at their building from across the street.

**Sourcing:** no owner shots exist in the repo yet. Say "Source:" and propose either a small shoot or a generated still built from a real London street photo (Higgsfield), labelled as generated in the plan.

## 3. Per-account looks

| Account | Look | Notes |
|---|---|---|
| host | Lifestyle photography first: a calm person in a warm London interior or the owner shot, with one proof device. Light by default, dark when the moment is night | UI only when the concept is the product, and then as a real phone mockup or a single done card, never a desktop screen. Mint `#b2ffea` only on a small status tick |
| company (@wearehububb) | Monochrome, near-black or near-white, deep dark gradient depth allowed, big thin-weight numbers, real places | Several real places cross-dissolving, never one AI scene blending everything. Strong scrims |
| stay | Wander-style full-bleed cinematic interiors and London at dusk, bold sentence-case white headlines | Aspirational restraint. Back-to-camera at a landmark works |
| work | Documentary daylight: real hands doing real work (bed made, tap fixed, keys handed over), the phone with the job brief | No locked look yet. Respectful, never "gig hustle" energy. Propose and say it is a proposal |

Photo direction for every account (from the team's approved drafts): warm daylight or dusk, cream and greige interiors, one relaxed subject with a phone or a coffee, London seen from behind or from the street. Black, high-contrast treatments were praised; flat greys were called "too grey".

## 4. Proof devices

The team asked repeatedly for the visual to demonstrate the line. Pick one per frame.

| Device | Proves | Source |
|---|---|---|
| Done card with mint tick ("11.47pm guest message, answered") | Hostie answered, a clean was booked | Built in code: engine `stack` template or `paper-layers`; `products/host/assets/paper/calendar-card-checkin.png` as a style reference |
| Calendar filling in blocks (a 28-night block plus short stays in the gaps) | Longer stays anchor the year | `products/host/assets/paper/calendar-*.png`, `products/host/assets/mockups/phone-calendar-v2.png`, `calendar-mock.png` |
| 90 / 275 split (a year bar, 90 short-let nights, the rest in longer stays) | The London cap and what fills the rest | Built in code or Paper; no asset yet |
| Real phone inbox or chat | One inbox, Hostie in the thread | `products/host/assets/mockups/phone-inbox.png`, `phone-messaging-v2.png`, `chat-mock.png`; engine `phone-mockup-ui` |
| Channel row | Your listing stays on Airbnb, Booking.com, Vrbo, Expedia | `products/host/assets/channels/` (airbnb-belo.svg, booking-b.svg, vrbo.png, expedia.png) |
| Duration chips (+1 month, +3 months) | Stay longer, add a month | Built in code or Paper |
| Listing card or provider card | A real stay, a real vetted provider | Built from real app UI only (`products/host/assets/app-screens/`) |

Never improvise UI. If the device does not exist yet, say it must be built from the app's real components.

## 5. Layout archetypes the team has reviewed

Name one in the direction so the designer knows the starting point (details in `research/paper-references/analysis.md`):
full-bleed lifestyle with type in negative space; white band over a rounded photo; charcoal stage with framed imagery; shape mask (house silhouette); fanned card stack; UI proof overlay; 2x2 tile grid; checklist rail; duration chips; sidebar scrim column; frosted card; dollhouse facade (loved for "How a monthly stay works"); type-only close (last slide only).

## 6. Type and brand on the frame

- One grotesk, sentence case, medium to semi-bold (600 max). Headline and sub can share a size.
- Two-tone hierarchy for organic posts: line 1 full, line 2 grey or about 80 percent (the team's Oct 2026 Paper feedback). Paid spotlight ads stay solid white (creatives-04 decision); say which in the direction.
- No periods at the end of on-image lines. No dash-like rules before labels.
- Brand: H icon, small, or nothing. No "Hububb Host" or "Hububb Stay" labels on the frame.
- Pill: black on light, white on dark, 2 to 4 words, last slide or single post only.
- Scrims: strong enough that type and icon are clearly readable; err heavier.

## 7. Build routes

| Route | Use for | Entry point |
|---|---|---|
| Engine static templates | Fast on-brand statics and carousels from code | `hububb-creative` skill. Templates: `spotlight` (full-bleed photo + scrim), `image-card`, `feature-card` (phone in a panel), `stack` (done cards over a photo), `compare`, `statement`, `proof-card`, `chat-thread`, `launch-hello`, `launch-index` |
| Engine Remotion compositions | Animated statics and short reels from the brand system | `animated-spotlight`, `animated-stack`, `animated-chat-thread`, `phone-mockup-ui` (real app UI in an iPhone frame), `phone-showcase`, `launch-form`, `launch-cover`, `paper-layers` (animate a Paper still from exported layers), `motion-film` (beat-driven) |
| Paper | Explorations and layouts the engine does not have (owner shot, dollhouse, shape masks) | Andrej's working canvas for reference-led variations |
| HyperFrames | Photography-led reels with real transitions; Andrej's preferred motion tool | `hyperframes` skill, `prompts/hyperframes-motion.md`, load `motion-doctrine` first |
| Higgsfield | Animating a real photo, or a generated still built from a real place | Per-real-photo animation then cross-dissolve; never one continuous AI scene |

Every video route ends in Flask (flask.do) for review, per `AGENTS.md`: name it in the build route of any reel or animated post.

## 8. Asset map

Look before you name. Run the contact sheet first, then open single files only for a closer look:

```bash
node scripts/contact-sheet.mjs <scratchpad>/sheet.png products/host/assets/photos
```

**Provenance rule.** Treat every lifestyle image as generated or stock unless it is listed as real below. Never caption a generated person as a real host or a generated room as a bookable home, and never use a generated or stock interior in a paid Stay ad. Today the only known real Hububb listing photo is `listing-de-beauvoir.jpg`.

**Filenames lie.** Several were named for a brief, not for what they show. Use the descriptions below, verified 14 Oct 2026. Assets change; re-check with the contact sheet.

`products/host/assets/photos/`
- London landmarks (Unsplash stock, portrait 1600x2400): `london-notting-hill.jpg` is Big Ben with a red bus at dusk (not Notting Hill); `london-street.jpg` is the Palace of Westminster and Big Ben in daylight (not a street); `london-thames.jpg` is the Westminster skyline with a red bus; `london-tower-bridge.jpg` is Big Ben and Westminster at a moody dusk (not Tower Bridge); `london-westminster.jpg` is an aerial of the Thames with Tower Bridge and Canary Wharf; `london-night.jpg` is an aerial at night with Tower Bridge.
- `london-terrace-dusk-ad.png`: red-brick mansion block at night, wet street, landscape 1536x1024, looks generated; the same building as `paper/calendar-bg-textc.png`, so never both in one week.
- Interiors: `listing-de-beauvoir.jpg` (REAL Hububb listing, bright living room, small at 1080x804); `living-room.jpg` (dark modern sofa, portrait); `studio.jpg` (dark minimal chair, portrait); `bedroom.jpg` (bright bedroom, landscape); `apartment-city.png`, `living-london.png` (bright cream living rooms, generated).
- People and moments (generated look): `evening-host.jpg` (woman on a leather sofa with a dog, lamp light; the same image as `general/assets/photos/microsoft-copilot-hkkre01teo4-unsplash.jpg`); `day-back-evening.jpg` (woman reading on a sofa); `day-back-kitchen.jpg` (man on his phone in a kitchen); `day-back-messages.jpg` (woman in an armchair by a window, phone); `day-back-park.jpg` (man walking in a park, back to camera); `host-relaxed-laptop.png` (man leaning back at a laptop, square); `guest-maya.jpg` (smiling headshot); `microsoft-copilot-g94pwbjh-yo-unsplash.jpg` (woman on a yoga mat, top-down); `microsoft-copilot-txzv4hqjrpe-unsplash.jpg` (woman at a desk, top-down).
- Places without people: `day-back-livingroom.jpg` (sunlit sash-window room), `day-back-bed.jpg` (made bed, folded towels, sash window).
- Cleaning: `cleaner-mopping.jpg` (stock; identical to `pexels-liliana-drew-9462143.jpg`); `cleaning-spray-dusk.jpg` (spray bottle silhouette; identical to `kaffeebart-ozraelxhyho-unsplash.jpg`); `cleaner-supplies.png` (smiling cleaner with supplies, square, generated look).
- Travel: `packing-suitcase.png` (open yellow suitcase on an armchair, square, stock); `travel.jpg` (a fjord, not London).
- Do not use for posts: `chatgpt-image-jul-1-2026-02-23-07-pm-4*.png` (villa with a pool, not London), `billboard-underpass-blank*.png` and `london-bus-blank.png` (out-of-home mock plates), `hub-aug-brief02-switch-*` (past bus-shelter poster concepts).

`products/host/assets/` (other groups)
- `mockups/`: real phone mockups (`phone-inbox.png`, `phone-calendar-v2.png`, `phone-messaging-v2.png`, `phone-channels.png`, `phone-access.png`, `phone-dashboard.png`, `phone-overview-v2.png`), hand shots (`hand-hostie-sky.png`, `hand-cleaning-beige.png`), the iPhone frame cutout. Calendar mockups show $ rates and 2025 dates: style reference only, never ship as is.
- `paper/`: calendar ad layers (frame, plate, screen with £ rates to strip, check-in card, rate card, wordmark).
- `app-screens/`: real app screens. `hububb-stay.png` shows a Dubai listing with $ prices: do not use (Dubai is not a capability to market). `cleaning.png` is the host booking view with prices: not for Work posts.
- `channels/`: channel logos. `brand/host-icon.png`: the H icon.
- `clips/london-day-to-night.mp4`, `videos/living-room-motion.mp4`.

`products/general/assets/`
- `clips/`: `drone.mp4` (home orbit), `door.mp4` (guest arriving), `cleaner.mp4` (bed made), `connected-layer-places.mp4`, `spotlight-portrait.mp4`, `spotlight-wide.mp4`. All generated (Higgsfield), all already used on @wearehububb.
- `photos/` (all generated or AI stock): bright cream interiors (`apartment-city`, `bedroom-city`, `living-kitchen`, `living-london`, `chatgpt-image-jul-1-2026-02-40-*`, `chatgpt-image-jun-25-*-08-24-*`); `bedroom-valley.png` (mountains, not London); `villa-dusk.png` and `chatgpt-image-jul-1-2026-02-13-*` (modern villa with pool, not London); `chatgpt-image-jul-10-2026-12-23-07-pm.png` (cleaner wiping a table, the Shard in the window; ran on @wearehububb in July); `chatgpt-image-jun-25-*-08-25-*` (window view to the Shard and the City); `chatgpt-image-jun-25-*-08-26-*` (dark blue living room at dusk); `guest-arrival-backpack.png` (guest from behind entering a flat; ran in July); `andrey-novik-*-unsplash.jpg` (woman with a mug on a chair, warm, stock); `microsoft-copilot-*-unsplash.jpg` (AI stock: women working from home, kitchen, window seat, sofa with dog).
- `guests/`: ten guest portraits.

`products/stay/assets/photos/`: two generated landscape interiors (a woman with a mug, a man with a mug, dark rooms, not identifiably London). Stay needs sourcing for almost every post.

`products/work/assets/`: persona avatars only. Work needs sourcing; never use a persona avatar as a real worker.
