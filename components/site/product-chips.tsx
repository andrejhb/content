import Link from "next/link";
import type { Product } from "@/lib/products";

// Product as a filter/tag row (replaces the old product tabs). Server-rendered
// links so it needs no client state.
export function ProductChips({
  products,
  active,
  basePath,
  includeAll = true,
}: {
  products: Product[];
  active?: string;
  basePath: string;
  includeAll?: boolean;
}) {
  const cls = (on: boolean) =>
    `rounded-full px-3 py-1 text-caption transition-colors ${
      on
        ? "bg-foreground text-background"
        : "bg-subtle text-t2 hover:bg-subtle-hover"
    }`;
  return (
    <div className="flex flex-wrap gap-2">
      {includeAll ? (
        <Link href={basePath} className={cls(!active)}>
          All
        </Link>
      ) : null}
      {products.map((p) => (
        <Link
          key={p.slug}
          href={`${basePath}?product=${p.slug}`}
          className={cls(active === p.slug)}
        >
          {p.name}
        </Link>
      ))}
    </div>
  );
}
