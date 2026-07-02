"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";
import type { Product } from "@/lib/products";
import { DesignMenu } from "@/components/site/design-menu";
import { ThemeToggle } from "@/components/site/theme-toggle";

// Top rail: brand, product tabs, creatives search, the design mega menu, and
// the theme mode. Product switching lives here; the side nav owns the spaces
// inside the selected product.
export function TopNav({ products }: { products: Product[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const m = pathname.match(/^\/p\/([^/]+)(?:\/([^/]+))?/);
  const activeSlug = m?.[1] ?? products[0]?.slug ?? "host";
  const activeSpace = m?.[2] ?? "creatives";

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(
      q
        ? `/p/${activeSlug}/creatives?q=${encodeURIComponent(q)}`
        : `/p/${activeSlug}/creatives`,
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="flex items-center gap-4 px-5 py-2.5">
        <Link href={`/p/${activeSlug}/creatives`} className="flex shrink-0 items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/asset/shared/logos/hububb-symbol.svg"
            alt="Hububb"
            className="site-logo size-6"
          />
          <span className="hidden leading-tight sm:block">
            <span className="block text-body font-semibold text-t1">Hububb</span>
            <span className="block font-mono text-caption text-dim">marketing engine</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 border-l border-border pl-4">
          {products.map((p) => {
            const active = p.slug === activeSlug;
            return (
              <Link
                key={p.slug}
                href={`/p/${p.slug}/${activeSpace}`}
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
        </nav>

        <form onSubmit={search} className="ml-auto hidden min-w-0 md:block">
          <label className="flex h-8 w-56 items-center gap-2 rounded-md border border-border bg-card px-2.5 transition-colors focus-within:border-t3">
            <MagnifyingGlass className="size-4 shrink-0 text-dim" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search creatives…"
              className="w-full bg-transparent text-caption text-t1 outline-none placeholder:text-dim"
            />
          </label>
        </form>

        <div className="flex shrink-0 items-center gap-2 md:ml-0 ml-auto">
          <DesignMenu productSlug={activeSlug} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
