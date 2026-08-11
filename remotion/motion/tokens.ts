import { Easing } from "remotion";

// Shared motion tokens for compositions built on remotion/motion (the shot
// library and anything new; the pre-existing compositions keep their local
// values until migrated). Colors mirror color.neutral in
// @hububb/design-system tokens.json: a 21-step white-to-black ramp where
// step n = rgb(round(255 * (21 - n) / 20)) on all three channels. The formula
// lives here instead of importing the design-system TS source because the
// Remotion webpack bundle does not transpile node_modules; tokens.json stays
// the source of truth.

export function mono(step: number): string {
  const n = Math.min(21, Math.max(1, Math.round(step)));
  const v = Math.round((255 * (21 - n)) / 20);
  const h = v.toString(16).padStart(2, "0");
  return `#${h}${h}${h}`;
}

// Ink pairings per scene variant: ground is the surface, ink the primary type,
// muted the secondary. Matches how the static templates use the scale.
export const SCENE = {
  light: { ground: mono(1), ink: mono(19), muted: mono(11), raised: mono(2) },
  dark: { ground: mono(21), ink: mono(1), muted: mono(9), raised: mono(19) },
} as const;

// Durations in seconds, mirroring the design system's --duration-* tokens.
export const DUR = { fast: 0.15, normal: 0.25, slow: 0.4 } as const;

// The design system's easing beziers, as Remotion easings.
export const EASE = {
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  decelerate: Easing.bezier(0, 0, 0.2, 1),
  accelerate: Easing.bezier(0.4, 0, 1, 1),
} as const;

// Spring configs proven across the existing compositions.
export const SPRING = {
  // The dominant "rise into place" config (animated-stack, spotlight, launch-*).
  gentle: { damping: 200 },
  // Card/device arrivals (phone-mockup-ui).
  card: { damping: 24, mass: 0.8 },
  // Snappy swaps: headline to CTA crossfades.
  snappy: { damping: 20, stiffness: 170, mass: 0.6 },
} as const;
