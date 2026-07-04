"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderSimple,
  ImagesSquare,
  SidebarSimple,
  UserFocus,
} from "@phosphor-icons/react";
import type { Product } from "@/lib/products";

// Side rail: the spaces inside the selected product. Product switching lives
// in the top nav. Collapsible to an icons-only rail on desktop; the toggle sits
// at the top and the preference persists per browser. When collapsed, each
// icon shows a hover tooltip.

// Per-product spaces only. "Brand" (the design system + brand hub) is global,
// so it lives in the top-nav Design menu, not here.
const SPACES = [
  { key: "creatives", label: "Creatives", Icon: ImagesSquare },
  { key: "assets", label: "Assets", Icon: FolderSimple },
  { key: "persona", label: "Persona", Icon: UserFocus },
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

// Hover tooltip shown to the right of a collapsed rail item (desktop only).
function Tooltip({ label }: { label: string }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute top-1/2 left-full z-50 ml-2 hidden -translate-y-1/2 rounded-md bg-foreground px-2.5 py-1.5 text-caption font-medium whitespace-nowrap text-background opacity-0 shadow-elevation-1 transition-opacity duration-100 group-hover:opacity-100 lg:block"
    >
      {label}
    </span>
  );
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
        {/* Collapse/expand toggle — top of the rail (desktop only). */}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`group relative hidden items-center rounded-md px-2.5 py-2 text-dim transition-colors hover:bg-subtle hover:text-t1 lg:mb-1 lg:flex ${
            collapsed ? "lg:justify-center lg:px-0" : ""
          }`}
        >
          <SidebarSimple className="size-4.5 shrink-0" />
          <Tooltip label={collapsed ? "Expand sidebar" : "Collapse sidebar"} />
        </button>

        <nav className="flex min-w-0 flex-1 flex-row gap-1 lg:flex-none lg:flex-col">
          {SPACES.map(({ key, label, Icon }) => {
            const active = key === activeSpace;
            return (
              <Link
                key={key}
                href={`/p/${activeSlug}/${key}`}
                aria-label={label}
                className={`group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-body transition-colors ${
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
                {collapsed ? <Tooltip label={label} /> : null}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
