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

// Text-forward motion statement for @wearehububb (the launch's tension beat).
// Two big lines land one after another, then a quiet resolve line fades in.
// Monochrome, calm, no imagery, a deliberate contrast to the image-rich hello.

export function LaunchStatement({ brief, baseUrl }: VideoInputProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const c = brief.copy;
  const m = Math.min(w, h);
  const dark = brief.variant !== "light";
  const ar = h / w;

  const bg = dark ? "bg-mono-20" : "bg-mono-1";
  const mainText = dark ? "text-mono-1" : "text-mono-21";
  const muted = dark ? "text-mono-5" : "text-mono-11";
  const glow = dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.05)";

  const pad = Math.round(m * 0.085);
  const headSize = ar >= 1.5 ? 0.125 : ar <= 0.7 ? 0.1 : 0.11;
  const headPx = Math.round(Math.min(w, h * 1.05) * headSize);
  const subPx = Math.round(headPx * 0.34);
  const lineGap = Math.round(headPx * 0.2);
  const resolveGap = Math.round(headPx * 0.55);
  const mark = Math.round(m * (ar >= 1.5 || ar <= 0.7 ? 0.085 : 0.068));
  const headMaxW = ar <= 0.7 ? 0.72 * w : 0.88 * w;

  // Vertically centre the whole text block.
  const hasSub = Boolean(c.subhead);
  const blockH = headPx + lineGap + headPx + (hasSub ? resolveGap + subPx * 1.4 : 0);
  const top = Math.max(Math.round(pad + mark + m * 0.04), Math.round((h - blockH) / 2));

  const enterAt = (delaySec: number, rise = m * 0.03) => {
    const s = spring({ frame: frame - Math.round(fps * delaySec), fps, config: { damping: 200 } });
    return { opacity: s, transform: `translateY(${interpolate(s, [0, 1], [rise, 0])}px)` };
  };

  return (
    <AbsoluteFill className={`${bg} ${mainText} font-sans`} style={interVars}>
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(120% 90% at 30% 40%, ${glow} 0%, rgba(255,255,255,0) 60%)` }}
      />

      {brief.brandMark ? (
        <div className="absolute" style={{ left: pad, top: pad, ...enterAt(0.1) }}>
          <Img
            src={`${baseUrl}/asset/shared/logos/hububb-wordmark.svg`}
            alt="Hububb"
            style={{ height: mark, width: "auto", filter: dark ? "brightness(0) invert(1)" : undefined }}
          />
        </div>
      ) : null}

      <div className="absolute flex flex-col" style={{ left: pad, top, maxWidth: headMaxW }}>
        {c.headline ? (
          <span
            className={`font-semibold tracking-tight ${mainText}`}
            style={{ fontSize: headPx, lineHeight: 1.0, letterSpacing: "-0.03em", ...enterAt(0.3) }}
          >
            {c.headline}
          </span>
        ) : null}
        {c.headlineTail ? (
          <span
            className={`font-semibold tracking-tight ${mainText}`}
            style={{ fontSize: headPx, lineHeight: 1.0, letterSpacing: "-0.03em", marginTop: lineGap, ...enterAt(1.3) }}
          >
            {c.headlineTail}
          </span>
        ) : null}
        {c.subhead ? (
          <span
            className={`font-normal ${muted}`}
            style={{ fontSize: subPx, lineHeight: 1.4, marginTop: resolveGap, maxWidth: 0.8 * headMaxW, ...enterAt(2.6) }}
          >
            {c.subhead}
          </span>
        ) : null}
      </div>
    </AbsoluteFill>
  );
}
