import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { VideoInputProps } from "../root";
import { interVars } from "./font";

// Motion take on the statement template: eyebrow settles first, the headline
// rises in, the subhead and brand mark close. Same layout math and tokens as
// components/templates/statement.tsx — light background, restrained motion.
export function AnimatedStatement({ brief, baseUrl }: VideoInputProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h, durationInFrames } = useVideoConfig();
  const c = brief.copy;

  const pad = Math.round(Math.min(w, h) * 0.09);
  const head = Math.round(Math.min(w, h * 1.1) * 0.108);
  const eye = Math.round(w * 0.0225);
  const sub = Math.round(w * 0.028);
  const mark = Math.round(w * 0.034);

  const enter = (delayFrames: number) => {
    const s = spring({ frame: frame - delayFrames, fps, config: { damping: 200 } });
    return {
      opacity: s,
      transform: `translateY(${interpolate(s, [0, 1], [Math.round(h * 0.02), 0])}px)`,
    };
  };

  // Gentle outro so loops don't hard-cut.
  const outro = interpolate(
    frame,
    [durationInFrames - Math.round(fps * 0.5), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill className="bg-mono-1 text-mono-21 font-sans" style={interVars}>
      <div
        className="absolute inset-0 flex flex-col justify-between"
        style={{ padding: pad, opacity: outro }}
      >
        <div className="flex items-start justify-between">
          {c.eyebrow ? (
            <span
              className="font-mono text-mono-11"
              style={{ fontSize: eye, letterSpacing: "0.01em", ...enter(0) }}
            >
              {c.eyebrow}
            </span>
          ) : (
            <span />
          )}
        </div>

        <h1
          className="font-semibold tracking-tight text-balance"
          style={{
            fontSize: head,
            lineHeight: 1.04,
            maxWidth: w - pad * 2,
            ...enter(Math.round(fps * 0.35)),
          }}
        >
          {c.headline}
        </h1>

        <div className="flex items-end justify-between gap-8">
          {c.subhead ? (
            <p
              className="text-mono-11"
              style={{
                fontSize: sub,
                lineHeight: 1.32,
                maxWidth: w * 0.66,
                ...enter(Math.round(fps * 0.9)),
              }}
            >
              {c.subhead}
            </p>
          ) : (
            <span />
          )}
          {brief.brandMark ? (
            <div style={enter(Math.round(fps * 1.1))}>
              <Img
                src={`${baseUrl}/asset/shared/logos/hububb-wordmark.svg`}
                alt="Hububb"
                style={{ height: mark, width: "auto" }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
}
