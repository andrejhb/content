import type { ComponentType } from "react";
import {
  Broom,
  Airplane,
  House,
  ChatCircle,
  Sparkle,
  CurrencyGbp,
  Key,
  CalendarCheck,
  Sliders,
  Broadcast,
} from "@phosphor-icons/react/dist/ssr";
import type { Brief } from "@/lib/creatives";
import { CreativeCanvas, BrandMark } from "./canvas";

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  Broom,
  Airplane,
  House,
  ChatCircle,
  Sparkle,
  CurrencyGbp,
  Key,
  CalendarCheck,
  Sliders,
  Broadcast,
};

// Showcase — headline, floating icon badges, and a product screenshot.
// The hero brand layout (Linear/Stripe register). Light or dark.
export function ShowcaseTemplate({
  brief,
  w,
  h,
}: {
  brief: Brief;
  w: number;
  h: number;
}) {
  const c = brief.copy;
  const dark = brief.variant !== "light"; // default dark
  const pad = Math.round(Math.min(w, h) * 0.075);
  const head = Math.round(Math.min(w, h * 1.05) * 0.066);
  const badge = Math.round(Math.min(w, h) * 0.13);
  const badgeIcon = Math.round(badge * 0.42);
  const mark = Math.round(w * 0.032);

  const bg = dark ? "bg-mono-20 text-mono-1" : "bg-mono-1 text-mono-21";
  const badgeBg = dark ? "bg-mono-1 text-mono-21" : "bg-mono-21 text-mono-1";
  const frame = dark ? "border-mono-18" : "border-mono-4";

  const badgeNames =
    c.badges && c.badges.length ? c.badges : ["Broom", "Airplane", "House"];

  return (
    <CreativeCanvas w={w} h={h} className={bg}>
      <div className="absolute inset-0 flex flex-col" style={{ padding: pad, gap: pad }}>
        <h1
          className="font-semibold tracking-tight text-balance"
          style={{ fontSize: head, lineHeight: 1.05, maxWidth: w - pad * 2 }}
        >
          {c.headline}
        </h1>

        <div className="flex min-h-0 flex-1" style={{ gap: pad }}>
          {/* Floating icon badges */}
          <div className="flex shrink-0 flex-col justify-center" style={{ gap: Math.round(badge * 0.35) }}>
            {badgeNames.slice(0, 3).map((name, i) => {
              const Icon = ICON_MAP[name] ?? House;
              return (
                <div
                  key={`${name}-${i}`}
                  className={`flex items-center justify-center rounded-full shadow-elevation-4 ${badgeBg}`}
                  style={{
                    width: badge,
                    height: badge,
                    marginLeft: i === 1 ? Math.round(badge * 0.55) : 0,
                  }}
                >
                  <span style={{ fontSize: badgeIcon, lineHeight: 0 }}>
                    <Icon />
                  </span>
                </div>
              );
            })}
          </div>

          {/* Product screenshot — fit to the region, real aspect preserved */}
          <div className="flex min-h-0 flex-1 items-center justify-center">
            {brief.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brief.image}
                alt={c.headline ?? ""}
                className={`max-h-full max-w-full rounded-3xl border object-contain shadow-elevation-5 ${frame}`}
              />
            ) : (
              <div className={`flex h-2/3 w-1/2 items-center justify-center rounded-3xl border ${frame}`}>
                <span className="font-mono text-mono-11">supply an image</span>
              </div>
            )}
          </div>
        </div>

        {brief.brandMark ? (
          <div>
            <BrandMark height={mark} invert={dark} />
          </div>
        ) : null}
      </div>
    </CreativeCanvas>
  );
}
