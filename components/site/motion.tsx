"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { PRESETS, staggerContainer, type PresetName } from "@/lib/motion";

// Thin wrappers over `motion` bound to the design-system motion presets. All of
// them fall back to a plain <div> when the user prefers reduced motion, so nothing
// animates against their setting.

export function Appear({
  children,
  preset = "slideUp",
  delay = 0,
  className,
}: {
  children: ReactNode;
  preset?: PresetName;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={PRESETS[preset] as Variants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

// Reveals its <StaggerItem> children one after another.
export function Stagger({
  children,
  stagger = 0.05,
  delayChildren = 0,
  className,
}: {
  children: ReactNode;
  stagger?: number;
  delayChildren?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={staggerContainer(stagger, delayChildren) as Variants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  preset = "slideUp",
  className,
}: {
  children: ReactNode;
  preset?: PresetName;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={PRESETS[preset] as Variants}>
      {children}
    </motion.div>
  );
}
