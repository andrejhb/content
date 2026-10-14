# social

Copy plans for the four Instagram accounts, and the taste library that keeps them good. Written by the `hububb-posts` skill (`.claude/skills/hububb-posts/`).

```
social/
  plans/     one markdown file per request: 3 to 5 posts, each with on-image copy,
             hook variants, caption pack, visual direction, strategy tags
  golden/    the golden examples library: approved posts per account + rejected.md
```

## Ask for posts

Plain language works. Examples:

- "give me 4 posts for host"
- "3 posts for stay, all carousels"
- "one post per account this week"
- "5 host posts about the 90-night cap, with paid cuts"
- "a reel script for work about clear job briefs"

No account means host. No count means 4. No formats means a mix (at least one carousel, one static, one reel). Organic by default; say "paid" for Meta ad fields.

## React to a plan

- `golden 2` (plus why): post 2 goes into `golden/<account>.md` with your reason, word for word.
- `3 is slop because ...`: goes into `golden/rejected.md`; future plans avoid the pattern.
- `redo 3`: another take with a different mechanic.
- `paid cut for 1` / `story cut for 2`: adds that block to the post.
- `promote 4`: hands the post to the engine (`hububb-creative`), Paper, or HyperFrames per its build route.

The golden library is the quality bar. Every plan is benchmarked against it, so the more you mark, the closer the first draft lands.

## Sources the skill reads

- `docs/strategy-context.md`: objective, pillars, funnel, caption policy
- `products/<slug>/product-marketing.md`, `qa.json`, `personas/`: product truth and proof
- `research/meta-ads-library/`: Blueground and six competitors' Meta ads, Oct 2026
- `research/paper-references/analysis.md`: the team's feedback on the Host and Stay Paper drafts
