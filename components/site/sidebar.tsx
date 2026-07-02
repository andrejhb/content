"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderSimple,
  ImagesSquare,
  PaintBrushBroad,
  UserFocus,
} from "@phosphor-icons/react";
import type { Product } from "@/lib/products";

// Side rail: the spaces inside the selected product. Product switching lives
// in the top nav.

const SPACES = [
  { key: "creatives", label: "Creatives", Icon: ImagesSquare },
  { key: "assets", label: "Assets", Icon: FolderSimple },
  { key: "persona", label: "Persona", Icon: UserFocus },
  { key: "brand", label: "Brand", Icon: PaintBrushBroad },
];

export function Sidebar({ products }: { products: Product[] }) {
  const pathname = usePathname();
  const m = pathname.match(/^\/p\/([^/]+)(?:\/([^/]+))?/);
  const activeSlug = m?.[1] ?? products[0]?.slug ?? "host";
  const activeSpace = m?.[2];

  return (
    <aside className="w-full shrink-0 border-b border-border lg:sticky lg:top-[57px] lg:h-[calc(100dvh-57px)] lg:w-48 lg:border-r lg:border-b-0">
      <nav className="flex flex-row gap-1 px-3 py-3 lg:flex-col">
        {SPACES.map(({ key, label, Icon }) => {
          const active = key === activeSpace;
          return (
            <Link
              key={key}
              href={`/p/${activeSlug}/${key}`}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-body transition-colors ${
                active
                  ? "bg-subtle font-medium text-t1"
                  : "text-t3 hover:bg-subtle hover:text-t1"
              }`}
            >
              <Icon className={`size-4.5 shrink-0 ${active ? "" : "text-dim"}`} weight={active ? "fill" : "regular"} />
              <span className="hidden sm:block">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
