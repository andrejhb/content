# strategy-context.md

Context document for the hububb-creative and hububb-caption skills. Read before generating any brief or copy. This encodes the communications strategy so every creative is on-strategy by default. It sits upstream of qa.mjs; it does not replace it. Pillar and funnel tags are written in prose inside the brief text field, never as schema fields.

---

## 1. Objective

Get the first 100 hosts onto the platform through Hostie. Roughly 300 units expected. Everything generated should be traceable to this objective. Stay and Work content exists to hold presence, not to convert at volume yet.

Organic phase only. No paid until the London cohort confirms conversion. Every creative doubles as a paid-ad candidate, so tag angles consistently.

## 2. Accounts and effort split

| account | role | audience | effort |
|---|---|---|---|
| host | pull, primary conversion engine | independent hosts 1-20 units | 70% |
| company (@wearehububb) | profile, reputation | investors, press, talent | 15% |
| work | push, supply side | cleaners, handymen, small service companies | 10% |
| stay | pull, dormant flag | monthly renters | 5% |

Accounts map to the engine's existing product slugs: host, general (company), work, stay. When a brief does not specify, default to host.

## 3. Personas

Use the engine's existing per-product personas. Strategy mapping:

- host / side-hustler type (1-5 units): hosting became a second job, answers guests at midnight, juggles cleaners on WhatsApp. Wants time back without giving a management company a big share. Trusts other hosts, not vendors. Trigger: relief. PRIMARY.
- host / scaling-operator (5-20 units): runs it as a business. Consistency, reliable labour, margin. Responds to the third path framing (neither burnout nor giving up margin). Slightly more informational.
- work / service provider: cleaner or handyman, wants steady recurring work from verified hosts. Uber driver app mental model. Trigger: predictable income, respect.
- general / investor-press: wants the category thesis, the moat, momentum, taste. Responds to story and category-of-one confidence.

## 4. Message pillars per account

Each creative serves exactly one pillar. Name it in the brief prose.

### host
1. relief: give your life back. Never think about the midnight message again. Emotional, transformational. Lead pillar, ~40% of host output.
2. runs-itself: Hostie answers in your voice, calendar and pricing handled, cleaners and handymen booked in-app. Benefit-led, never a feature list. ~25%.
3. proof-trust: tested on real London properties. The third path: keep control, keep your margin. ~15%.
4. category: autonomous hospitality. AI without hands is a dashboard that talks, we built the hands. ~10%.
5. community: host voices, conversation starters, later UGC. ~10%.

### company (general)
1. thesis: the ecosystem for flexible stays, everything around the stay. ~40%.
2. moat: the physical service network, the part that cannot be copied. ~25%.
3. momentum: mission, build-in-public, tested on real London properties. ~20%.
4. team: culture, hiring. ~15%.

### work
1. steady-work: recurring bookings from verified hosts, not one-off gigs. ~45%.
2. control: you pick the work, accept, do it, get paid. ~30%.
3. grow: offer more human services over time, earn more. ~25%.

### stay
1. monthly-life: stay a month not a night. ~50%.
2. quality: move in and just live. ~30%.
3. host-rooted: longer stays work for everyone. ~20%.

## 5. Angle taxonomy

Seed angles mapped to pillars. Use the existing brief angle field. Extend as performance data comes in.

- midnight-message (host / relief): the 11.47pm guest question, Hostie answers while you sleep
- second-job (host / proof-trust): passive income became a second job, the third path
- meet-hostie (host / runs-itself): Hostie first person, restrained, no mascot energy
- day-reclaimed (host / relief): what you do with the hours you get back
- hands (host or company / category, moat): dashboard that talks vs hands that do
- once-upon-a-time (company / thesis): the fragmented market story, the invisible hand finally named
- three-sides (company / thesis): hosts, providers, guests, one ecosystem
- full-calendar (work / steady-work): a week of dependable bookings
- you-choose (work / control): see the job, choose it, get paid
- do-more-earn-more (work / grow): greeting, tours, human services
- month-not-night (stay / monthly-life): between a holiday and a lease
- just-live (stay / quality): wifi, desk, bed, ready when you arrive

## 6. Funnel stages

Tag the primary stage in the brief prose. One primary stage per creative.

- reach: hook-first, works for non-followers, no context assumed
- follow: introduces who we are, gives a reason to stick around
- engage: save/send-worthy substance. Design test: would one host send this to another host
- convert: drives profile tap, link click, sign-up. Clear single CTA

## 7. Voice notes beyond qa.mjs

qa.mjs enforces the hard rules. Aim right before the gate:

- on-image text: minimal or no punctuation, short, one idea
- captions: plain, operational, empathetic, restrained, specific
- Hostie speaks first person in the same brand voice. Competent colleague, never cute, never a mascot
- Stay future concepts (Flex, Pass, Trips, guest portal) are off-limits in creatives
- story over features. If a draft reads like a PMS feature list, kill it and restart from the persona's moment of pain or relief
- reference tone: Casa (emotional headlines, mono-focus), Airbnb (host warmth), Wander (aspirational restraint). Anti-reference: generic PMS feature-card tone

## 8. Caption policy per account (for hububb-caption)

- host: first line is the emotional hook, caption expands the story, single CTA at most. 3-5 specific hashtags.
- company: first line states the thesis or milestone plainly. 2-4 hashtags.
- work: first line is the concrete benefit. Plain instructions, no hype. 3-5 hashtags.
- stay: first line is the lifestyle image. Soft, no hard CTA while dormant. 3-5 hashtags.
- never hashtag walls, never trending-hijack tags. Specific beats broad.

## 9. What to log for the paid phase

Per shipped creative: angle, pillar, funnel (from brief prose), template, format, and once live the saves, sends, link clicks, attributed sign-ups (hand-edited into data/creative-memory.json performance and learning fields). Two angles reliably driving sign-ups is the trigger condition for Q3 paid.
