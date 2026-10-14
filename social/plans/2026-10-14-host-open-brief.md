# @hububbhost · open brief · 14 Oct 2026

**Request:** "give me 4 posts for host"
**Assumptions:** 4 posts, host only, organic (no paid cuts, no story cuts). No theme given, so angles come from the strategy, led by longer stays per the 14 Oct positioning. Formats: one reel, two carousels, one static. Personas: `evenings-host` (Priya) and `turnover-tired-host` (Hannah); `pmc-owner` left out because his value promise is Hububb Pro, which is not live. Timed for mid-October: first cold nights, and capped London flats going quiet after their 90 nights. No prices anywhere. No earlier plans exist in `social/plans/`, so recency was checked against the host headlines already shipped in `creatives/` instead; nothing below reprints one. **Flag before post 4 ships:** the "a month or more sits outside the 90-night cap" line comes from product truth, but it deserves a legal check (see post 4).
**Golden benchmarks used:** host/90-275, host/sunday-night, host/make-room (all three are `seed` entries Andrej has not yet confirmed); every pattern in rejected.md checked.

| # | Format | Pillar | Funnel | Persona | Headline |
|---|---|---|---|---|---|
| 1 | Reel · 11s | relief | reach | evenings-host | 11.38pm, first cold night |
| 2 | Carousel · 5 slides | runs-itself | follow | turnover-tired-host | What a longer stay / asks of you |
| 3 | Carousel · 4 slides | longer-stays | engage | turnover-tired-host | Months in the diary / not weekend cleans |
| 4 | Static · 4:5 | longer-stays | convert | evenings-host | 90 nights ran out / The mortgage didn't |

---

## 1 · The thermostat question

`status: draft` · `account: host` · `format: reel, 11s, 9:16 with a 4:5 safe zone` · `pillar: relief` · `funnel: reach` · `persona: evenings-host` · `angle: midnight-message`

**The moment:** Priya is on her sofa at 11.38pm on the first properly cold night of October, knitting, phone idle on the cushion, while the guest in her Camberwell one-bed can't find the thermostat and sends a message.

**Why it works:** time-stamped scene that turns into an already-done moment. Benchmarked against golden host/sunday-night: same relief register and the same done-card proof, but a fresh, seasonal micro-chore (the heating in October), Hostie answering rather than drafting, and four supers of five words or fewer.

### On-image

| Time | On screen | Picture | Move |
|---|---|---|---|
| 0.0 to 1.8s | 11.38pm, first cold night | Woman knitting on a leather sofa, lamp on, dog asleep, phone idle beside her | slow push in, super rises on opacity |
| 1.8 to 3.6s | Guest can't find the thermostat | The flat from the street at night, one window lit | hard cut (the "meanwhile"), slow drift |
| 3.6 to 6.4s | Hostie answered, in your voice | The real Host chat in an iPhone frame: guest question, Hostie reply, "answered" chip with a mint tick | phone rises in, bubbles land in order |
| 6.4 to 9.0s | You read it at breakfast | Morning window light, a woman in an armchair with a mug and her phone | cross-dissolve |
| 9.0 to 11.0s | (H icon only) | Dark ground | fade in, hold, fade out |

