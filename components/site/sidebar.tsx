"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ImagesSquare,
  FolderSimple,
  UserFocus,
  Palette,
  SidebarSimple,
  List,
  X,
} from "@phosphor-icons/react";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { SoundToggle } from "@/components/site/sound-toggle";

// Quiet left rail on desktop, a burger menu on mobile. Product is a tag/filter
// inside each space, not a nav dimension. Create lives on the home hero.
const NAV = [
  { href: "/creatives", label: "Creatives", Icon: ImagesSquare, re: /^\/(creatives|creative\/)/ },
  { href: "/assets", label: "Assets", Icon: FolderSimple, re: /^\/assets/ },
  { href: "/personas", label: "Personas", Icon: UserFocus, re: /^\/(personas|p\/[^/]+\/persona)/ },
  { href: "/p/general/brand", label: "Design", Icon: Palette, re: /\/brand/ },
];

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

const WORDMARK = "/asset/shared/logos/hububb-wordmark.svg";
const SYMBOL = "/asset/shared/logos/hububb-symbol.svg";

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function NavLink({
    item,
    iconOnly = false,
    onClick,
  }: {
    item: (typeof NAV)[number];
    iconOnly?: boolean;
    onClick?: () => void;
  }) {
    const { href, label, Icon, re } = item;
    const active = re.test(pathname);
    return (
      <Link
        href={href}
        aria-label={label}
        onClick={onClick}
        className={`group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-body transition-colors ${
          iconOnly ? "justify-center px-0" : ""
        } ${
          active
            ? "bg-subtle font-medium text-t1"
            : "text-t3 hover:bg-subtle hover:text-t1"
        }`}
      >
        <Icon className="size-4.5 shrink-0" weight={active ? "fill" : "regular"} />
        {iconOnly ? null : <span>{label}</span>}
      </Link>
    );
  }

  return (
    <>
      {/* Mobile: a slim bar with a burger that opens a menu. */}
      <div className="sticky top-0 z-40 bg-surface lg:hidden">
        <div className="flex items-center justify-between px-4 py-2.5">
          <Link href="/" aria-label="Home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={WORDMARK} alt="Hububb" className="site-logo h-5 w-auto" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="inline-flex size-9 items-center justify-center rounded-xl text-t2 transition-colors hover:bg-subtle"
          >
            {mobileOpen ? <X className="size-5" /> : <List className="size-5" />}
          </button>
        </div>
        {mobileOpen ? (
          <div className="absolute inset-x-0 top-full flex flex-col gap-1 bg-surface p-3 shadow-elevation-2">
            {NAV.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                onClick={() => setMobileOpen(false)}
              />
            ))}
            <div className="mt-2 flex items-center gap-1 px-1">
              <SoundToggle />
              <ThemeToggle />
            </div>
          </div>
        ) : null}
      </div>

      {/* Desktop: the vertical rail. */}
      <aside
        className={`hidden shrink-0 bg-surface transition-[width] duration-200 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col ${
          collapsed ? "lg:w-16" : "lg:w-56"
        }`}
      >
        <div className="flex h-full flex-col gap-2 p-3">
          <div
            className={`flex items-center ${collapsed ? "flex-col gap-2" : "justify-between"}`}
          >
            <Link
              href="/"
              aria-label="Home"
              className="flex items-center rounded-xl px-2.5 py-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={collapsed ? SYMBOL : WORDMARK}
                alt="Hububb"
                className={collapsed ? "site-logo size-9" : "site-logo h-6 w-auto"}
              />
            </Link>
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="inline-flex size-8 items-center justify-center rounded-xl text-dim transition-colors hover:bg-subtle hover:text-t1"
            >
              <SidebarSimple className="size-4.5" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map((item) => (
              <NavLink key={item.href} item={item} iconOnly={collapsed} />
            ))}
          </nav>

          <div className={`flex items-center gap-1 ${collapsed ? "flex-col" : ""}`}>
            <SoundToggle />
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
