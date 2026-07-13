import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { VideoInputProps } from "../root";
import { interVars } from "./font";

// phone-showcase: an app-screen slideshow. One iPhone holds still while its screen
// cross-dissolves through the product's real app screens, under text that tracks
// the current screen.
//
// Screen source (first match wins):
//   1. brief.screens: [{image, eyebrow?, headline?, label?}] — the full auto-cycling
//      reel (each screen its own text; used as one video).
//   2. brief.image + brief.copy — a SINGLE screen from a per-slide image and copy,
//      so the same look works as one slide of a swipe carousel (no cycling, no dots).
//   3. DEFAULT_SCREENS — the built-in host set.
//
// Text modes: rich (per-screen eyebrow + headline, cross-fading) when any screen has
// a headline; else simple (a fixed brief.copy.headline + a short per-screen label
// pill). Layout adapts to format: stack (4:5 / 1:1 — text top, phone bleeds off the
// bottom), tall (9:16 — bigger phone, no bleed), landscape (16:9 — text left, phone
// right). The wordmark shows only when brief.brandMark is true. Screens are
// transparent, identically sized framed-device PNGs (e.g. 780×1600).

type Screen = { image: string; label?: string; eyebrow?: string; headline?: string };

const DEFAULT_SCREENS: Screen[] = [
  { image: "/asset/host/screens/messaging.png", label: "Unified inbox" },
  { image: "/asset/host/screens/ai-agents.png", label: "AI messaging" },
  { image: "/asset/host/screens/cleaning.png", label: "Cleaning booked" },
  { image: "/asset/host/screens/performance-dashboard.png", label: "Reports and pricing" },
  { image: "/asset/host/screens/guest-portal.png", label: "Guest portal" },
];

const PHONE_ASPECT = 780 / 1600; // framed-device PNG ratio (0.4875)

const smooth = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};

