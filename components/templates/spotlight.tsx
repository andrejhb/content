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
  const sub = Math.round(w * 0.024);
  const textMax = landscape
    ? Math.round(w * 0.5)
    : tall
      ? Math.round(w * 0.78)
      : Math.round(w * 0.86);
  const ctaH = Math.round(min * 0.075);
  const logoH = Math.round(min * 0.044);

  const scrim = [
    "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.52) 42%, rgba(0,0,0,0.2) 72%, rgba(0,0,0,0) 100%)",
    "linear-gradient(0deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0) 42%)",
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
                  <span style={{ color: "rgba(255,255,255,0.5)" }}> {c.headlineTail}</span>
                ) : null}
              </>
            )}
          </h1>
          {c.subhead ? (
            <p
              style={{
                fontSize: sub,
                lineHeight: 1.4,
                color: "rgba(255,255,255,0.66)",
                maxWidth: Math.round(textMax * 0.92),
              }}
            >
              {c.subhead}
            </p>
          ) : null}
        </div>

        {c.cta ? (
          <div
            style={{
              display: "inline-flex",
              width: "fit-content",
              alignItems: "center",
              height: ctaH,
              paddingLeft: Math.round(min * 0.045),
              paddingRight: Math.round(min * 0.045),
              borderRadius: 9999,
              background: "#ffffff",
              color: "#111111",
              fontWeight: 600,
              fontSize: Math.round(w * 0.022),
            }}
          >
            {c.cta}
          </div>
        ) : null}
      </div>
    </CreativeCanvas>
  );
}
