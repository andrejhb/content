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

// Showcase: headline + a product screenshot (the hero), with OPTIONAL accent
// icon badges. Badges only render when copy.badges is set AND there's a mockup;
// the screenshot always leads. Light or dark.
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
  const badge = Math.round(Math.min(w, h) * 0.115);
  const badgeIcon = Math.round(badge * 0.42);
  const mark = Math.round(w * 0.032);

  const bg = dark ? "bg-mono-20 text-mono-1" : "text-mono-21";
  const lightGradient =
    "radial-gradient(115% 90% at 50% 6%, var(--color-mono-1) 0%, var(--color-mono-2) 55%, var(--color-mono-4) 100%)";
  const badgeBg = dark ? "bg-mono-1 text-mono-21" : "bg-mono-21 text-mono-1";
  const frame = dark ? "border-mono-18" : "border-mono-4";

  const hasImage = Boolean(brief.image);
  const badgeNames = c.badges && c.badges.length ? c.badges.slice(0, 3) : [];
  const showBadges = hasImage && badgeNames.length > 0;

  const mockup = hasImage ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={brief.image as string}
      alt={c.headline ?? ""}
      className={`max-h-full max-w-full rounded-3xl border object-contain shadow-elevation-5 ${frame}`}
    />
  ) : (
    <div className={`flex h-2/3 w-1/2 items-center justify-center rounded-3xl border ${frame}`}>
      <span className="font-mono text-mono-11">supply a screenshot</span>
    </div>
  );

  return (
    <CreativeCanvas
      w={w}
      h={h}
      className={bg}
      style={dark ? undefined : { background: lightGradient }}
    >
      <div className="absolute inset-0 flex flex-col" style={{ padding: pad, gap: pad }}>
        <h1
          className="font-semibold tracking-tight text-balance"
          style={{ fontSize: head, lineHeight: 1.05, maxWidth: w - pad * 2 }}
        >
          {c.headline}
        </h1>

        <div className="flex min-h-0 flex-1" style={{ gap: pad }}>
          {showBadges ? (
            <div
              className="flex shrink-0 flex-col justify-center"
              style={{ gap: Math.round(badge * 0.35) }}
            >
              {badgeNames.map((name, i) => {
                const Icon = ICON_MAP[name] ?? House;
                return (
                  <div
                    key={`${name}-${i}`}
                    className={`flex items-center justify-center rounded-full shadow-elevation-4 ${badgeBg}`}
                    style={{
                      width: badge,
                      height: badge,
                      marginLeft: i === 1 ? Math.round(badge * 0.5) : 0,
                    }}
                  >
                    <span style={{ fontSize: badgeIcon, lineHeight: 0 }}>
                      <Icon />
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div className="flex min-h-0 flex-1 items-center justify-center">
            {mockup}
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
