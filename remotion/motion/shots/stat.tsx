import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { enter } from "../helpers";
import { Odometer } from "../remocn";
import { SCENE } from "../tokens";
import type { ShotProps } from "./types";

// A number rolls to its value; the label settles beneath it. Drives the
// remocn Odometer directly (its NumberWheel wrapper is a full-frame component
// timed to the sequence length; here the roll settles at 60% of the beat so
// the number holds before the cut).
export function StatShot({ beat, dark }: ShotProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h, durationInFrames } = useVideoConfig();
  const s = dark ? SCENE.dark : SCENE.light;
  const min = Math.min(w, h);
  const stat = beat.stat;
  if (!stat) return null;

  const num = Math.round(min * 0.16);
  const label = Math.round(min * 0.032);
  const roll = interpolate(
    frame,
    [Math.round(fps * 0.2), Math.round(durationInFrames * 0.6)],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.5, 1, 0.5, 1),
    },
  );

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: Math.round(min * 0.03),
        padding: Math.round(min * 0.09),
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          fontWeight: 600,
          letterSpacing: "-0.03em",
          color: s.ink,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {stat.prefix ? <span style={{ fontSize: num }}>{stat.prefix}</span> : null}
        <Odometer
          current={stat.value * roll}
          fontSize={num}
          color={s.ink}
          fontFamily="var(--font-inter)"
        />
        {stat.suffix ? <span style={{ fontSize: num }}>{stat.suffix}</span> : null}
      </div>
      <span
        style={{
          fontSize: label,
          fontWeight: 500,
          color: s.muted,
          textAlign: "center",
          ...enter(frame, fps, 0.5, Math.round(min * 0.02)),
        }}
      >
        {stat.label}
      </span>
    </AbsoluteFill>
  );
}
