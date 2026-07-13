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
  const head = Math.round(
    Math.min(w, h * 1.05) * (landscape ? 0.06 : tall ? 0.096 : 0.072),
  );
  const sub = Math.round(w * 0.027);
  const textMax = landscape
    ? Math.round(w * 0.5)
    : tall
      ? Math.round(w * 0.78)
      : Math.round(w * 0.86);
  const ctaH = Math.round(min * 0.075);
  const logoH = Math.round(min * 0.044);

  const scrim = [
    "linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.7) 42%, rgba(0,0,0,0.36) 72%, rgba(0,0,0,0.1) 100%)",
    "linear-gradient(0deg, rgba(0,0,0,0.46) 0%, rgba(0,0,0,0) 48%)",
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
      <div className="absolute inset-0" style={{ background: scrim }} />

      <div className="absolute" style={{ top: pad, left: pad }}>
        <BrandMark height={logoH} invert variant="wordmark" />
      </div>

      <div
        className="absolute inset-0 flex flex-col justify-center"
        style={{ padding: pad, gap: Math.round(head * 0.5) }}
      >
        <div className="flex flex-col" style={{ maxWidth: textMax, gap: Math.round(head * 0.28) }}>
          {c.eyebrow ? (
            <span
              style={{
                fontSize: eye,
                fontWeight: 500,
                letterSpacing: "0.01em",
                color: "rgba(255,255,255,0.66)",
              }}
            >
              {c.eyebrow}
            </span>
          ) : null}
          <h1
            className="font-semibold tracking-tight text-balance"
            style={{ fontSize: head, lineHeight: 1.04 }}
          >
            {c.rotating && c.rotating.length ? (
              // A still can't rotate — show the last message (matches the video poster).
              <span>{c.rotating[c.rotating.length - 1]}</span>
            ) : (
              <>
                <span>{c.headline}</span>
                {c.headlineTail ? (
                  <span style={{ color: "rgba(255,255,255,0.62)" }}> {c.headlineTail}</span>
                ) : null}
              </>
            )}
          </h1>
          {c.subhead ? (
            <p
              style={{
                fontSize: sub,
                lineHeight: 1.4,
                color: "rgba(255,255,255,0.82)",
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
