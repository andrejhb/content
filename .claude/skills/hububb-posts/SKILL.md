---
name: hububb-posts
description: Generate a plan of 3 to 5 Instagram posts (statics, carousels, reels, stories) for any Hububb account, each with on-image copy, hook variants, a caption pack, directional visual notes with real asset pointers, and strategy tags, benchmarked against the golden examples library. Use when the user says "generate copy for posts", "give me 3-5 posts", "post ideas for @hububbhost", "content for Instagram", "carousel copy", "reel script", "run hububb-posts", or wants social copy before anything is designed. Also handles feedback on a plan ("golden 2", "3 is slop because...", "paid cut for 1", "promote 4").
metadata:
  version: 1.1.0
---

# hububb-posts

The copywriting harness for Hububb's four Instagram accounts. One request in, one **post plan** out: a markdown file in `social/plans/` with every post written and directed, ready for a designer, Paper, or the engine.

This skill writes copy and direction. It does not render. Rendering stays with `hububb-creative` (engine) or Paper; captions for an already-rendered creative stay with `hububb-caption`.

Quality comes from one place: **the golden examples library** (`social/golden/`). It holds posts the user approved and patterns they rejected, in their own words. Every plan is written against it and benchmarked against it. It starts small and grows from feedback on each plan.

## Accounts

The account key is the product slug. Use it everywhere: tags, golden file names, entry ids.

| account key | handle | golden file |
|---|---|---|
| `host` | @hububbhost | `social/golden/host.md` |
| `general` | @wearehububb (the company account) | `social/golden/general.md` |
| `stay` | @hububbstay | `social/golden/stay.md` |
| `work` | @hububbwork | `social/golden/work.md` |

## 1. Read the request

Pull out, without asking:
- **Count**: what they said; "3-5" or nothing means 4.
- **Account(s)**: named account(s); nothing means `host` (strategy default); "all accounts" means one post per account (or spread a larger count by the effort split in `docs/strategy-context.md` section 2).
- **Formats**: what they said; otherwise a mix with at least one carousel, one static, and one reel (with fewer than 3 posts, pick the formats that fit). Fits: `general` suits reels and carousels (the thesis needs motion or sequence); `host` suits all; `stay` suits statics and carousels (aspirational stills); `work` suits carousels (a job explained step by step). A post with a paid cut is usually a static. A story is a cut of another post unless asked for on its own.
- **Channel**: organic. If they say "paid", "ads", or "ad copy", the posts they name get a paid cut. Strategy says no paid spend until the London cohort converts, so the plan header carries one line: "Paid cuts are ready copy, not a recommendation to spend."
- **Theme**: a campaign, angle, moment, or feature if they gave one; otherwise you pick angles from the strategy.

Ask one question only when a missing answer would waste the whole plan (for example they name a campaign you cannot find anywhere). Otherwise state your assumptions in the plan header and go.

## 2. Load context (in this order)

1. **Taste first.** `social/golden/<account>.md` for each account in play, and `social/golden/rejected.md`. Read every entry. These outrank any general rule below when they conflict.
2. **Strategy.** `docs/strategy-context.md`: pillars and weights (section 4), angle taxonomy (5), funnel stages (6), voice (7), caption policy (8).
3. **Product truth.** `products/<slug>/product-marketing.md`, `products/<slug>/qa.json` (`allowedProofClaims`, `siblingCapabilities`, `unbuiltFeatures`, `competitors`), and the persona files in `products/<slug>/personas/` (skip any persona with empty sections).
4. **Craft.** `references/craft.md` (copy mechanics, format rules, captions, paid cut, truth guardrails) and `references/visual-direction.md` (art direction, per-account looks, asset map, build routes).

**When sources disagree on product truth:** `references/craft.md` section 8 wins, then `product-marketing.md`, then the persona files. Personas give you the situation (who, where, what hurts, their words), never product claims.

5. **Recency.** Do not repeat an angle, headline, or image the account has already used:
   - the last three plans for the account in `social/plans/` (ignore any plan dated today that you did not write);
   - shipped and drafted creatives: headlines and images in `creatives/*/brief.json` for the same `product` (`copy`, `social`, `image`, `images` fields);
   - the team's Paper drafts: `research/paper-references/analysis.md` sections 2 to 5.
6. **Assets.** Before naming any image, run the contact sheet over the folders you might use (`node scripts/contact-sheet.mjs <scratchpad>/sheet.png <dir> ...`) and read the asset map in `references/visual-direction.md` section 8. Filenames do not always match what is in the picture.

## 3. Shape the set

Before writing any line, lay out the set as a table: post number, account, format, pillar, funnel stage, persona id, angle, the one idea in a sentence.