Chat inside the phone (reproduced app UI; swap in the demo property's real guide wording before build):
> Guest · 11.38pm: Hi, it's freezing in here, where's the heating?
> Hostie · 11.38pm: Sorry about that. The thermostat is in the hallway by the front door. Press the flame, then the up arrow. The radiators warm up in about 20 minutes

### Hook variants
1. The thermostat at 11.38pm / handled · micro-chore
2. POV: your guest found the heating · POV line
3. Not every 11pm message / needs you · reframe

### Visual direction
- **Frame:** 9:16, every super inside the central 4:5 safe zone. Night beats dark, the breakfast beat light, so the reel moves from lamp light to daylight.
- **Image:** beat 1 a calm woman in her 30s busy with her hands on a sofa at night, phone untouched; beat 2 a London terrace at night with one lit window; beat 4 the same "you" next morning with a mug by a window.
- **Proof device:** the real Host chat in an iPhone frame (beat 3 only), with a small "answered" chip and a mint `#b2ffea` tick. No other UI in the reel.
- **Type:** one grotesk, supers at 500, nothing above 600, top third of frame on beats 1, 2 and 4; on beat 3 the super sits above the phone. No full stops on supers.
- **Motion:** pace fast, no beat longer than its read; type moves on opacity and travel only, never scaled. One hard cut (beat 1 to 2), cross-dissolves after. If the stills are animated, animate each photo on its own (Higgsfield) and cross-dissolve; never one generated take across beats. Outro is the H icon alone. No voiceover, so no captions track needed.
- **Assets:**
  - `products/host/assets/photos/evening-host.jpg` (2400x3598, crops to 9:16; used once before in creatives/2026-07-13-evenings-back-spotlight)
  - `products/host/assets/paper/calendar-bg-textc.png` (2160x2160, crop to 9:16; the same building as `photos/london-terrace-dusk-ad.png`)
  - `products/host/assets/photos/day-back-messages.jpg` (1536x2048; a different model from beat 1, used before in the July day-you-get-back carousel)
  - `products/host/assets/mockups/iphone-frame-silver-cutout.png` with the chat built in `phone-mockup-ui`; style reference `products/host/assets/mockups/phone-messaging-v2.png`
  - `products/host/assets/brand/host-icon.png` for the outro
  - **Source (optional):** a morning still of the beat 1 model for continuity, generated from `evening-host.jpg` and labelled generated. All the lifestyle stills here look generated; never caption them as a real host.
- **Build route:** HyperFrames for the photo beats and seams (load `motion-doctrine` first), with beat 3 rendered from the engine's `phone-mockup-ui` composition and dropped in as footage. The render goes to Flask for review per AGENTS.md.

### Caption
**First line:** Nearly midnight, a guest hunting for the heating, and none of it lands on you.

It is 11.38pm and your flat has a guest in it. The heating is off and they cannot find the thermostat. Usually that message would land on your phone and end your evening.

Instead Hostie replies, in your voice, from what you put in the property guide. You see the full thread in the morning. If you would have said it differently, you change the guide once.

Start with one listing. Link in bio.

**Hashtags:** #londonhosts #airbnbhostuk #shortletlondon

---

## 2 · What a longer stay asks

`status: draft` · `account: host` · `format: carousel, 5 slides, 4:5` · `pillar: runs-itself` · `funnel: follow` · `persona: turnover-tired-host` · `angle: month-runs-itself (new, proposed for the taxonomy)`

**The moment:** Hannah, at her kitchen table in Kentish Town on a Monday morning, scrolls back through nine weeks of a relocation guest in the Tufnell Park flat and sees she never had to step in.

**Why it works:** how-it-works journey (5), one timestamp and one proof device per slide, framed by owner cost ("what it asks of you") rather than features. Benchmarked against golden host/make-room (same calm, one line per slide, longer stays as the subject) and host/sunday-night (the done card as proof). It answers Hannah's job of running longer bookings with the inbox and cleans she already has, and it introduces Hububb to new followers without a feature list.

### On-image

**Slide 1 · hook**
> What a longer stay
> asks of you

**Slide 2 · booked**
> 35 nights, one booking
> from a relocation guest

**Slide 3 · answered**
> Week one · wifi, bin day, parking
> Hostie answered all three

**Slide 4 · extended**
> Week four · another month
> added by the guest in one tap

**Slide 5 · resolve**
> Week nine · checkout
> The clean booked itself as they left

### Hook variants
1. How a longer stay / runs without you · explainer opener
2. Nine weeks, one guest / one clean · number
3. Wifi, bin day, parking / Handled · pain triplet, short dismissal

### Visual direction
- **Frame:** 4:5, light. Slide 1 full-bleed lifestyle with type in negative space; slides 2 to 5 a white band over a rounded photo, with the proof device overlapping the photo edge (UI proof overlay).
- **Image:** slide 1 an open suitcase being unpacked onto a wingback chair, herringbone floor, plants, soft daylight: someone settling in for a while. Slides 3 and 4 the lived-in flat (sash windows, radiators, low sun). Slide 5 a close of hands smoothing a white duvet, no face.
- **Proof device:** slide 2 a booking card built from the Host app's real calendar components (guest initial, 35 nights, date span, source Hububb Stay, no price); slide 3 three stacked done cards ("Wifi · answered", "Bin day · answered", "Parking · answered") with mint ticks and evening times; slide 4 the same booking card with a "+1 month" duration chip and a mint tick; slide 5 one done card, "Turnover clean · booked", timed just after checkout.
- **Type:** headline in the band, line 2 at about 80 percent, semi-bold max. H icon small on slide 5 only, or nothing.
- **Assets:**
  - `products/host/assets/photos/packing-suitcase.png` (1200x1200; a 4:5 crop is 960x1200, so it needs a light upscale; the yellow case can be graded down)
  - `products/host/assets/photos/day-back-livingroom.jpg` (1536x2048; used before in the July day-you-get-back carousel and creatives/2026-08-19-host-90-nights-image-card)
  - `products/general/assets/clips/cleaner.mp4` (834x1112; take a still near 4s, the hand on the duvet; needs upscaling)
  - Done-card style reference: `products/host/assets/paper/calendar-card-checkin.png`. Booking card and duration chip do not exist yet; build them from the app's real components, never improvised UI.
- **Build route:** Paper for all five slides so the booking card, chip and done cards share one system. If speed matters, slide 3 can come from the engine `stack` template.

### Caption
**First line:** One guest, nine weeks, and here is everything it needed from you.

A relocation guest books 35 nights in your flat. In week one they ask about the wifi, bin day and parking. Hostie answers each one in your voice.

In week four they add another month themselves, in one tap. At checkout the clean is booked before they reach the station. You can see every step, and none of it waited on you.

That is a longer stay with Hububb. List on Hububb. Link in bio.

**Hashtags:** #londonhosts #midtermrental #relocationlondon #airbnbhostuk

---

## 3 · Months in the diary

`status: draft` · `account: host` · `format: carousel, 4 slides, 4:5` · `pillar: longer-stays` · `funnel: engage` · `persona: turnover-tired-host` · `angle: one-check-in`

**The moment:** Hannah, on a Sunday afternoon in Tufnell Park, stacks the second set of fresh towels that week on the end of a just-made bed, with another three-night guest due at 4pm.

**Why it works:** the headline is Hannah's own want ("months in the diary, not another weekend clean"), then one object, the calendar, changes across three slides: tension to resolve (4). Benchmarked against golden host/make-room: the same longer-stays message shown as a picture instead of a slogan, without reprinting its line. The calendar comparison is the thing one host sends to another, which is the engage test. It avoids the "one check-in a month" phrasing already common in the category, so it passes the own-it test on persona language.

### On-image

**Slide 1 · hook**
> Months in the diary
> not weekend cleans

**Slide 2 · tension**
> Four short stays
> four rounds of linen

**Slide 3 · mechanism**
> Corporate and relocation guests
> book a month or more

**Slide 4 · resolve**
> Short stays still fill
> the weeks either side

### Hook variants
1. Three flats, two changeovers a week? · named reader question
2. Same three flats / a quarter of the changeovers · number
3. Sunday, 3pm / the second changeover this week · time-stamped scene

### Visual direction
- **Frame:** 4:5, light. Slide 1 full-bleed lifestyle; slides 2 to 4 a white band over a rounded crop of the slide 1 bedroom, with the calendar below.
- **Image:** a freshly made bed, folded towels stacked on the bench at its foot, soft daylight through a sash window, radiator underneath.
- **Proof device:** one month calendar built from the Host app's real calendar components, the same grid on slides 2 to 4 so the swipe reads as one object changing. Slide 2: four 3-night stays, each checkout marked with a clean tick. Slide 3: one block across the month, one check-in marker. Slide 4: that block plus short stays in the weeks either side. Mint only on the clean ticks. No nightly prices in the cells.
- **Type:** slide 1 headline top-left in the wall space above the bed, line 2 at about 80 percent; slides 2 to 4 type in the band above the calendar. No swipe cue; the calendar pulls.
- **Assets:**
  - `products/host/assets/photos/day-back-bed.jpg` (1536x2048; used before in the July day-you-get-back carousel)
  - Calendar style references only: `products/host/assets/paper/calendar-screen.png` (De Beauvoir flat, short stays with £ rates to strip) and `products/host/assets/mockups/phone-calendar-v2.png` (2025 dates and $ rates; never ship as is). No existing asset shows a month-long block; it has to be built.
- **Build route:** Paper for the calendar sequence. Slide 1 alone could come from the engine `spotlight` template.

### Caption
**First line:** Three flats, two changeovers a week, and a laundry bag that never empties.

Weekend guests pay, but every one of them ends in a clean. Linen out, linen back, the same wifi speech on Friday.

Companies and relocation agents book differently. Their guests take a month or longer, so one check-in covers the whole stretch. Hububb Stay puts your flats in front of them.

Your Airbnb listings stay live, and short stays fill the gaps around the long one. One calendar keeps them from overlapping.

Start with one listing. Link in bio.

**Hashtags:** #londonhosts #midtermrental #airbnbhostuk #shortletlondon

---

## 4 · After night 90

`status: draft` · `account: host` · `format: static, 4:5` · `pillar: longer-stays` · `funnel: convert` · `persona: evenings-host` · `angle: the-other-275`

**The moment:** Priya walks home past her Camberwell one-bed on a mid-October evening, keys in her coat pocket; the flat's 90 short-let nights ran out in September and the mortgage left her account this morning.

**Why it works:** contrast couplet carried by one hero number, timed to the month capped London flats go quiet. Benchmarked against golden host/90-275: same hero number and setup then payoff split, but a new owner-side payoff (the mortgage) instead of reprinting "fills the other 275", and 7 words against the golden's 13.

**Truth flag:** product truth says stays of a month or more sit outside the 90-night cap. As I understand the London rule, short-term use is defined as the same occupant for under 90 consecutive nights, which would put a 28 to 89 night stay inside the count. Please confirm with whoever signed off the 90/275 line before this post ships.

### On-image
> 90 nights ran out
> The mortgage didn't
>
> Bookings of a month or more sit outside London's cap
>
> [List on Hububb]

### Hook variants
1. Short lets stopped at 90 / The year didn't · contrast couplet
2. Used your 90 nights already? · named reader question
3. October to December / a month at a time · time-stamped scene

### Visual direction
- **Frame:** 4:5, dusk, dark-leaning; white type, white pill.
- **Image:** the owner shot (visual-direction section 2): a woman in her mid-30s in a work coat at the front door of a Victorian stock-brick terrace at dusk, shot from slightly below, keys in hand, warm hallway light behind her, a band of evening sky above for type. Never a flat blue sky.
- **Proof device:** a thin year strip above the pill: January to September shaded and marked 90, October to December open with one month-long block outlined, not filled, so it shows where a longer stay sits rather than a booking we promise.
- **Type:** headline at the top in the sky band, line 2 at about 80 percent; subhead the same size; pill bottom centre. H icon small or nothing, no product label.
- **Assets:** **Source:** the owner shot. Either a short shoot on a Camberwell terrace, or a Higgsfield still generated from a real London street photo, labelled generated and never captioned as a real host. Fallback without a person: `products/host/assets/photos/london-terrace-dusk-ad.png` (1536x1024 landscape, red-brick mansion block at dusk, wet street; a 4:5 crop is only 819x1024, so it needs upscaling). It is the same building as post 1's night plate, so do not ship both in the same week.
- **Build route:** Paper (owner shot plus year strip; the engine has no year-strip device). The engine `spotlight` template is the fast fallback without the strip.

### Caption
**First line:** Your short-let year can end in September. The bills keep coming until December.

In Greater London, an entire home can be short-let for 90 nights a year. Reach that by autumn and short lets stop until January. Month-long guests are outside that count.

Hububb is the channel for them: corporate and relocation guests who find your flat through Hububb Stay. Your Airbnb listing stays exactly as it is, reviews included. One calendar keeps both in step, and Hostie answers guests on either.

Start with one listing. Link in bio.

**Hashtags:** #londonhosts #90nightrule #midtermrental #airbnblondon
