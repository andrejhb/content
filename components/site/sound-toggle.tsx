"use client";

import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { useSound } from "./sound";

export function SoundToggle() {
  const { enabled, toggle, play } = useSound();
  return (
    <button
      type="button"
      aria-pressed={enabled}
      aria-label={enabled ? "Mute interface sounds" : "Enable interface sounds"}
      title={enabled ? "Sound on" : "Sound off"}
      onClick={() => {
        const next = !enabled;
        toggle();
        if (next) play("press"); // confirm with a blip when turning on
      }}
      className="inline-flex size-8 items-center justify-center rounded-xl bg-subtle text-t2 transition-colors hover:bg-subtle-hover"
    >
      {enabled ? (
        <SpeakerHigh className="size-4" />
      ) : (
        <SpeakerSlash className="size-4" />
      )}
    </button>
  );
}
