# Plan format

Every plan is one markdown file at `social/plans/YYYY-MM-DD-<account>-<short-slug>.md` (`mixed` for several accounts). Use this structure exactly so plans stay comparable and feedback can point at "post 3". The display order below is fixed even though you write the rationale last.

Omit a block only where marked optional. Keep on-image copy in blockquotes with one line per visual line, so line breaks are unambiguous.

````markdown
# <handle, or handles joined by commas> · <theme or "open brief"> · <date>

**Request:** "<the user's words>"

**Assumptions:**
- <3 to 6 short bullets: count, accounts, formats, channel, theme, anything you decided>
- <if any paid cut: "Paid cuts are ready copy, not a recommendation to spend.">

**Golden benchmarks used:** <entry ids, or "none yet for <account>">
**Truth flags:** <every flag from the posts below in one line each, or "none">

| # | Account | Format | Pillar | Funnel | Persona | Angle | Headline |
|---|---|---|---|---|---|---|---|
| 1 | host | Carousel · 4 slides | longer-stays | reach | evenings-host | fills-in-blocks | Longer stays anchor the year |
| ... |

---

## 1 · <working title>

`status: draft` · `account: host` · `format: carousel, 4 slides, 4:5` · `pillar: longer-stays` · `funnel: reach` · `persona: evenings-host` · `angle: <angle>`

**The moment:** <one sentence: who, where, when, what is happening>

**Why it works:** <one line; the mechanic used and the golden entry it was benchmarked against>

**Truth flag:** <only if something needs sign-off before it ships; omit the line otherwise>

### On-image

<Static>
> Headline line 1
> Headline line 2
>
> Subhead line
>
> [CTA pill]

<Carousel: one block per slide>
**Slide 1 · hook**
> ...

**Slide 2 · mechanism**
> ...

<Reel: a beat table>
| Time | On screen | Picture | Move |
|---|---|---|---|
| 0.0 to 1.8s | ... | ... | cut |

Text shown inside a phone or UI card (reels and statics that show the product), quoted exactly:
> Guest · 11.38pm: ...
> Hostie · 11.38pm: ...

### Hook variants
1. <alt headline> · <mechanic>
2. <alt headline> · <mechanic>
3. <optional>

### Visual direction
- **Frame:** ...
- **Image:** ...
- **Proof device:** ...
- **Type:** ...
- **Motion:** ... (reels and animated posts only)
- **Assets:** `products/host/assets/...` (what it actually shows · real, stock, or generated) · or **Source:** ...
- **Build route:** ...

### Caption
**First line:** ...

<body, short paragraphs>

**Hashtags:** #one #two #three

### Paid cut (optional, only when asked)
- **Primary text:** ...
- **Headline:** ...
- **Description:** ...
- **CTA button:** Learn More
- **Alt visuals:** ...

### Story cut (optional, only when asked)
> ...

---

## 2 · ...
````

## Status values

`draft` (new), `golden` (added to the library), `rejected` (added to rejected.md), `promoted` (handed to a build route), `redo` (rewritten; previous take kept below a "Previous take" line).
