import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { enter } from "../helpers";
import { SCENE } from "../tokens";
import type { ShotProps } from "./types";

// The product index: 2-4 label + text rows staggering into a centred column
// (the parent-brand Host / Stay / Work moment).
export function RosterShot({ beat, dark }: ShotProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const s = dark ? SCENE.dark : SCENE.light;
  const min = Math.min(w, h);
  const items = beat.items ?? [];
  const label = Math.round(min * 0.058);
  const text = Math.round(min * 0.027);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: Math.round(min * 0.055),
        padding: Math.round(min * 0.09),
      }}
    >
      {items.map((it, i) => (
        <div
          key={it.label}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: Math.round(min * 0.008),
            ...enter(frame, fps, 0.2 + i * 0.32, Math.round(min * 0.03)),
          }}
        >
          <span
            style={{
              fontSize: label,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: s.ink,
            }}
          >
            {it.label}
          </span>
          <span style={{ fontSize: text, fontWeight: 500, color: s.muted, textAlign: "center" }}>
            {it.text}
          </span>
        </div>
      ))}
    </AbsoluteFill>
  );
}
