"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CaretDown, MagnifyingGlass } from "@phosphor-icons/react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  const m = pathname.match(/^\/p\/([^/]+)(?:\/([^/]+))?/);
  const activeSlug = m?.[1] ?? products[0]?.slug ?? "host";
  const activeSpace = m?.[2] ?? "creatives";
  const activeProduct = products.find((p) => p.slug === activeSlug);
  const activeName = activeProduct?.name ?? "This product";

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
        {/* Inline product tabs on sm+; a dropdown on mobile. */}
        <nav className="hidden items-center gap-1 sm:flex">
          {products.map((p) => {
            const active = p.slug === activeSlug;
            return (
              <Link
                key={p.slug}
                href={`/p/${p.slug}/${activeSpace}`}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-body transition-colors ${
                  active
                    ? "bg-subtle font-medium text-t1"
                    : "text-t3 hover:bg-subtle hover:text-t1"
                }`}
              >
                {p.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.icon} alt="" className="size-4 rounded" />
                ) : null}
                {p.name}
              </Link>
            );
          })}
        </nav>

        <div className="relative sm:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-subtle px-2.5 py-1.5 text-body font-medium text-t1"
          >
            {activeProduct?.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activeProduct.icon} alt="" className="size-4 rounded" />
            ) : null}
            {activeName}
            <CaretDown
              className={`size-3.5 text-dim transition-transform ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>
          {menuOpen ? (
            <>
              <button
                type="button"
                aria-hidden
                tabIndex={-1}
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute top-full left-0 z-50 mt-1 min-w-40 rounded-lg border border-border bg-card p-1 shadow-elevation-1">
                {products.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/p/${p.slug}/${activeSpace}`}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-body transition-colors ${
                      p.slug === activeSlug
                        ? "bg-subtle font-medium text-t1"
                        : "text-t3 hover:bg-subtle hover:text-t1"
                    }`}
                  >
                    {p.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.icon} alt="" className="size-4 rounded" />
                    ) : null}
                    {p.name}
                  </Link>
                ))}
              </div>
            </>
          ) : null}
        </div>

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
          <DesignMenu productSlug={activeSlug} productName={activeName} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
