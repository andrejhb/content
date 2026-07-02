"use client";

import { useState } from "react";
import Link from "next/link";
import { CaretDown, PaintBrushBroad } from "@phosphor-icons/react";

// Mega menu for the global design elements: everything on the brand page,
// grouped, one click away from anywhere. Pure links — the brand page stays
// the single home of the design system.

const GROUPS: { label: string; items: { id: string; label: string; blurb: string }[] }[] = [
  {
    label: "Brand",
    items: [
      { id: "brand-core", label: "Brand core", blurb: "Positioning, audience, differentiation" },
      { id: "brand-voice", label: "Voice & guidelines", blurb: "How we sound, words to avoid" },
      { id: "assets", label: "Assets", blurb: "Logos, mockups, screens, photos" },
    ],
  },
  {
    label: "Design system",
    items: [
      { id: "colours", label: "Colours", blurb: "Mono scale + semantic tokens" },
      { id: "type", label: "Typography", blurb: "The Inter ramp" },
      { id: "foundations", label: "Foundations", blurb: "Radius, elevation, spacing, motion" },
      { id: "components", label: "Components", blurb: "Live DS primitives" },
      { id: "icons", label: "Icons", blurb: "The Phosphor set" },
    ],
  },
];

// The mono strip: a small, honest swatch of the scale the whole app is built
// on. Inline var() styles — dynamic Tailwind class names would never be
// generated.
const SWATCH = [1, 3, 5, 8, 11, 14, 17, 21];

export function DesignMenu({ productSlug }: { productSlug: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-body transition-colors ${
          open ? "bg-subtle text-t1" : "text-t3 hover:bg-subtle hover:text-t1"
        }`}
      >
        <PaintBrushBroad className="size-4" />
        Design
        <CaretDown className={`size-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-[560px] max-w-[90vw] rounded-xl border border-border bg-card p-5 shadow-elevation-3">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {GROUPS.map((g) => (
                <div key={g.label}>
                  <p className="font-mono text-caption tracking-wide text-dim uppercase">
                    {g.label}
                  </p>
                  <div className="mt-2 flex flex-col">
                    {g.items.map((item) => (
                      <Link
                        key={item.id}
                        href={`/p/${productSlug}/brand#${item.id}`}
                        onClick={() => setOpen(false)}
                        className="rounded-md px-2 py-1.5 transition-colors hover:bg-subtle"
                      >
                        <span className="block text-body text-t1">{item.label}</span>
                        <span className="block text-caption text-t3">{item.blurb}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
              <div className="flex overflow-hidden rounded-md border border-border">
                {SWATCH.map((m) => (
                  <span
                    key={m}
                    className="h-5 w-7"
                    style={{ background: `var(--color-mono-${m})` }}
                    title={`mono-${m}`}
                  />
                ))}
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/asset/shared/logos/hububb-wordmark.svg"
                alt="Hububb"
                className="site-logo h-4 w-auto"
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