Set rules (apply per account; in a multi-account plan, each account's posts form their own set):
- One idea per post. Two posts never share both pillar and format.
- The account's lead pillar appears at least once (for `host` that is `longer-stays`). With one post for an account, use its lead pillar unless the theme says otherwise.
- With 4 or more posts for an account, touch at least three of reach, follow, engage, convert.
- Each post speaks to one named persona (by id) in one concrete moment: a time, a place, a chore, a number on their calendar. No moment, no post. For `general`, the moment belongs to the people on screen (a host, a guest, a cleaner); the persona is the viewer you are persuading.
- Angles come from strategy section 5. A new angle is allowed: name it, mark it `(new)`, and say which pillar it serves.
- Do not reuse an angle from the recency check unless the user asked for it.

## 4. Write each post

For each post, in this order:
1. **The moment.** One sentence, 30 words or fewer: who, where, when, what is happening. This is the raw material; the copy compresses it.
2. **Headline candidates.** Write at least six internally using different mechanics from `references/craft.md` section 2. Keep the strongest as the headline and 2 to 3 others as hook variants. Variants must differ in mechanic, not just wording. Count the words (craft section 3) before you keep one.
3. **On-image copy** per the format rules in `references/craft.md`: static (headline, subhead, CTA), carousel (slide by slide), reel (timed beat sheet with supers, plus any chat or UI text shown in the frame), story (frames).
4. **Visual direction** per `references/visual-direction.md`: frame, image, proof device, type, motion if any, then **assets** (verified paths, with what the picture actually shows and whether it is real, stock, or generated) and a **build route**. If no existing asset fits, say what to source and how, honestly.
5. **Caption pack**: first line, caption, hashtags, per `references/craft.md` section 5 and strategy section 8.
6. **Paid cut** only when asked: primary text, headline, description, CTA button.
7. **Tags, rationale, truth flags**: account, format, pillar, funnel, persona id, angle; one line on why it works, naming the golden entry or craft mechanic it is built on; and a truth flag for anything that needs sign-off before it ships (a legal hold, an unconfirmed claim, an asset that must not be used for paid).

Keep the plan skimmable: a reader should take in one post in under a minute. Assumptions are 3 to 6 short bullets. Each visual direction bullet is two lines at most.

## 5. Benchmark against golden (the quality gate)

For every post, set it beside the closest golden entry for that account and the rejected list, then check:
- **Specificity**: is the moment at least as concrete as the golden entry's? Count the nouns a reader could picture.
- **Economy**: headline word count within the golden range for that format, or within the craft ranges where golden has no entry of that format; no layer repeats another layer's phrasing.
- **Register**: would it sit naturally next to the golden entry on the grid? Same calm, same confidence, no hype.
- **Rejected patterns**: does it repeat anything in `rejected.md`, visually or verbally? If yes, rewrite.
- **Own-it test** (per post, copy and picture together): could a competitor post this unchanged? If yes, add what only Hububb, London, or this persona has: a place, a mechanism (longer stays, Hostie answering, the clean booked at checkout), a detail from the persona's life.

Anything weaker than its benchmark gets rewritten before the user sees it. Record the benchmark in the rationale line ("benchmarked against golden host/sunday-night: same done-card proof, fresher chore"). If the account's golden file is empty, benchmark against the craft rules and say so in the plan header.

## 6. Hard rules, then save

Brand law, not a separate gate. Before saving, check the whole plan:
- Sentence case, capital first letter. No exclamation marks. No em or en dashes anywhere, including captions and direction notes. Middots, colons, commas, full stops instead.
- No banned words (the `BANNED`, `CLICHES`, and `OPENERS` lists in `scripts/qa.mjs`).
- Proof only from the usable claims in `references/craft.md` section 8, verbatim. No sibling capabilities (mind the traps listed there), no unbuilt features, no competitor names.

Save to `social/plans/YYYY-MM-DD-<account>-<short-slug>.md` (use `mixed` for a multi-account plan) using the exact structure in `references/plan-format.md`. Then run the mechanical checks on the saved file and fix every hit in copy:

```bash
grep -nE '—|–|!' social/plans/<file>.md
grep -niwE 'seamless|powerful|revolutionary|innovative|empower|unlock|leverage|supercharge|robust|scalable|holistic|elevate|transform|solution|best-in-class|world-class|cutting-edge|effortless|effortlessly|delight your guests|grow your business|next level|hey there|did you know|looking to|are you tired of' social/plans/<file>.md
```

## 7. Report

In chat, keep it short: the plan path, then one line per post (number, account, format, headline), the assumptions, and any truth flags. Do not paste the whole plan. End with the feedback commands below so the user knows how to grow the library.

## Feedback commands

The user reacts to a plan in plain language. Map it:

- **"golden 2"**, "2 is great", "keep 2": append post 2 to `social/golden/<account>.md` using the entry format in that file. Ask for one line on why if they did not give one, and store it verbatim. Set the post's status line in the plan to `golden`.
- **"3 is slop"**, "kill 3 because...": append to `social/golden/rejected.md` with their reason verbatim and the pattern to avoid, generalised in one line. Set status to `rejected`. Rewrite the post only if they ask.
- **"redo 3"**, "another take on 3": rewrite in place with a different mechanic; keep the old version under a `Previous take` line.
- **"paid cut for 1"**: add the paid block to that post.
- **"story cut for 2"**: add a 9:16 story adaptation to that post.
- **"promote 4"**, "make 4": hand post 4 to the right build route. Engine: run `hububb-creative` with the post's angle, persona, on-image copy, and direction as the brief. Paper: follow the Paper route in `references/visual-direction.md`. Video: the result goes to Flask for review. Set status to `promoted`.

Golden and rejected entries are the user's words and choices. Never add an entry the user did not ask for, never edit their reason, and never delete one without being asked.

## Guardrails (hard)
- Organic by default. Paid fields only on request.
- Copy only. Never render, publish, schedule, or post anything.
- Truth: usable proof claims verbatim; Hostie answers guests automatically (never "drafts for you to review"); no occupancy guarantees; no prices until the user confirms the current price; the 90-night legal hold in `references/craft.md` section 8.
- Each account stays in its lane. Only `general` (@wearehububb) names all three products together.
- Real asset paths only, verified by looking. Never invent a path or imply a generated image is a real property, a real host, or a real worker.
