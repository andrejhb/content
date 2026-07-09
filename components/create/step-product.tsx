"use client";

import type { Product } from "@/lib/products";
import { useSound } from "@/components/site/sound";
import { Stagger, StaggerItem } from "@/components/site/motion";
import { StepHeading } from "./create-stepper";

export function StepProduct({
  products,
  onSelect,
}: {
  products: Product[];
  onSelect: (slug: string) => void;
}) {
  const { play } = useSound();
  return (
    <div className="flex flex-col gap-6">
      <StepHeading
        title="What are you creating for?"
        subtitle="Pick the product this creative belongs to."
      />
      <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {products.map((p) => (
          <StaggerItem key={p.slug}>
            <button
              type="button"
              onClick={() => {
                play("advance");
                onSelect(p.slug);
              }}
              className="group flex h-full w-full cursor-pointer flex-col items-center gap-3 rounded-2xl bg-surface p-6 text-center transition-colors hover:bg-subtle"
            >
              <span className="flex size-16 items-center justify-center overflow-hidden rounded-2xl bg-card transition-transform group-hover:scale-105">
                {p.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.icon} alt="" className="size-full object-cover" />
                ) : (
                  <span className="text-heading-3 font-semibold text-t2">
                    {p.name.charAt(0)}
                  </span>
                )}
              </span>
              <span className="text-body font-medium text-t1">{p.name}</span>
            </button>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
