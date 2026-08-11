import { interpolate, spring } from "remotion";
import { SPRING } from "./tokens";

// The consolidated versions of the motion helpers the older compositions each
// re-implement locally. New compositions use these; the older files migrate
// opportunistically.

/** Spring progress 0..1 starting delaySec into the scene. */
export function rise(
  frame: number,
  fps: number,
  delaySec: number,
  config: { damping?: number; stiffness?: number; mass?: number } = SPRING.gentle,
) {
  return spring({ frame: frame - Math.round(fps * delaySec), fps, config });
}

/** Opacity + translateY entrance style for a delayed element. */
export function enter(frame: number, fps: number, delaySec: number, dy: number) {
  const s = rise(frame, fps, delaySec);
  return {
    opacity: s,
    transform: `translateY(${interpolate(s, [0, 1], [dy, 0])}px)`,
  } as const;
}

/** Slow Ken Burns push across the whole scene. */
export function kenBurns(
  frame: number,
  durationInFrames: number,
  from = 1.05,
  to = 1.14,
) {
  return interpolate(frame, [0, durationInFrames], [from, to], {
    extrapolateRight: "clamp",
  });
}

export function smoothstep(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/**
 * Breathing emphasis across a beat (0..1 progress in, roughly 0.3..1 out):
 * builds, peaks about two thirds through, eases off before the next beat.
 * From the motion-promo reference; use on glow/emphasis opacity so nothing
 * sits at a constant level.
 */
export function swell(p: number) {
  const t = Math.min(1, Math.max(0, p));
  const big = Math.sin(t * Math.PI);
  const small = 0.5 - 0.5 * Math.cos(t * Math.PI * 3.1);
  return 0.34 + 0.5 * big + 0.16 * small * big;
}

/** Fade the scene out over the last outroSec. */
export function outroFade(
  frame: number,
  durationInFrames: number,
  fps: number,
  outroSec = 0.5,
) {
  return interpolate(
    frame,
    [durationInFrames - Math.round(fps * outroSec), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
}

/** Resolve a served asset path against the render server; http passes through. */
export function assetUrl(baseUrl: string, path: string | null | undefined) {
  if (!path) return null;
  return path.startsWith("http") ? path : `${baseUrl}${path}`;
}

// The house scrims (lifted verbatim from animated-stack / animated-spotlight
// so photography treatment stays consistent).
export const SCRIM = {
  top: "linear-gradient(180deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.2) 34%, rgba(0,0,0,0) 62%)",
  topStrong:
    "linear-gradient(180deg, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.3) 34%, rgba(0,0,0,0) 62%)",
  bottom:
    "linear-gradient(0deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.72) 30%, rgba(0,0,0,0.42) 55%, rgba(0,0,0,0.12) 75%, rgba(0,0,0,0) 88%)",
  left: "linear-gradient(90deg, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.7) 42%, rgba(0,0,0,0.38) 72%, rgba(0,0,0,0.12) 100%)",
} as const;
