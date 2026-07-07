import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { VideoInputProps } from "../root";
import { interVars } from "./font";

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

  const pad = Math.round(m * 0.078);
  // Name and tagline read at one size (like the greeting). Sized so a longer
  // tagline wraps to two lines without crowding.
  const headPx = Math.round(Math.min(w, h * 1.05) * (landscape ? 0.066 : 0.078));
  const mark = Math.round(m * (landscape ? 0.058 : 0.072));
  const textMaxW = landscape ? 0.62 * w : 0.84 * w;

  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.06]);

  // Left scrim keeps the left-aligned type readable wherever the clip is bright;
  // a soft top scrim protects the logo.
  const leftScrim =
    "linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.5) 28%, rgba(0,0,0,0.16) 52%, rgba(0,0,0,0) 72%)";
  const topScrim =
    "linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.12) 14%, rgba(0,0,0,0) 30%)";

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
    color: "#ffffff",
  } as const;

  return (
    <AbsoluteFill className="bg-mono-20 text-mono-1 font-sans" style={interVars}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <OffthreadVideo
          src={`${baseUrl}${brief.image ?? (landscape ? BG_WIDE : BG_PORTRAIT)}`}
          muted
          loop
          playbackRate={0.8}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{ background: leftScrim }} />
      <AbsoluteFill style={{ background: topScrim }} />

      {brief.brandMark ? (
        <div className="absolute" style={{ left: pad, top: pad, ...enterAt(Math.round(fps * 0.12)).style }}>
          <Img
            src={`${baseUrl}/asset/shared/logos/hububb-wordmark.svg`}
            alt="Hububb"
            style={{ height: mark, width: "auto", filter: "brightness(0) invert(1)" }}
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
