"use client";

import { useSyncExternalStore } from "react";
import {
  subscribeSound,
  isSoundEnabled,
  setSoundEnabled,
  playSound,
  type SoundName,
} from "@/lib/sound";

// Hook over the localStorage-backed sound store. `play` no-ops when muted.
export function useSound() {
  const enabled = useSyncExternalStore(
    subscribeSound,
    isSoundEnabled,
    () => false,
  );
  return {
    enabled,
    toggle: () => setSoundEnabled(!isSoundEnabled()),
    play: (name: SoundName) => playSound(name),
  };
}
