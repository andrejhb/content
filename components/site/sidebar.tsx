"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CaretDoubleLeft,
  CaretDoubleRight,
  FolderSimple,
  ImagesSquare,
  PaintBrushBroad,
  UserFocus,
} from "@phosphor-icons/react";
import type { Product } from "@/lib/products";

// Side rail: the spaces inside the selected product. Product switching lives
// in the top nav. Collapsible to an icons-only rail on desktop; the
// preference persists per browser.

const SPACES = [
  { key: "creatives", label: "Creatives", Icon: ImagesSquare },
  { key: "assets", label: "Assets", Icon: FolderSimple },
  { key: "persona", label: "Persona", Icon: UserFocus },
  { key: "brand", label: "Brand", Icon: PaintBrushBroad },
];

// Tiny external store around localStorage: hydration-safe (server snapshot is
// "expanded"), no setState-in-effect, and every subscribed sidebar re-renders
// on toggle.
const STORAGE_KEY = "sidebar-collapsed";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) === "1";
}

function toggleCollapsed() {
  localStorage.setItem(STORAGE_KEY, getSnapshot() ? "0" : "1");
  listeners.forEach((cb) => cb());
}

export function Sidebar({ products }: { products: Product[] }) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, () => false);

  const m = pathname.match(/^\/p\/([^/]+)(?:\/([^/]+))?/);
  const activeSlug = m?.[1] ?? products[0]?.slug ?? "host";
  const activeSpace = m?.[2];

  return (
    <aside
      className={`w-full shrink-0 border-b border-border transition-[width] duration-200 lg:sticky lg:top-[57px] lg:h-[calc(100dvh-57px)] lg:border-r lg:border-b-0 ${
        collapsed ? "lg:w-14" : "lg:w-48"
      }`}
    >
      <div className="flex h-full flex-row items-center gap-1 px-3 py-3 lg:flex-col lg:items-stretch">
        <nav className="flex min-w-0 flex-1 flex-row gap-1 lg:flex-none lg:flex-col">
          {SPACES.map(({ key, label, Icon }) => {
            const active = key === activeSpace;
            return (
              <Link
                key={key}
                href={`/p/${activeSlug}/${key}`}
                title={label}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-body transition-colors ${
                  collapsed ? "lg:justify-center lg:px-0" : ""
                } ${
                  active
                    ? "bg-subtle font-medium text-t1"
                    : "text-t3 hover:bg-subtle hover:text-t1"
                }`}
              >
                <Icon
                  className={`size-4.5 shrink-0 ${active ? "" : "text-dim"}`}
                  weight={active ? "fill" : "regular"}
                />
                <span className={`hidden sm:block ${collapsed ? "lg:hidden" : ""}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`hidden items-center gap-2.5 rounded-md px-2.5 py-2 text-caption text-dim transition-colors hover:bg-subtle hover:text-t1 lg:mt-auto lg:flex ${
            collapsed ? "lg:justify-center lg:px-0" : ""
          }`}
        >
          {collapsed ? (
            <CaretDoubleRight className="size-4.5 shrink-0" />
          ) : (
            <>
              <CaretDoubleLeft className="size-4.5 shrink-0" />
              <span className={collapsed ? "lg:hidden" : ""}>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
