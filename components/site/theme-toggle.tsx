"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Desktop, Moon, Sun } from "@phosphor-icons/react";

const MODES = ["light", "dark", "system"] as const;

const ICONS = {
  light: Sun,
  dark: Moon,
  system: Desktop,
};

// Cycles light → dark → system. Creative PNGs are unaffected: the canvas
// renders on the fixed mono scale, and /render sits outside the shell.
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Theme is unknowable during SSR/hydration — render a neutral button until
  // the client takes over. (No effect: subscribe-less external-store snapshot.)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const mode = (MODES as readonly string[]).includes(theme ?? "")
    ? (theme as (typeof MODES)[number])
    : "system";
  const Icon = ICONS[mode];

  return (
    <button
      type="button"
      title={mounted ? `Theme: ${mode} — click to switch` : "Theme"}
      aria-label="Switch theme"
      onClick={() => setTheme(MODES[(MODES.indexOf(mode) + 1) % MODES.length])}
      className="inline-flex size-8 items-center justify-center rounded-xl bg-subtle text-t2 transition-colors hover:bg-subtle-hover hover:text-t1"
    >
      {mounted ? <Icon className="size-4" /> : <span className="size-4" />}
    </button>
  );
}
