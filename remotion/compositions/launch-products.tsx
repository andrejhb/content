import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { VideoInputProps } from "../root";
import { interVars } from "./font";

// Post 3 of the @wearehububb launch: the resolution. Same frame system as the
// hello, but each frame is now labelled with one of the three products, so the
// invisible layer resolves into Host / Stay / Work. Two-tone headline lands, then
// the labelled frames fade in calmly.

const MEDIA = [
  "/asset/general/clips/drone.mp4",
  "/asset/general/clips/door.mp4",
  "/asset/general/clips/cleaner.mp4",
];
const PRODUCTS = [
  { name: "Host", line: "runs the property" },
  { name: "Stay", line: "the managed stay" },
  { name: "Work", line: "the work behind it" },
];
const CLIP_RATE = 0.7;

function CardInner({ src, baseUrl, i, cardW }: { src: string; baseUrl: string; i: number; cardW: number }) {
  const url = `${baseUrl}${src}`;
  const nameSize = Math.round(cardW * 0.12);
  const lineSize = Math.round(cardW * 0.061);
  const p = Math.round(cardW * 0.075);
  return (
    <>
      <OffthreadVideo src={url} muted loop playbackRate={CLIP_RATE} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.74) 0%, rgba(0,0,0,0.12) 34%, rgba(0,0,0,0) 60%)" }} />
      <div style={{ position: "absolute", left: p, bottom: p, color: "#ffffff" }}>
        <div style={{ fontSize: nameSize, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1 }}>{PRODUCTS[i].name}</div>
        <div style={{ fontSize: lineSize, color: "rgba(255,255,255,0.82)", marginTop: Math.round(cardW * 0.03), lineHeight: 1.2 }}>{PRODUCTS[i].line}</div>
      </div>
    </>
  );
}

