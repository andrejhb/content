import type { Brief } from "@/lib/creatives";
import { CreativeCanvas, BrandMark } from "./canvas";

// Spotlight: the Hosts-page CTA hero. A full-bleed background (a photo, or as a
// video a light moving clip) under a dark left-to-bottom scrim, with a two-tone
// headline (white lead + muted tail), a subhead, and an optional CTA pill.
// Always a dark hero. copy.cta present renders the pill; absent is the no-CTA
// variant. The animated version lives in remotion/compositions/animated-spotlight.
export function SpotlightTemplate({
  brief,
  w,
  h,
}: {
  brief: Brief;
  w: number;
  h: number;
}) {
  const c = brief.copy;
  const landscape = w > h;
  const tall = w / h <= 0.6; // 9:16 — bigger type, narrower measure so it wraps
  const min = Math.min(w, h);
  const pad = Math.round(min * 0.085);
  const eye = Math.round(w * 0.02);
  // compactHead: shrink the headline and widen its measure so a long headline
  // fits ~2 lines instead of sprawling.
  const compact = brief.compactHead;
  const head = Math.round(
    Math.min(w, h * 1.05) *
      (landscape ? (compact ? 0.05 : 0.06) : tall ? (compact ? 0.06 : 0.096) : compact ? 0.06 : 0.072),
  );
  const bottom = brief.spotAlign === "end";
  // Bottom-aligned pair: setup + payoff share headline size (Paper 90/275 still).
  const pair = bottom && !c.headlineTail;
  const sub = pair ? head : Math.round(w * 0.038);
  const textMax = landscape
    ? Math.round(w * (compact ? 0.55 : 0.5))
    : tall
      ? Math.round(w * (compact ? 0.96 : 0.78))
      : Math.round(w * (compact ? 0.94 : 0.86));
  const ctaH = Math.round(min * 0.075);
  const logoH = Math.round(min * 0.068);

  // opt-in top-down darkening for the top edge / brand mark. "soft" is a subtle
  // readability nudge; true is the fuller scrim.
  const topScrim =
    brief.topScrim === "soft"
      ? "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.12) 30%, rgba(0,0,0,0) 50%)"
      : brief.topScrim
        ? "linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.18) 34%, rgba(0,0,0,0) 55%)"
        : null;
  // Bottom-aligned copy uses a floor scrim so the photo stays open above.
  const scrim = bottom
    ? [
        "linear-gradient(0deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.38) 36%, rgba(0,0,0,0) 62%)",
        ...(topScrim ? [topScrim] : []),
      ].join(", ")
    : [
        "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.32) 40%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0) 100%)",
        "linear-gradient(0deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 44%)",
        ...(topScrim ? [topScrim] : []),
      ].join(", ");

  return (
    <CreativeCanvas w={w} h={h} className="bg-mono-21 text-mono-1">
      {brief.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brief.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      {brief.dim ? (
        // flat overlay to knock back a bright photo so white copy stays legible
        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${brief.dim})` }} />
      ) : null}
      <div className="absolute inset-0" style={{ background: scrim }} />

      <div className="absolute" style={{ top: pad, left: pad }}>
        <BrandMark height={logoH} invert variant="wordmark" />
      </div>

      <div
        className={`absolute inset-0 flex flex-col ${bottom ? "justify-end" : "justify-center"}`}
        style={{ padding: pad, gap: Math.round(head * 0.5) }}
      >
        <div className="flex flex-col" style={{ maxWidth: textMax, gap: Math.round(head * 0.28) }}>
          {c.eyebrow ? (
            <span
              style={{
                fontSize: eye,
                fontWeight: 500,
                letterSpacing: "0.01em",
                color: "#ffffff",
              }}
            >
              {c.eyebrow}
            </span>
          ) : null}
          <h1
            className="font-semibold tracking-tight text-balance"
            style={{
              fontSize: head,
              lineHeight: pair ? 1.19 : 1.2,
              letterSpacing: pair ? "-0.03em" : undefined,
              color: pair && !c.solid ? "rgba(255,255,255,0.5)" : "#ffffff",
            }}
          >
            {c.rotating && c.rotating.length ? (
              // A still can't rotate — show the last message (matches the video poster).
              <span>{c.rotating[c.rotating.length - 1]}</span>
            ) : (
              <>
                <span>{c.headline}</span>
                {c.headlineTail ? <span> {c.headlineTail}</span> : null}
              </>
            )}
          </h1>
          {c.subhead ? (
            <p
              style={{
                fontSize: sub,
                lineHeight: pair ? 1.19 : 1.4,
                letterSpacing: pair ? "-0.03em" : undefined,
                color: "#ffffff",
                fontWeight: pair ? 600 : 500,
                maxWidth: Math.round(textMax * 0.92),
              }}
            >
              {c.subhead}
            </p>
          ) : null}
        </div>

        {c.cta || c.proof ? (
          <div className="flex flex-col" style={{ gap: Math.round(head * 0.32) }}>
            {c.cta ? (
              <div
                style={{
                  display: "inline-flex",
                  width: "fit-content",
                  alignItems: "center",
                  gap: Math.round(min * 0.014),
                  height: ctaH,
                  paddingLeft: Math.round(min * (c.ctaIcon ? 0.038 : 0.045)),
                  paddingRight: Math.round(min * 0.045),
                  borderRadius: 9999,
                  background: "#ffffff",
                  color: "#111111",
                  fontWeight: 600,
                  fontSize: Math.round(w * 0.022),
                }}
              >
                {c.ctaIcon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.ctaIcon}
                    alt=""
                    style={{
                      height: Math.round(ctaH * 0.42),
                      width: "auto",
                    }}
                  />
                ) : null}
                {c.cta}
              </div>
            ) : null}
            {c.proof ? (
              // Bespoke chip: spotlight styles in white-alpha over the scrim,
              // not the mono tokens the shared ProofChip uses.
              <span
                className="font-mono"
                style={{
                  display: "inline-flex",
                  width: "fit-content",
                  alignItems: "center",
                  borderRadius: 9999,
                  border: "1px solid rgba(255,255,255,0.36)",
                  color: "rgba(255,255,255,0.85)",
                  fontSize: Math.round(w * 0.021),
                  letterSpacing: "0.01em",
                  padding: `${Math.round(w * 0.0095)}px ${Math.round(w * 0.021)}px`,
                }}
              >
                {c.proof}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </CreativeCanvas>
  );
}
