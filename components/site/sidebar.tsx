"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Product } from "@/lib/products";

// Minimal left rail: product tabs on top, the selected product's spaces below.
// Light, borders-and-type — design-system tokens only.

const SPACES = [
  { key: "creatives", label: "Creatives" },
  { key: "assets", label: "Assets" },
  { key: "persona", label: "Persona" },
  { key: "brand", label: "Brand" },
];

export function Sidebar({ products }: { products: Product[] }) {
  const pathname = usePathname();
  const m = pathname.match(/^\/p\/([^/]+)(?:\/([^/]+))?/);
  const activeSlug = m?.[1] ?? products[0]?.slug;
  const activeSpace = m?.[2];

  return (
    <aside className="w-full shrink-0 border-b border-border lg:sticky lg:top-0 lg:h-dvh lg:w-56 lg:border-r lg:border-b-0">
      <div className="flex items-center gap-2.5 px-5 py-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/asset/shared/logos/hububb-symbol.svg"
          alt="Hububb"
          className="site-logo size-6"
        />
        <div className="leading-tight">
          <p className="text-body font-semibold text-t1">Hububb</p>
          <p className="font-mono text-caption text-dim">marketing engine</p>
        </div>
      </div>

      <div className="flex flex-row gap-6 px-5 pb-5 lg:flex-col lg:gap-0">
        <nav className="lg:mt-2">
          <p className="mb-1.5 font-mono text-caption tracking-wide text-dim uppercase">
            Products
          </p>
          <div className="flex flex-row gap-1 lg:flex-col">
            {products.map((p) => {
              const active = p.slug === activeSlug;
              return (
                <Link
                  key={p.slug}
                  href={`/p/${p.slug}/${activeSpace ?? "creatives"}`}
                  className={`rounded-md px-2.5 py-1.5 text-body transition-colors ${
                    active
                      ? "bg-subtle font-medium text-t1"
                      : "text-t3 hover:bg-subtle hover:text-t1"
                  }`}
                >
                  {p.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <nav className="lg:mt-6">
          <p className="mb-1.5 font-mono text-caption tracking-wide text-dim uppercase">
            Spaces
          </p>
          <div className="flex flex-row gap-1 lg:flex-col">
            {SPACES.map((s) => {
              const active = s.key === activeSpace;
              return (
                <Link
                  key={s.key}
                  href={`/p/${activeSlug}/${s.key}`}
                  className={`rounded-md px-2.5 py-1.5 text-body transition-colors ${
                    active
                      ? "bg-subtle font-medium text-t1"
                      : "text-t3 hover:bg-subtle hover:text-t1"
                  }`}
                >
                  {s.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
}
