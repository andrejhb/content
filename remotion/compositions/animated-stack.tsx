import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { VideoInputProps } from "../root";
import { interVars } from "./font";

// Motion take on the stack template: the photo drifts in under a slow Ken Burns
// push, the wordmark fades on, the pile lands as one collapsed card and fans
// open downward, then the headline, subhead and CTA stagger up. Same layout math
// and scrim as components/templates/stack.
//
// The fan is the whole idea: the cards start stacked on top of each other and
// spread, which is how iOS opens a collapsed notification group. Springing each
// card in separately instead reads as four things arriving, not one pile opening.

const MINT = "#b2ffea";

function DoneTick({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill={MINT} />
      <path
        d="M4.6 8.2l2.3 2.3 4.5-4.7"
        stroke="#0d0d0d"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AnimatedStack({ brief, baseUrl }: VideoInputProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h, durationInFrames } = useVideoConfig();
  const c = brief.copy;
  const landscape = w > h;
  const tall = w / h <= 0.6;
  const min = Math.min(w, h);
  const pad = Math.round(min * 0.085);
  const compact = brief.compactHead;
  const head = Math.round(
    Math.min(w, h * 1.05) *
      (landscape ? 0.05 : tall ? (compact ? 0.058 : 0.082) : compact ? 0.052 : 0.062),
  );
  const sub = Math.round(w * 0.027);
  const ctaH = Math.round(min * 0.075);
  const logoH = Math.round(min * 0.044);

  const maxDepth = h / w >= 1.15 ? 4 : 3;
  const cards = (c.notifications ?? []).slice(0, maxDepth);

  const cardW = Math.round(w * (landscape ? 0.46 : 0.8));
  const cardPad = Math.round(min * 0.03);
  const icon = Math.round(min * 0.062);
  const title = Math.round(min * 0.027);
  const body = Math.round(min * 0.024);
  const metaFs = Math.round(min * 0.021);
  const cardH = Math.max(icon, Math.round(title * 1.25) + Math.round(body * 1.4)) + cardPad * 2;
  const radius = Math.round(cardH * 0.24);
  const step = Math.round(cardH * 0.72);
  const stackH = cardH + step * Math.max(0, cards.length - 1);
  const textMax = landscape ? Math.round(w * 0.5) : cardW;

  const cardShadow =
    `0 ${Math.round(min * 0.002)}px ${Math.round(min * 0.006)}px rgba(0,0,0,0.10), ` +
    `0 ${Math.round(min * 0.016)}px ${Math.round(min * 0.038)}px rgba(0,0,0,0.22)`;

  const topScrim =
    brief.topScrim === true
      ? "linear-gradient(180deg, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.3) 34%, rgba(0,0,0,0) 62%)"
      : "linear-gradient(180deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.2) 34%, rgba(0,0,0,0) 62%)";
  const bottomScrim =
    "linear-gradient(0deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.72) 30%, rgba(0,0,0,0.42) 55%, rgba(0,0,0,0.12) 75%, rgba(0,0,0,0) 88%)";

  const src = brief.image
    ? brief.image.startsWith("http")
      ? brief.image
      : `${baseUrl}${brief.image}`
    : null;

  const kbScale = interpolate(frame, [0, durationInFrames], [1.05, 1.14], {
    extrapolateRight: "clamp",
  });

  const rise = (delaySec: number) =>
    spring({ frame: frame - Math.round(fps * delaySec), fps, config: { damping: 200 } });

  const logoIn = rise(0.1);
  const stackIn = rise(0.45);
  // Drives the whole pile open at once, so it reads as one deck spreading.
  const fan = rise(0.8);
  const headIn = rise(1.5);
  const subIn = rise(1.75);
  const ctaIn = rise(2.0);

  const upFrom = (p: number, px: number) => `translateY(${interpolate(p, [0, 1], [px, 0])}px)`;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0d0d", ...interVars }}>
      {src ? (
        <AbsoluteFill style={{ transform: `scale(${kbScale})` }}>
          <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      ) : null}
      {brief.dim ? (
        <AbsoluteFill style={{ background: `rgba(0,0,0,${brief.dim})` }} />
      ) : null}
      <AbsoluteFill style={{ background: [topScrim, bottomScrim].join(", ") }} />

      <AbsoluteFill
        style={{
          padding: pad,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: Math.round(h * 0.045),
          }}
        >
          {brief.brandMark ? (
            <Img
              src={`${baseUrl}/asset/shared/logos/hububb-wordmark.svg`}
              style={{
                height: logoH,
                width: "auto",
                filter: "brightness(0) invert(1)",
                opacity: logoIn,
              }}
            />
          ) : null}

          <div
            style={{
              position: "relative",
              width: cardW,
              height: stackH,
              opacity: stackIn,
              transform: upFrom(stackIn, Math.round(min * 0.03)),
              maskImage: "linear-gradient(180deg, #000 58%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(180deg, #000 58%, transparent 100%)",
            }}
          >
            {cards
              .map((n, d) => ({ n, d }))
              .reverse()
              .map(({ n, d }) => (
                <div
                  key={`${n.title}-${d}`}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    height: cardH,
                    display: "flex",
                    alignItems: "center",
                    transform: `translateY(${step * d * fan}px) scale(${1 - d * 0.055 * fan})`,
                    zIndex: cards.length - d,
                    opacity: 1 - d * 0.16 * fan,
                    filter: d === 0 ? undefined : `blur(${(min * 0.0013 * d * fan).toFixed(1)}px)`,
                    gap: Math.round(cardPad * 0.72),
                    paddingLeft: cardPad,
                    paddingRight: cardPad,
                    borderRadius: radius,
                    background: "#ffffff",
                    boxShadow: cardShadow,
                  }}
                >
                  <div
                    style={{
                      width: icon,
                      height: icon,
                      flexShrink: 0,
                      borderRadius: Math.round(icon * 0.24),
                      overflow: "hidden",
                      background: n.icon ? undefined : "#111111",
                    }}
                  >
                    {n.icon ? (
                      <Img
                        src={`${baseUrl}${n.icon}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : null}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      minWidth: 0,
                      gap: Math.round(min * 0.005),
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        minWidth: 0,
                        gap: Math.round(min * 0.009),
                      }}
                    >
                      <span
                        style={{
                          fontSize: title,
                          fontWeight: 600,
                          color: "#111111",
                          letterSpacing: "-0.01em",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {n.title}
                      </span>
                      <DoneTick size={Math.round(title * 0.72)} />
                    </div>
                    {n.text ? (
                      <span
                        style={{
                          fontSize: body,
                          lineHeight: 1.35,
                          color: "rgba(17,17,17,0.68)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {n.text}
                      </span>
                    ) : null}
                  </div>

                  {n.meta ? (
                    <span
                      style={{
                        fontSize: metaFs,
                        color: "rgba(17,17,17,0.45)",
                        flexShrink: 0,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {n.meta}
                    </span>
                  ) : null}
                </div>
              ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: Math.round(head * 0.4),
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              maxWidth: textMax,
              gap: Math.round(head * 0.26),
            }}
          >
            <h1
              style={{
                fontSize: head,
                lineHeight: 1.2,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "#ffffff",
                margin: 0,
                opacity: headIn,
                transform: upFrom(headIn, Math.round(min * 0.028)),
              }}
            >
              <span>{c.headline}</span>
              {c.headlineTail ? (
                <>
                  <br />
                  <span>{c.headlineTail}</span>
                </>
              ) : null}
            </h1>
            {c.subhead ? (
              <p
                style={{
                  fontSize: sub,
                  lineHeight: 1.4,
                  color: "#ffffff",
                  maxWidth: Math.round(textMax * 0.9),
                  margin: 0,
                  opacity: subIn,
                  transform: upFrom(subIn, Math.round(min * 0.022)),
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
                opacity: ctaIn,
                transform: upFrom(ctaIn, Math.round(min * 0.018)),
              }}
            >
              {c.ctaIcon ? (
                <Img
                  src={`${baseUrl}${c.ctaIcon}`}
                  style={{ height: Math.round(ctaH * 0.42), width: "auto" }}
                />
              ) : null}
              {c.cta}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
