"use client";

import { MagicWand } from "@phosphor-icons/react";
import type { ContentType } from "@/lib/create";
import { templatesFor } from "@/lib/templates";
import { useSound } from "@/components/site/sound";
import { Stagger, StaggerItem } from "@/components/site/motion";
import { StepHeading } from "./create-stepper";

// The template step: pick the shape this creative should take, or let the engine
// decide. Cards are typographic (name + blurb), filtered to the templates that
// fit the chosen content type (launch-* only for the parent brand). Skipped
// entirely for the Higgsfield "motion" type, which has no templates.
export function StepTemplate({
  contentType,
  product,
  selected,
  onSelect,
}: {
  contentType: ContentType;
  product: string;
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const { play } = useSound();
  const templates = templatesFor(contentType, product);
  const pick = (id: string | null) => {
    play("advance");
    onSelect(id);
  };

  const cardClass = (active: boolean) =>
    `flex h-full w-full cursor-pointer flex-col gap-2 rounded-2xl p-5 text-left transition-colors ${
      active ? "bg-card ring-2 ring-foreground" : "bg-surface hover:bg-subtle"
    }`;

  return (
    <div className="flex flex-col gap-6">
      <StepHeading
        title="Which template?"
        subtitle="Pick the shape this creative should take, or let the engine choose."
      />
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StaggerItem>
          <button
            type="button"
            onClick={() => pick(null)}
            className={cardClass(selected === null)}
          >
            <MagicWand className="size-6 text-t2" />
            <span className="text-body font-medium text-t1">Let the engine decide</span>
            <span className="text-caption leading-caption text-t3">
              Hand the engine the angle and let it pick the best-fitting template.
            </span>
          </button>
        </StaggerItem>
        {templates.map((t) => (
          <StaggerItem key={t.id}>
            <button
              type="button"
              onClick={() => pick(t.id)}
              className={cardClass(selected === t.id)}
            >
              <span className="text-body font-medium text-t1">{t.name}</span>
              <span className="text-caption leading-caption text-t3">{t.blurb}</span>
            </button>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
