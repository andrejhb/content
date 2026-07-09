"use client";

import { Check } from "@phosphor-icons/react";

// The wizard progress rail. Completed steps are clickable to jump back.
export function CreateStepper({
  steps,
  current,
  onGoto,
}: {
  steps: string[];
  current: number;
  onGoto: (n: number) => void;
}) {
  return (
    <ol className="flex flex-wrap items-center gap-2">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex items-center gap-2">
            <button
              type="button"
              disabled={n >= current}
              onClick={() => onGoto(n)}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-caption transition-colors ${
                active
                  ? "bg-foreground text-background"
                  : done
                    ? "cursor-pointer bg-subtle text-t1 hover:bg-subtle-hover"
                    : "bg-subtle text-dim"
              }`}
            >
              <span className="inline-flex size-4 items-center justify-center font-mono">
                {done ? <Check className="size-3.5" /> : n}
              </span>
              {label}
            </button>
            {n < steps.length ? <span className="h-px w-4 bg-subtle" /> : null}
          </li>
        );
      })}
    </ol>
  );
}

export function StepHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-heading-3 leading-heading-3 text-t1">{title}</h2>
      {subtitle ? <p className="text-body text-t3">{subtitle}</p> : null}
    </div>
  );
}
