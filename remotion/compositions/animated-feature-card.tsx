import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { VideoInputProps } from "../root";
import { interVars } from "./font";

// Motion take on the feature-card template: text staggers in, the surface
// panel fades up, and the phone mockup rises with a spring and settles with a
// slow drift. Same layout math and tokens as
// components/templates/feature-card.tsx.
export function AnimatedFeatureCard({ brief, baseUrl }: VideoInputProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h, durationInFrames } = useVideoConfig();
  const c = brief.copy;
  const dark = brief.variant === "dark";
  const landscape = w > h;

  const pad = Math.round(Math.min(w, h) * 0.07);
  const eye = Math.round(w * 0.022);
  const head = Math.round(Math.min(w, h * 1.05) * (landscape ? 0.058 : 0.066));
  const panelPad = Math.round(Math.min(w, h) * 0.06);
  const aspect = w / h;
  const clip = aspect >= 0.7 && aspect <= 1.3;
  const clipTop = Math.round(Math.min(w, h) * 0.07);
  const clipWidth = aspect >= 0.95 ? "52%" : "66%";

  const bg = dark ? "bg-mono-20 text-mono-1" : "bg-mono-1 text-mono-21";
  const eyeColor = dark ? "text-mono-5" : "text-mono-11";
  const frameCls = dark ? "border-mono-18" : "border-mono-4";
  const surface = dark
    ? "radial-gradient(125% 120% at 50% 0%, var(--color-mono-19) 0%, var(--color-mono-21) 100%)"
    : "radial-gradient(125% 120% at 50% 0%, var(--color-mono-2) 0%, var(--color-mono-4) 100%)";
  const deviceShadow = dark
    ? "drop-shadow(0 20px 32px rgba(0,0,0,0.55))"
    : "drop-shadow(0 18px 30px rgba(0,0,0,0.16))";

  const enter = (delayFrames: number) => {
    const s = spring({ frame: frame - delayFrames, fps, config: { damping: 200 } });
    return {
      opacity: s,
      transform: `translateY(${interpolate(s, [0, 1], [Math.round(h * 0.015), 0])}px)`,
    };
  };

  // The phone: spring up, then a slow settle drift for the rest of the clip.
  const phoneIn = spring({
    frame: frame - Math.round(fps * 0.8),
    fps,
    config: { damping: 16, mass: 0.9 },
  });
  const drift = interpolate(frame, [fps * 2, durationInFrames], [0, -Math.round(h * 0.012)], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const phoneStyle = {
    opacity: phoneIn,
    transform: `translateY(${interpolate(phoneIn, [0, 1], [Math.round(h * 0.08), 0]) + drift}px)`,
    filter: deviceShadow,
  };

  const outro = interpolate(
    frame,
    [durationInFrames - Math.round(fps * 0.5), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const image = brief.image ? `${baseUrl}${brief.image}` : null;

  const text = (
    <div className="flex flex-col" style={{ gap: Math.round(head * 0.18) }}>
      {c.eyebrow ? (
        <span
          className={`font-mono ${eyeColor}`}
          style={{ fontSize: eye, letterSpacing: "0.01em", ...enter(0) }}
        >
          {c.eyebrow}
        </span>
      ) : null}
      <h1
        className="font-semibold tracking-tight text-balance"
        style={{ fontSize: head, lineHeight: 1.05, ...enter(Math.round(fps * 0.25)) }}
      >
        {c.headline}
      </h1>
      {c.subhead ? (
        <p
          className={dark ? "text-mono-4" : "text-mono-11"}
          style={{
            fontSize: Math.round(w * 0.026),
            lineHeight: 1.35,
            maxWidth: landscape ? "100%" : w * 0.82,
            ...enter(Math.round(fps * 0.5)),
          }}
        >
          {c.subhead}
        </p>
      ) : null}
    </div>
  );

  const panelIn = enter(Math.round(fps * 0.6));

  const panel = (
    <div
      className={`flex min-h-0 flex-1 justify-center overflow-hidden rounded-3xl border ${frameCls} ${clip ? "items-start" : "items-center"}`}
      style={{ background: surface, padding: clip ? 0 : panelPad, ...panelIn }}
    >
      {image ? (
        <Img
          src={image}
          alt={c.headline ?? ""}
          className={clip ? "" : "max-h-full max-w-full rounded-2xl object-contain"}
          style={
            clip ? { width: clipWidth, marginTop: clipTop, ...phoneStyle } : phoneStyle
          }
        />
      ) : null}
    </div>
  );

  return (
    <AbsoluteFill className={`${bg} font-sans`} style={interVars}>
      <div
        className={`absolute inset-0 flex ${landscape ? "flex-row items-stretch" : "flex-col"}`}
        style={{ padding: pad, gap: pad, opacity: outro }}
      >
        {landscape ? (
          <>
            <div className="flex w-[42%] shrink-0 flex-col justify-center">{text}</div>
            {panel}
          </>
        ) : (
          <>
            {text}
            {panel}
          </>
        )}
      </div>
    </AbsoluteFill>
  );
}
