import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { enter, rise } from "../helpers";
import { SCENE, mono } from "../tokens";
import type { ShotProps } from "./types";

// The close: the Hububb wordmark settles in, with an optional line above it
// and an optional CTA pill or muted handle beneath.
export function WordmarkShot({ beat, baseUrl, dark }: ShotProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const s = dark ? SCENE.dark : SCENE.light;
  const min = Math.min(w, h);
  const logoH = Math.round(min * 0.085);
  const line = Math.round(min * 0.036);
  const ctaH = Math.round(min * 0.075);

  const markIn = rise(frame, fps, 0.15);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: Math.round(min * 0.045),
        padding: Math.round(min * 0.09),
      }}
    >
      {beat.line ? (
        <span
          style={{
            fontSize: line,
            fontWeight: 500,
            color: s.muted,
            textAlign: "center",
            ...enter(frame, fps, 0.05, Math.round(min * 0.02)),
          }}
        >
          {beat.line}
        </span>
      ) : null}
      <Img
        src={`${baseUrl}/asset/shared/logos/hububb-wordmark.svg`}
        style={{
          height: logoH,
          width: "auto",
          filter: dark ? "brightness(0) invert(1)" : undefined,
          opacity: markIn,
          transform: `translateY(${interpolate(markIn, [0, 1], [Math.round(min * 0.02), 0])}px)`,
        }}
      />
      {beat.cta ? (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: ctaH,
            paddingLeft: Math.round(min * 0.045),
            paddingRight: Math.round(min * 0.045),
            borderRadius: 9999,
            background: dark ? mono(1) : mono(19),
            color: dark ? mono(19) : mono(1),
            fontWeight: 600,
            fontSize: Math.round(min * 0.027),
            ...enter(frame, fps, 0.65, Math.round(min * 0.02)),
          }}
        >
          {beat.cta}
        </div>
      ) : beat.tail ? (
        <span
          style={{
            fontSize: Math.round(min * 0.028),
            fontWeight: 500,
            color: s.muted,
            ...enter(frame, fps, 0.65, Math.round(min * 0.018)),
          }}
        >
          {beat.tail}
        </span>
      ) : null}
    </AbsoluteFill>
  );
}
