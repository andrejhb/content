"use client";

import Link from "next/link";
import { Plus } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";

// The primary action of the whole engine. `hero` is the big front-and-centre
// home button; `nav` is the compact sidebar version (icon-only when collapsed).
export function CreateButton({
  variant = "nav",
  collapsed = false,
}: {
  variant?: "hero" | "nav";
  collapsed?: boolean;
}) {
  const reduce = useReducedMotion();
  const hero = variant === "hero";

  const base =
    "group relative inline-flex items-center justify-center gap-2 bg-foreground font-medium text-background transition-shadow";
  const sizing = hero
    ? "rounded-2xl px-6 py-3 text-body shadow-elevation-1 hover:shadow-elevation-3"
    : collapsed
      ? "size-10 rounded-xl shadow-elevation-1 hover:shadow-elevation-2"
      : "w-full rounded-xl px-3 py-2.5 text-body shadow-elevation-1 hover:shadow-elevation-2";

  const inner = (
    <Link href="/create" aria-label="Create a creative" className={`${base} ${sizing}`}>
      <Plus className={hero ? "size-5" : "size-4.5"} weight="bold" />
      {collapsed && !hero ? null : <span>Create</span>}
    </Link>
  );

  if (reduce) return inner;
  return (
    <motion.div
      whileHover={{ scale: hero ? 1.03 : 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={hero ? "inline-block" : "w-full"}
    >
      {inner}
    </motion.div>
  );
}
