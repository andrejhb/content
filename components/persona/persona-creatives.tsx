"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Meta = {
  id: string;
  persona: string | null;
  headline: string;
  thumb: string | null;
};

// The creatives that speak to the currently-selected persona. Reads the persona
// from the URL (the editor mirrors selection to ?persona=), so it follows along
// as you switch personas.
export function PersonaCreatives({
  slug,
  fallbackId,
}: {
  slug: string;
  fallbackId?: string;
}) {
  const params = useSearchParams();
  const selected = params.get("persona") ?? fallbackId ?? null;
  const [all, setAll] = useState<Meta[]>([]);

  useEffect(() => {
    let live = true;
    fetch(`/api/creatives/recent?product=${slug}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { creatives: [] }))
      .then((d) => {
        if (live) setAll(d.creatives ?? []);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [slug]);

  if (!selected) return null;
  const items = all.filter((c) => c.persona === selected);

  return (
    <section className="mt-12 flex flex-col gap-3">
      <p className="font-mono text-caption tracking-wide text-dim uppercase">
        Creatives for this persona
      </p>
      {items.length === 0 ? (
        <p className="text-caption text-t3">
          No creatives speak to this persona yet.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {items.map((c) => (
            <Link
              key={c.id}
              href={`/creative/${c.id}`}
              title={c.headline}
              className="overflow-hidden rounded-2xl bg-surface transition-transform duration-200 hover:scale-105"
            >
              <div className="flex aspect-square items-center justify-center overflow-hidden bg-subtle">
                {c.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.thumb}
                    alt={c.headline}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="p-2 text-center font-mono text-caption text-muted">
                    not rendered
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
