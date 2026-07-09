"use client";

import type { ComponentType } from "react";
import {
  Image as ImageIcon,
  SquaresFour,
  FilmSlate,
  VideoCamera,
  Sparkle,
} from "@phosphor-icons/react";
import { CONTENT_TYPES, type ContentType } from "@/lib/create";
import { useSound } from "@/components/site/sound";
import { Stagger, StaggerItem } from "@/components/site/motion";
import { StepHeading } from "./create-stepper";

const ICONS: Record<ContentType, ComponentType<{ className?: string }>> = {
  static: ImageIcon,
  carousel: SquaresFour,
  reel: FilmSlate,
  video: VideoCamera,
  motion: Sparkle,
};

export function StepType({
  selected,
  onSelect,
}: {
  selected: ContentType | null;
  onSelect: (v: ContentType) => void;
}) {
  const { play } = useSound();
  return (
    <div className="flex flex-col gap-6">
      <StepHeading
        title="What kind of content?"
        subtitle="This shapes the prompt and which render pipeline runs."
      />
      <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {CONTENT_TYPES.map((c) => {
          const Icon = ICONS[c.key];
          const active = selected === c.key;
          return (
            <StaggerItem key={c.key}>
              <button
                type="button"
                onClick={() => {
                  play("advance");
                  onSelect(c.key);
                }}
                className={`flex h-full w-full cursor-pointer flex-col gap-2 rounded-2xl p-5 text-left transition-colors ${
                  active
                    ? "bg-card ring-2 ring-foreground"
                    : "bg-surface hover:bg-subtle"
                }`}
              >
                <Icon className="size-6 text-t2" />
                <span className="text-body font-medium text-t1">{c.label}</span>
                <span className="text-caption leading-caption text-t3">
                  {c.blurb}
                </span>
              </button>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}
