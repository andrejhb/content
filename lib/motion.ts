// Motion design system for the app UI. Timing and easing mirror the
// @hububb/design-system motion tokens (--duration-* are milliseconds in CSS; the
// `motion` library wants seconds, so these are the second-equivalents; --ease-* are
// the cubic-bezier control points). Presets are variant objects consumed by the
// wrappers in components/site/motion.tsx. Keep motion on these tokens, not ad-hoc
// values, so the whole app moves with one rhythm.

type Bezier = [number, number, number, number];

export const DURATION = {
  instant: 0,
  fast: 0.15, //  --duration-fast   150ms  hover, focus, small elements
  normal: 0.25, // --duration-normal 250ms  default enters
  slow: 0.4, //    --duration-slow   400ms  larger / emphasis moves
} as const;

export const EASE: Record<
  "standard" | "accelerate" | "decelerate" | "linear",
  Bezier
> = {
  standard: [0.4, 0, 0.2, 1],
  accelerate: [0.4, 0, 1, 1],
  decelerate: [0, 0, 0.2, 1],
  linear: [0, 0, 1, 1],
};

// Enter presets for <Appear> / <StaggerItem>.
export const PRESETS = {
  fade: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: DURATION.normal, ease: EASE.standard },
    },
  },
  slideUp: {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: DURATION.normal, ease: EASE.decelerate },
    },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: DURATION.fast, ease: EASE.decelerate },
    },
  },
} as const;

export type PresetName = keyof typeof PRESETS;

// Container variant that reveals its <StaggerItem> children in sequence.
export const staggerContainer = (stagger = 0.05, delayChildren = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
});

// Directional wizard step transition (used with AnimatePresence + a `direction`
// custom value in Stage 2).
export const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.normal, ease: EASE.decelerate },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -24 : 24,
    transition: { duration: DURATION.fast, ease: EASE.accelerate },
  }),
};
