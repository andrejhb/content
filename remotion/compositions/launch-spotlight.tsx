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

// Full-bleed cinematic spotlight for @wearehububb (the more visual variant).
// A generated interior clip fills the frame; the logo sits top-left and the copy
// reads at the lower-left. A soft top scrim keeps the logo legible; a bottom
// scrim (raised on the tall 9:16 so it follows the copy) keeps the type legible.

const BG_PORTRAIT = "/asset/general/clips/spotlight-portrait.mp4";
const BG_WIDE = "/asset/general/clips/spotlight-wide.mp4";

export function LaunchSpotlight({ brief, baseUrl }: VideoInputProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h, durationInFrames } = useVideoConfig();
  const c = brief.copy;
  const m = Math.min(w, h);
  const landscape = w > h;
  const tall = h >= w * 1.5;

  const pad = Math.round(m * 0.078);
  const headPx = Math.round(Math.min(w, h * 1.05) * (landscape ? 0.085 : 0.1));
  const subPx = Math.round(headPx * 0.34);
  const mark = Math.round(m * (landscape ? 0.058 : 0.072));
  const headMaxW = landscape ? 0.66 * w : 0.94 * w;

  // The copy sits higher on the tall story; the bottom scrim follows it.
  const textBottom = tall ? Math.round(h * 0.11) : pad;
  const darkFrac = tall ? 0.46 : landscape ? 0.32 : 0.36;
  const bottomScrim = `linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) ${Math.round(darkFrac * 55)}%, rgba(0,0,0,0.12) ${Math.round(darkFrac * 100)}%, rgba(0,0,0,0) ${Math.round(darkFrac * 100 + 16)}%)`;
  const topScrim = "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.16) 12%, rgba(0,0,0,0) 27%)";

  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.06]);

  const enterAt = (delaySec: number, rise = m * 0.03) => {
    const s = spring({ frame: frame - Math.round(fps * delaySec), fps, config: { damping: 200 } });
    return { opacity: s, transform: `translateY(${interpolate(s, [0, 1], [rise, 0])}px)` };
  };

  const headStyle = {
    fontSize: headPx,
    lineHeight: 1.04,
    letterSpacing: "-0.03em",
    maxWidth: headMaxW,
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

      <AbsoluteFill style={{ background: bottomScrim }} />
      <AbsoluteFill style={{ background: topScrim }} />

      {brief.brandMark ? (
        <div className="absolute" style={{ left: pad, top: pad, ...enterAt(0.15) }}>
          <Img
            src={`${baseUrl}/asset/shared/logos/hububb-wordmark.svg`}
            alt="Hububb"
            style={{ height: mark, width: "auto", filter: "brightness(0) invert(1)" }}
          />
        </div>
      ) : null}

      <div className="absolute flex flex-col" style={{ left: pad, right: pad, bottom: textBottom }}>
        {c.headline ? (
          <span className="font-semibold tracking-tight" style={{ ...headStyle, ...enterAt(0.4) }}>
            {c.headline}
          </span>
        ) : null}
        {c.headlineTail ? (
          <span className="font-semibold tracking-tight" style={{ ...headStyle, ...enterAt(0.62) }}>
            {c.headlineTail}
          </span>
        ) : null}
        {c.subhead ? (
          <span
            className="font-normal"
            style={{ fontSize: subPx, lineHeight: 1.4, marginTop: Math.round(headPx * 0.24), maxWidth: landscape ? 0.5 * w : 0.82 * w, color: "rgba(255,255,255,0.82)", ...enterAt(1.1) }}
          >
            {c.subhead}
          </span>
        ) : null}
      </div>
    </AbsoluteFill>
  );
}
