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

// A carousel product slide for @wearehububb, one of "the three forms". A
// generated clip fills the frame under a left scrim; the product name lands
// vibrant, holds ~1s, then dims to muted as its one-line tagline lights up just
// below. Same two-tone reveal as the launch greeting, left-aligned and centred
// vertically over the clip.

const BG_PORTRAIT = "/asset/general/clips/spotlight-portrait.mp4";
const BG_WIDE = "/asset/general/clips/spotlight-wide.mp4";

export function LaunchForm({ brief, baseUrl }: VideoInputProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h, durationInFrames } = useVideoConfig();
  const c = brief.copy;
  const m = Math.min(w, h);
  const landscape = w > h;
  const tall = h >= w * 1.5;
  const dark = brief.variant !== "light";

  const pad = Math.round(m * 0.078);
  // Name and tagline read at one size (like the greeting). Sized so a longer
  // tagline wraps to two lines without crowding.
  const headPx = Math.round(Math.min(w, h * 1.05) * (landscape ? 0.072 : 0.083));
  const mark = Math.round(m * (landscape ? 0.058 : 0.072));
  const textMaxW = landscape ? 0.62 * w : 0.84 * w;

  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.06]);

  // Left scrim keeps the left-aligned type readable wherever the background is
  // busy; a soft top scrim protects the logo. The light variant uses a white wash
  // so dark ink reads over a bright photo.
  const leftScrim = dark
    ? "linear-gradient(to right, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.84) 38%, rgba(0,0,0,0.46) 64%, rgba(0,0,0,0) 88%)"
    : "linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.92) 38%, rgba(255,255,255,0.52) 64%, rgba(255,255,255,0) 88%)";
  const topScrim = dark
    ? "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.34) 18%, rgba(0,0,0,0) 40%)"
    : "linear-gradient(to bottom, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.42) 18%, rgba(255,255,255,0) 40%)";

  const enterAt = (delay: number, rise = m * 0.03) => {
    const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
    return { s, style: { opacity: s, transform: `translateY(${interpolate(s, [0, 1], [rise, 0])}px)` } };
  };

  // The name lands, holds ~1s, then dims as the tagline arrives beneath it.
  const introDelay = Math.round(fps * 0.35);
  const tailDelay = Math.round(fps * 1.35);
  const intro = enterAt(introDelay, m * 0.03);
  const tail = enterAt(tailDelay, m * 0.04);
  const vibrancy = interpolate(frame, [tailDelay, tailDelay + Math.round(fps * 0.5)], [1, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lineStyle = {
    fontSize: headPx,
    letterSpacing: "-0.03em",
    color: dark ? "#ffffff" : "#141414",
  } as const;

  return (
    <AbsoluteFill className={`${dark ? "bg-mono-20 text-mono-1" : "bg-mono-1 text-mono-21"} font-sans`} style={interVars}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        {(() => {
          const src = `${baseUrl}${brief.image ?? (landscape ? BG_WIDE : BG_PORTRAIT)}`;
          const mediaStyle = {
            width: "100%",
            height: "100%",
            objectFit: "cover" as const,
            transform: `scale(${zoom})`,
          };
          // A supplied still (png/jpg/webp) renders as an image under the same slow
          // zoom; a clip plays looped. Mirrors launch-hello's CardMedia fallback.
          return /\.(mp4|webm|mov)$/i.test(src) ? (
            <LoopedVideo src={src} playbackRate={0.8} style={mediaStyle} />
          ) : (
            <Img src={src} style={mediaStyle} />
          );
        })()}
      </AbsoluteFill>

      <AbsoluteFill style={{ background: leftScrim }} />
      <AbsoluteFill style={{ background: topScrim }} />

      {brief.brandMark ? (
        <div className="absolute" style={{ left: pad, top: pad, ...enterAt(Math.round(fps * 0.12)).style }}>
          <Img
            src={`${baseUrl}/asset/shared/logos/hububb-wordmark.svg`}
            alt="Hububb"
            style={{ height: mark, width: "auto", filter: dark ? "brightness(0) invert(1)" : undefined }}
          />
        </div>
      ) : null}

      <div
        className="absolute flex flex-col justify-center"
        style={{ left: pad, top: 0, bottom: 0, width: textMaxW, gap: Math.round(headPx * 0.14) }}
      >
        {c.headline ? (
          <span
            className="font-semibold tracking-tight"
            style={{ ...lineStyle, lineHeight: 1.02, opacity: intro.s * vibrancy, transform: intro.style.transform }}
          >
            {c.headline}
          </span>
        ) : null}
        {c.headlineTail ? (
          <span
            className="font-semibold tracking-tight"
            style={{ ...lineStyle, lineHeight: 1.06, ...tail.style }}
          >
            {c.headlineTail}
          </span>
        ) : null}
      </div>
    </AbsoluteFill>
  );
}