export function LaunchProducts({ brief, baseUrl }: VideoInputProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const c = brief.copy;
  const m = Math.min(w, h);
  const dark = brief.variant !== "light";
  const ar = h / w;

  const bg = dark ? "bg-mono-20" : "bg-mono-1";
  const mainText = dark ? "text-mono-1" : "text-mono-21";
  const muted = dark ? "text-mono-5" : "text-mono-11";
  const glow = dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.05)";
  const cardShadow = dark
    ? "0 40px 100px rgba(0,0,0,0.5), 0 12px 32px rgba(0,0,0,0.35)"
    : "0 34px 80px rgba(0,0,0,0.16), 0 10px 24px rgba(0,0,0,0.10)";
  const cardBorder = dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)";
  const cardStyle = { borderRadius: Math.round(m * 0.02), boxShadow: cardShadow, border: cardBorder, overflow: "hidden" as const };

  const pad = Math.round(m * 0.085);
  const gap = Math.round(m * 0.026);
  const band = "20 / 8";
  const gridHeight = (width: number) => ((width - gap) / 2) * 1.25 + gap + width * (8 / 20);

  let mode: "grid" | "slots";
  let grid = { left: 0, top: 0, width: 0 };
  let frameW = 0;
  let slots: { x: number; y: number }[] = [];
  let head: { top: number; maxW: number; size: number };
  if (ar >= 1.5) {
    mode = "grid";
    const width = w - 2 * pad;
    grid = { left: pad, top: Math.round(0.44 * h), width };
    head = { top: Math.round(0.18 * h), maxW: 0.9 * w, size: 0.1 };
  } else if (ar <= 0.7) {
    mode = "grid";
    const width = Math.round(0.44 * w);
    grid = { left: w - pad - width, top: Math.round((h - gridHeight(width)) / 2), width };
    head = { top: Math.round(0.4 * h), maxW: 0.5, size: 0.092 };
    head.maxW = 0.5 * w;
  } else if (ar >= 1.15) {
    mode = "slots";
    frameW = 0.26;
    slots = [{ x: 0.6, y: 0.15 }, { x: 0.9, y: 0.16 }, { x: 0.7, y: 0.45 }];
    head = { top: Math.round(0.63 * h), maxW: 0.72 * w, size: 0.104 };
  } else {
    mode = "slots";
    frameW = 0.25;
    slots = [{ x: 0.58, y: 0.17 }, { x: 0.88, y: 0.18 }, { x: 0.7, y: 0.54 }];
    head = { top: Math.round(0.72 * h), maxW: 0.74 * w, size: 0.085 };
  }
  const headPx = Math.round(Math.min(w, h * 1.05) * head.size);
  const mark = Math.round(m * (ar >= 1.5 || ar <= 0.7 ? 0.085 : 0.068));

  const frameEnter = (i: number) => {
    const s = spring({ frame: frame - Math.round(fps * (2.0 + i * 0.35)), fps, config: { damping: 200, stiffness: 55 } });
    return {
      opacity: s,
      transform: `translateY(${interpolate(s, [0, 1], [m * 0.025, 0])}px) scale(${interpolate(s, [0, 1], [0.985, 1])})`,
    };
  };

  const enterAt = (delay: number, rise = m * 0.03) => {
    const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
    return { s, style: { opacity: s, transform: `translateY(${interpolate(s, [0, 1], [rise, 0])}px)` } };
  };

  const introDelay = Math.round(fps * 0.3);
  const tailDelay = Math.round(fps * 1.3);
  const intro = enterAt(introDelay, m * 0.03);
  const tail = enterAt(tailDelay, m * 0.04);
  const vibrancy = interpolate(frame, [tailDelay, tailDelay + Math.round(fps * 0.5)], [1, 0.42], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const gridCW = mode === "grid" ? Math.round((grid.width - gap) / 2) : 0;

  return (
    <AbsoluteFill className={`${bg} ${mainText} font-sans`} style={interVars}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(120% 90% at 50% 30%, ${glow} 0%, rgba(255,255,255,0) 60%)` }} />

      {mode === "grid" ? (
        <div className="absolute" style={{ left: grid.left, top: grid.top, width: grid.width, display: "grid", gridTemplateColumns: "1fr 1fr", gap }}>
          <div style={{ position: "relative", aspectRatio: "4 / 5", ...cardStyle, ...frameEnter(0) }}>
            <CardInner src={MEDIA[0]} baseUrl={baseUrl} i={0} cardW={gridCW} />
          </div>
          <div style={{ position: "relative", aspectRatio: "4 / 5", ...cardStyle, ...frameEnter(1) }}>
            <CardInner src={MEDIA[1]} baseUrl={baseUrl} i={1} cardW={gridCW} />
          </div>
          <div style={{ position: "relative", gridColumn: "1 / -1", aspectRatio: band, ...cardStyle, ...frameEnter(2) }}>
            <CardInner src={MEDIA[2]} baseUrl={baseUrl} i={2} cardW={grid.width} />
          </div>
        </div>
      ) : (
        slots.map((slot, i) => {
          const cardW = Math.round(m * frameW);
          const cardH = Math.round(cardW * 1.25);
          return (
            <div
              key={i}
              className="absolute"
              style={{
                width: cardW,
                height: cardH,
                left: Math.round(slot.x * w - cardW / 2),
                top: Math.round(slot.y * h - cardH / 2),
                ...cardStyle,
                ...frameEnter(i),
              }}
            >
              <CardInner src={MEDIA[i]} baseUrl={baseUrl} i={i} cardW={cardW} />
            </div>
          );
        })
      )}

      {brief.brandMark ? (
        <div className="absolute" style={{ left: pad, top: pad, ...enterAt(Math.round(fps * 0.1)).style }}>
          <Img src={`${baseUrl}/asset/shared/logos/hububb-wordmark.svg`} alt="Hububb" style={{ height: mark, width: "auto", filter: dark ? "brightness(0) invert(1)" : undefined }} />
        </div>
      ) : null}

      <div className="absolute flex flex-col" style={{ left: pad, top: head.top, maxWidth: head.maxW, gap: Math.round(headPx * 0.2) }}>
        {c.headline ? (
          <span className={`font-semibold tracking-tight ${mainText}`} style={{ fontSize: headPx, lineHeight: 1.0, letterSpacing: "-0.03em", opacity: intro.s * vibrancy, transform: intro.style.transform }}>
            {c.headline}
          </span>
        ) : null}
        {c.headlineTail ? (
          <span className={`font-semibold tracking-tight ${mainText}`} style={{ fontSize: headPx, lineHeight: 1.0, letterSpacing: "-0.03em", ...tail.style }}>
            {c.headlineTail}
          </span>
        ) : null}
      </div>
    </AbsoluteFill>
  );
}