export function PhoneShowcase({ brief, baseUrl }: VideoInputProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h, durationInFrames } = useVideoConfig();
  const c = brief.copy ?? {};
  const dark = brief.variant !== "light";
  const m = Math.min(w, h);
  const landscape = w > h;
  const tall = !landscape && h / w >= 1.4;
  const square = !landscape && !tall && Math.abs(w / h - 1) < 0.06;

  const briefScreens = (brief as { screens?: Screen[] }).screens;
  const screens: Screen[] = Array.isArray(briefScreens) && briefScreens.length
    ? briefScreens
    : brief.image
      ? [{ image: brief.image, eyebrow: c.eyebrow, headline: c.headline, label: c.headline }]
      : DEFAULT_SCREENS;
  const N = screens.length;
  const single = N === 1;
  const richText = screens.some((s) => s.headline);

  // Cross-dissolve timeline: one equal slot per screen, a soft fade near the end of
  // each slot into the next. The phone screens cross-dissolve; TEXT swaps cleanly
  // (out before in) so two different lines never overlap into a jumble.
  const slot = durationInFrames / N;
  const pos = frame / slot;
  const cur = Math.min(N - 1, Math.floor(pos));
  const frac = pos - cur;
  const FADE_AT = 0.8;
  const next = cur + 1;
  const xfade = next < N ? smooth((frac - FADE_AT) / (1 - FADE_AT)) : 0;
  const p = next < N ? Math.max(0, Math.min(1, (frac - FADE_AT) / (1 - FADE_AT))) : 0;
  const textOut = 1 - smooth(Math.min(1, p * 1.9));
  const textIn = smooth(p <= 0.47 ? 0 : (p - 0.47) / 0.53);

  const pad = Math.round(m * 0.072);
  const headPx = Math.round(Math.min(w, h * 1.05) * (landscape ? 0.056 : tall ? 0.06 : square ? 0.06 : richText ? 0.064 : 0.066));
  const eyebrowPx = Math.round(headPx * 0.4);
  const mark = Math.round(m * (square ? 0.056 : 0.06));

  const sceneBg = dark
    ? "linear-gradient(157deg, #1c1c20 0%, #0b0b0d 100%)"
    : "linear-gradient(155deg, #ffffff 0%, #f1efec 100%)";
  const ink = dark ? "#f4f4f5" : "#141414";
  const subInk = dark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";
  const eyebrowCol = dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)";
  const pillBg = dark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.05)";
  const pillBorder = dark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.1)";

  const he = spring({ frame: frame - 6, fps, config: { damping: 200 } });
  const headEnter = { opacity: he, transform: `translateY(${interpolate(he, [0, 1], [Math.round(h * 0.02), 0])}px)` };
  const phoneIn = spring({ frame: frame - 10, fps, config: { damping: 20, mass: 0.9 } });
  // A single screen (carousel slide) gets a gentle continuous zoom for life; the
  // multi-screen reel keeps the frame still so only the screen content changes.
  const zoom = single ? interpolate(frame, [0, durationInFrames], [1, 1.03]) : 1;

  // Geometry per layout mode.
  let phoneW: number;
  let phoneTop: number;
  let phoneLeft: number;
  let textBox: React.CSSProperties;
  let textAlign: "left" | "center";
  let dotsBox: React.CSSProperties;
  let showScrim = false;

  if (landscape) {
    phoneW = Math.round(0.82 * h * PHONE_ASPECT);
    const phoneH0 = Math.round(phoneW / PHONE_ASPECT);
    phoneTop = Math.round((h - phoneH0) / 2);
    phoneLeft = Math.round(w * 0.7 - phoneW / 2);
    textAlign = "left";
    textBox = { left: pad + Math.round(m * 0.02), top: 0, bottom: 0, width: Math.round(w * 0.46) };
    dotsBox = { left: phoneLeft, width: phoneW, top: phoneTop + phoneH0 + Math.round(m * 0.03), justifyContent: "center" };
  } else {
    const headTop = brief.brandMark ? pad + mark + Math.round(m * 0.04) : pad + Math.round(m * 0.06);
    // Headlines are shortened to fit one row, so the top zone reserves a single
    // line (plus the eyebrow) rather than two.
    const topZoneH = richText
      ? Math.round(eyebrowPx * 1.7 + headPx * 1.2)
      : Math.round(headPx * 1.3);
    textAlign = "center";
    textBox = { left: pad, right: pad, top: headTop, height: topZoneH };
    if (tall) {
      phoneW = Math.round(0.64 * w);
      phoneTop = Math.round(headTop + topZoneH + m * 0.075);
    } else {
      phoneW = Math.round(0.54 * w);
      phoneTop = Math.round(headTop + topZoneH + m * 0.07);
      showScrim = true;
    }
    phoneLeft = Math.round((w - phoneW) / 2);
    dotsBox = { left: 0, right: 0, bottom: Math.round(h * 0.055), justifyContent: "center" };
  }
  const phoneH = Math.round(phoneW / PHONE_ASPECT);

  const scrim = dark
    ? "linear-gradient(to top, rgba(11,11,13,0.97) 0%, rgba(11,11,13,0.86) 30%, rgba(11,11,13,0.5) 62%, rgba(11,11,13,0) 100%)"
    : "linear-gradient(to top, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.86) 30%, rgba(255,255,255,0.5) 62%, rgba(255,255,255,0) 100%)";

  const textColStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: landscape ? "center" : "flex-start",
    alignItems: textAlign === "center" ? "center" : "flex-start",
    textAlign,
  };

  const headlineStyle: React.CSSProperties = {
    fontSize: headPx,
    fontWeight: 600,
    letterSpacing: "-0.02em",
    lineHeight: 1.06,
    color: ink,
    whiteSpace: "nowrap",
  };

  return (
    <AbsoluteFill style={{ background: sceneBg, ...interVars, fontFamily: "var(--font-inter)", overflow: "hidden" }}>
      {brief.brandMark ? (
        <div style={{ position: "absolute", left: pad, top: pad, opacity: he }}>
          <Img src={`${baseUrl}/asset/shared/logos/hububb-wordmark.svg`} style={{ height: mark, width: "auto", filter: dark ? "brightness(0) invert(1)" : undefined }} />
        </div>
      ) : null}

      {/* Text zone. */}
      <div style={{ position: "absolute", ...textBox, ...headEnter }}>
        {richText ? (
          [cur, next].filter((i) => i < N).map((i) => {
            const op = i === cur ? textOut : textIn;
            const s = screens[i];
            return (
              <div key={i} style={{ ...textColStyle, opacity: op }}>
                {s.eyebrow ? (
                  <span style={{ fontSize: eyebrowPx, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: eyebrowCol, marginBottom: Math.round(eyebrowPx * 0.55), whiteSpace: "nowrap" }}>
                    {s.eyebrow}
                  </span>
                ) : null}
                <span style={headlineStyle}>{s.headline}</span>
              </div>
            );
          })
        ) : (
          <div style={textColStyle}>
            <span style={headlineStyle}>{c.headline ?? "Everything a host needs, all in one app"}</span>
          </div>
        )}
      </div>

      {/* Phone stage: framed-device screens stacked, cross-dissolving. */}
      <div style={{ position: "absolute", left: phoneLeft, top: phoneTop, width: phoneW, height: phoneH, opacity: phoneIn, transform: `translateY(${interpolate(phoneIn, [0, 1], [Math.round(h * 0.04), 0])}px) scale(${zoom})`, filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.45))" }}>
        {screens.map((s, i) => {
          const op = i === cur ? 1 : i === next ? xfade : 0;
          if (op === 0) return null;
          return (
            <Img key={i} src={`${baseUrl}${s.image}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", objectPosition: "top", opacity: op }} />
          );
        })}
      </div>

      {/* Bottom scrim so the label + dots read over a phone that bleeds off-bottom. */}
      {showScrim ? (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: Math.round(h * (square ? 0.26 : 0.22)), background: scrim }} />
      ) : null}

      {/* Simple mode: a short per-screen label pill, cross-fading with the screen. */}
      {!richText ? (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: Math.round(h * 0.055) + (single ? 0 : Math.round(m * 0.056)), display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", height: Math.round(headPx * 0.95), width: "100%" }}>
            {[cur, next].filter((i) => i < N).map((i) => {
              const op = i === cur ? textOut : textIn;
              return (
                <div key={i} style={{ position: "absolute", left: "50%", top: 0, transform: "translateX(-50%)", opacity: op, whiteSpace: "nowrap", display: "flex", alignItems: "center", background: pillBg, border: `1px solid ${pillBorder}`, borderRadius: 999, padding: `${Math.round(m * 0.013)}px ${Math.round(m * 0.03)}px`, color: ink, fontSize: Math.round(headPx * 0.52), fontWeight: 500, letterSpacing: "-0.01em" }}>
                  {screens[i].label}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Progress dots — hidden for a single-screen slide (the carousel shows position). */}
      {single ? null : (
        <div style={{ position: "absolute", display: "flex", alignItems: "center", gap: Math.round(m * 0.016), ...dotsBox }}>
          {screens.map((_, i) => {
            const active = i === cur;
            return <div key={i} style={{ width: active ? Math.round(m * 0.052) : Math.round(m * 0.015), height: Math.round(m * 0.015), borderRadius: 999, background: active ? ink : subInk }} />;
          })}
        </div>
      )}
    </AbsoluteFill>
  );
}
