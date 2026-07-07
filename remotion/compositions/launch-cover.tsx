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

// Carousel cover for @wearehububb. One quiet line, the thesis of the whole
// swipe, sits left-aligned and low on the frame over the monochrome brand
// field. A small swipe hint nudges in the bottom-right, inviting the reveal of
// the three forms that follow. No imagery; the calm before the products.

export function LaunchCover({ brief, baseUrl }: VideoInputProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const c = brief.copy;
  const m = Math.min(w, h);
  const dark = brief.variant !== "light";
  const tall = h >= w * 1.5;

  const bg = dark ? "bg-mono-20" : "bg-mono-1";
  const mainText = dark ? "text-mono-1" : "text-mono-21";
  const glow = dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.05)";
  const mutedCol = dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";

  const pad = Math.round(m * 0.085);
  const headPx = Math.round(Math.min(w, h * 1.05) * (tall ? 0.106 : 0.1));
  const mark = Math.round(m * (tall ? 0.085 : 0.068));
  const textMaxW = 0.9 * w;
  const headBottom = Math.round(h * (tall ? 0.13 : 0.15));
  const swipeBottom = Math.round(h * 0.055);
  const sw = Math.round(headPx * 0.32);

  const enterAt = (delaySec: number, rise = m * 0.03) => {
    const s = spring({ frame: frame - Math.round(fps * delaySec), fps, config: { damping: 200 } });
    return { s, style: { opacity: s, transform: `translateY(${interpolate(s, [0, 1], [rise, 0])}px)` } };
  };

  // A gentle, continuous rightward nudge on the arrow.
  const nudge = Math.sin((frame / fps) * Math.PI * 1.4) * (m * 0.01);
  const swipeIn = enterAt(1.5).s;

  const lineStyle = {
    fontSize: headPx,
    lineHeight: 1.06,
    letterSpacing: "-0.03em",
    maxWidth: textMaxW,
  } as const;

  return (
    <AbsoluteFill className={`${bg} ${mainText} font-sans`} style={interVars}>
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(120% 90% at 50% 55%, ${glow} 0%, rgba(255,255,255,0) 60%)` }}
      />

      {brief.brandMark ? (
        <div className="absolute" style={{ left: pad, top: pad, ...enterAt(0.1).style }}>
          <Img
            src={`${baseUrl}/asset/shared/logos/hububb-wordmark.svg`}
            alt="Hububb"
            style={{ height: mark, width: "auto", filter: dark ? "brightness(0) invert(1)" : undefined }}
          />
        </div>
      ) : null}

      <div
        className="absolute flex flex-col"
        style={{ left: pad, right: pad, bottom: headBottom, gap: Math.round(headPx * 0.06) }}
      >
        {c.headline ? (
          <span className="font-semibold tracking-tight" style={{ ...lineStyle, ...enterAt(0.35).style }}>
            {c.headline}
          </span>
        ) : null}
        {c.headlineTail ? (
          <span className="font-semibold tracking-tight" style={{ ...lineStyle, ...enterAt(0.55).style }}>
            {c.headlineTail}
          </span>
        ) : null}
      </div>

      <div
        className="absolute flex items-center font-medium"
        style={{
          right: pad,
          bottom: swipeBottom,
          gap: Math.round(sw * 0.5),
          color: mutedCol,
          fontSize: sw,
          letterSpacing: "0.04em",
          opacity: swipeIn,
        }}
      >
        <span>Swipe</span>
        <svg
          width={Math.round(sw * 1.15)}
          height={Math.round(sw * 1.15)}
          viewBox="0 0 24 24"
          fill="none"
          style={{ transform: `translateX(${nudge}px)` }}
        >
          <path
            d="M4 12h15M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
}
