import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { rise } from "../helpers";
import { SCENE, SPRING, mono } from "../tokens";
import type { ShotProps } from "./types";

// The hosting to-do pile: 2-4 notification cards arrive staggered, then each
// gets its tick as the product clears them. Strictly mono take on the
// animated-stack card language: no color, the tick is an ink chip.
export function NotifyShot({ beat, dark }: ShotProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h, durationInFrames } = useVideoConfig();
  const s = dark ? SCENE.dark : SCENE.light;
  const min = Math.min(w, h);
  const cards = beat.notifications ?? [];

  const cardW = Math.round(Math.min(w * 0.8, min * 0.86));
  const pad = Math.round(min * 0.028);
  const title = Math.round(min * 0.03);
  const metaFs = Math.round(min * 0.023);
  const gap = Math.round(min * 0.02);
  const radius = Math.round(min * 0.028);

  // Ticks start clearing at 55% of the beat, one after another.
  const clearStart = (durationInFrames / fps) * 0.55;

  const cardShadow = dark
    ? `0 ${Math.round(min * 0.004)}px ${Math.round(min * 0.02)}px rgba(0,0,0,0.5)`
    : `0 ${Math.round(min * 0.002)}px ${Math.round(min * 0.006)}px rgba(0,0,0,0.08), ` +
      `0 ${Math.round(min * 0.014)}px ${Math.round(min * 0.034)}px rgba(0,0,0,0.16)`;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap,
      }}
    >
      {cards.map((n, i) => {
        const arrive = rise(frame, fps, 0.15 + i * 0.22);
        const tick = rise(frame, fps, clearStart + i * 0.28, SPRING.snappy);
        const tickOn = Math.min(1, Math.max(0, tick));
        return (
          <div
            key={`${n.title}-${i}`}
            style={{
              width: cardW,
              display: "flex",
              alignItems: "center",
              gap: Math.round(pad * 0.8),
              padding: `${pad}px ${Math.round(pad * 1.15)}px`,
              borderRadius: radius,
              background: dark ? mono(19) : mono(1),
              boxShadow: cardShadow,
              opacity: arrive,
              transform: `translateY(${interpolate(arrive, [0, 1], [Math.round(min * 0.045), 0])}px)`,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
              <span
                style={{
                  fontSize: title,
                  fontWeight: 600,
                  color: s.ink,
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  // The handled line quiets down once its tick lands.
                  opacity: 1 - tickOn * 0.45,
                }}
              >
                {n.title}
              </span>
            </div>
            {n.meta ? (
              <span
                style={{
                  fontSize: metaFs,
                  color: s.muted,
                  flexShrink: 0,
                  fontVariantNumeric: "tabular-nums",
                  opacity: 1 - tickOn * 0.45,
                }}
              >
                {n.meta}
              </span>
            ) : null}
            <div
              style={{
                width: Math.round(title * 0.95),
                height: Math.round(title * 0.95),
                flexShrink: 0,
                opacity: tickOn,
                transform: `scale(${0.4 + tickOn * 0.6})`,
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="8" fill={dark ? mono(1) : mono(19)} />
                <path
                  d="M4.6 8.2l2.3 2.3 4.5-4.7"
                  stroke={dark ? mono(19) : mono(1)}
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}
