---
name: hububb-caption
description: Write the Instagram caption, first line, and hashtags for a rendered Hububb creative, in the same voice the QA gate enforces. Use when the user says "write the caption", "caption this creative", "run hububb-caption", or wants IG copy for a creative that already has a brief.json. Reads the creative's brief plus the strategy context, writes per-account on-brand caption copy, and can save it back into the brief's optional social block.
metadata:
  version: 1.0.0
---

# hububb-caption

Write the Instagram caption for a creative that already exists (`creatives/<id>/brief.json`). On-image copy is short by design; the caption is where the story lands. Match the brand voice exactly, keep it restrained, and tune the first line and hashtags to the account.

## Inputs
- A **creative id** (a folder under `creatives/`), or its `brief.json`.
- If none is given, ask which creative.

## Process

### 1. Read the context
- `creatives/<id>/brief.json`: the angle, persona, product, the on-image `copy`, and the `brief` prose (which carries the `pillar:` and `funnel:` tags).
- `docs/strategy-context.md`: sections 2 (accounts), 4 (pillars), and 8 (caption policy per account). The account follows from the product slug: host is host, general is company (@wearehububb), work is work, stay is stay.
- `products/<slug>/product-marketing.md` and `products/<slug>/qa.json`: positioning and `allowedProofClaims`. Only those proof claims may appear, verbatim. No other counts, ratings, revenue, or testimonials.

### 2. Write the caption
The same voice the QA gate enforces on-image, applied to longer copy:
- Sentence case. No exclamation marks. No em or en dashes. No banned words. No fabricated proof.
- Plain, operational, empathetic, restrained, specific. Story over features. Speak to the persona's moment of pain or relief, not a generic reader.
- Serve the one pillar named in the brief prose. Do not drift into another product's territory or claim a sibling's capabilities.
- Hostie, when it speaks, is first person in the same brand voice: a competent colleague, never cute, never a mascot.

### 3. Craft the first line
The first line is the only line visible before "more", so it has to earn the tap on its own. Per account (strategy-context.md section 8):
- host: the emotional hook.
- company (general): the thesis or milestone, stated plainly.
- work: the concrete benefit, no hype.
- stay: the lifestyle image, soft, no hard CTA while dormant.

### 4. Propose hashtags
Restrained and specific, never a wall, never trending-hijack tags. Per account (section 8): host 3-5, company 2-4, work 3-5, stay 3-5. Prefer specific over broad, drawn from the product's real audience and category (hosting, service work, mid-term stays) rather than generic reach tags or any banned/hype vocabulary.

### 5. Report, and optionally save
Show the user the first line, the full caption, and the hashtag set. If they want it saved, write an additive optional `social` block into the brief (nothing else reads it, so it never changes rendering or QA):

```json
"social": {
  "firstLine": "the one line visible before more",
  "caption": "the full caption",
  "hashtags": ["#specific", "#few"]
}
```

Merge it into the existing `brief.json`, preserving every other field and keeping 2-space JSON. This is a skill-authored write to a brief, the same path the creative pipeline uses; it is not an app write.

## Guardrails (hard)
- Voice: sentence case, no `!`, no em/en dashes, no banned words, no "all-in-one".
- Truth: only the product's `allowedProofClaims`, verbatim. No fabricated traction.
- One pillar per caption; never market a sibling product's capabilities.
- Hashtags: few and specific. Never hashtag walls, never trending-hijack tags.
- Stay stays soft while dormant: no hard CTA.
