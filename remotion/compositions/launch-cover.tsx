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
import { LoopedVideo } from "./looped-video";

// Carousel cover for @wearehububb. One quiet line, the thesis of the whole
// swipe, sits left-aligned and low on the frame. A small swipe hint nudges in
// the bottom-right, inviting the reveal of the forms that follow. By default it
// is the calm monochrome brand field (no imagery); when the brief supplies an
// `image` (a still or a clip), the cover goes cinematic: the media fills the
// frame under a slow zoom and a bottom-weighted scrim, and the type reads white
// over it. Same left-aligned, low-set line and swipe hint either way.

export function LaunchCover({ brief, baseUrl }: VideoInputProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h, durationInFrames } = useVideoConfig();
  const c = brief.copy;
  const m = Math.min(w, h);
  const dark = brief.variant !== "light";
  const tall = h >= w * 1.5;
  const hasMedia = Boolean(brief.image);

  const bg = dark ? "bg-mono-20" : "bg-mono-1";
  // Over a scrimmed cinematic background the lead line always reads white (dark
  // variant) or ink (light variant), same as the empty-field cover.
  const mainText = dark ? "text-mono-1" : "text-mono-21";
  const glow = dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.05)";
  const mutedCol = dark
    ? hasMedia ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.5)"
    : hasMedia ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.45)";

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

  // Cinematic background (optional): the supplied still/clip fills the frame
  // under a slow zoom. A bottom-weighted scrim carries the low-set line and the
  // swipe hint; a soft top scrim protects the wordmark. Dark variant darkens,
  // light variant washes white so the ink still reads.
  const mediaSrc = `${baseUrl}${brief.image ?? ""}`;
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.05]);
  const bottomScrim = dark
    ? "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.8) 22%, rgba(0,0,0,0.5) 44%, rgba(0,0,0,0.24) 62%, rgba(0,0,0,0.08) 80%, rgba(0,0,0,0) 100%)"
    : "linear-gradient(to top, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.82) 22%, rgba(255,255,255,0.52) 44%, rgba(255,255,255,0.26) 62%, rgba(255,255,255,0.09) 80%, rgba(255,255,255,0) 100%)";
  const topScrim = dark
    ? "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.3) 15%, rgba(0,0,0,0) 36%)"
    : "linear-gradient(to bottom, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.42) 15%, rgba(255,255,255,0) 36%)";

  // Two-tone reveal matching the product slides: the lead line lands vibrant,
  // holds ~1s, then dims to muted as the tail line lights up beneath it.
  const intro = enterAt(0.35);
  const tail = enterAt(1.35, m * 0.04);
  const tailDelayF = Math.round(fps * 1.35);
  const vibrancy = interpolate(frame, [tailDelayF, tailDelayF + Math.round(fps * 0.5)], [1, 0.42], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className={`${bg} ${mainText} font-sans`} style={interVars}>
      {hasMedia ? (
        <>
          <AbsoluteFill style={{ overflow: "hidden" }}>
            {/\.(mp4|webm|mov)$/i.test(mediaSrc) ? (
              <LoopedVideo src={mediaSrc} playbackRate={0.8} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
            ) : (
              <Img src={mediaSrc} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
            )}
          </AbsoluteFill>
          <AbsoluteFill style={{ background: bottomScrim }} />
          <AbsoluteFill style={{ background: topScrim }} />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(120% 90% at 50% 55%, ${glow} 0%, rgba(255,255,255,0) 60%)` }}
        />
      )}

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
          <span className="font-semibold tracking-tight" style={{ ...lineStyle, opacity: intro.s * vibrancy, transform: intro.style.transform }}>
            {c.headline}
          </span>
        ) : null}
        {c.headlineTail ? (
          <span className="font-semibold tracking-tight" style={{ ...lineStyle, ...tail.style }}>
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
