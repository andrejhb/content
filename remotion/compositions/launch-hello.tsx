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
import { LoopedVideo } from "./looped-video";

// Motion launch greeting for @wearehububb. "Hi there" lands, holds ~1s, then
// "We are Hububb" arrives vibrant. After the headline, three rounded frames fade
// in calmly. Layout per format: 16:9 and the 9:16 story use a CSS grid (two
// portrait frames + one wide frame spanning both columns); 4:5 and 1:1 use a
// tight top-right cluster with the text below-left. Clips play slightly slowed
// so the piece ends on the last frame, no loop.

const MEDIA = [
  "/asset/general/clips/drone.mp4",
  "/asset/general/clips/door.mp4",
  "/asset/general/clips/cleaner.mp4",
];
// Clips are 5s; slowing them stretches how long they play so the whole piece can
// run longer without the framed videos ever stopping or looping. 0.7x → ~7.1s.
const CLIP_RATE = 0.7;

function CardMedia({ src, baseUrl }: { src: string; baseUrl: string }) {
  const url = `${baseUrl}${src}`;
  const common = { width: "100%", height: "100%", objectFit: "cover" as const };
  if (src.endsWith(".mp4")) {
    return <LoopedVideo src={url} playbackRate={CLIP_RATE} style={common} />;
  }
  return <Img src={url} style={common} />;
}

export function LaunchHelloMotion({ brief, baseUrl }: VideoInputProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const c = brief.copy;
  const m = Math.min(w, h);
  const dark = brief.variant !== "light";
  const ar = h / w;

  const bg = dark ? "bg-mono-20" : "bg-mono-1";
  const mainText = dark ? "text-mono-1" : "text-mono-21";
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

  // Per-format layout.
  let mode: "grid" | "slots";
  let grid = { left: 0, top: 0, width: 0 };
  let frameW = 0;
  let slots: { x: number; y: number }[] = [];
  let head: { top: number; maxW: number; size: number };
  if (ar >= 1.5) {
    // 9:16 story — grid, sitting lower, with the text a little lower too.
    mode = "grid";
    const width = w - 2 * pad;
    grid = { left: pad, top: Math.round(0.44 * h), width };
    head = { top: Math.round(0.2 * h), maxW: 0.9 * w, size: 0.1 };
  } else if (ar <= 0.7) {
    // 16:9 — grid on the right (kept as is).
    mode = "grid";
    const width = Math.round(0.44 * w);
    grid = { left: w - pad - width, top: Math.round((h - gridHeight(width)) / 2), width };
    head = { top: Math.round(0.4 * h), maxW: 0.46 * w, size: 0.092 };
  } else if (ar >= 1.15) {
    // 4:5 — tight cluster top-right (bleeds off the right edge), text below-left.
    mode = "slots";
    frameW = 0.26;
    slots = [{ x: 0.6, y: 0.15 }, { x: 0.9, y: 0.16 }, { x: 0.7, y: 0.45 }];
    head = { top: Math.round(0.63 * h), maxW: 0.72 * w, size: 0.104 };
  } else {
    // 1:1 — same cluster as 4:5, but the square is shorter so the bottom frame
    // sits lower to keep a clear gap from the top row (no collision).
    mode = "slots";
    frameW = 0.25;
    slots = [{ x: 0.58, y: 0.17 }, { x: 0.88, y: 0.18 }, { x: 0.7, y: 0.54 }];
    head = { top: Math.round(0.72 * h), maxW: 0.74 * w, size: 0.085 };
  }
  const headPx = Math.round(Math.min(w, h * 1.05) * head.size);
  // Logo a little larger on the 9:16 story and 16:9.
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

  // Headline: "Hi there" lands, holds ~1s, then "We are Hububb" arrives.
  const introDelay = Math.round(fps * 0.3);
  const tailDelay = Math.round(fps * 1.3);
  const intro = enterAt(introDelay, m * 0.03);
  const tail = enterAt(tailDelay, m * 0.04);
  const vibrancy = interpolate(frame, [tailDelay, tailDelay + Math.round(fps * 0.5)], [1, 0.42], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className={`${bg} ${mainText} font-sans`} style={interVars}>
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(120% 90% at 50% 30%, ${glow} 0%, rgba(255,255,255,0) 60%)` }}
      />

      {mode === "grid" ? (
        <div
          className="absolute"
          style={{ left: grid.left, top: grid.top, width: grid.width, display: "grid", gridTemplateColumns: "1fr 1fr", gap }}
        >
          <div style={{ aspectRatio: "4 / 5", ...cardStyle, ...frameEnter(0) }}>
            <CardMedia src={MEDIA[0]} baseUrl={baseUrl} />
          </div>
          <div style={{ aspectRatio: "4 / 5", ...cardStyle, ...frameEnter(1) }}>
            <CardMedia src={MEDIA[1]} baseUrl={baseUrl} />
          </div>
          <div style={{ gridColumn: "1 / -1", aspectRatio: band, ...cardStyle, ...frameEnter(2) }}>
            <CardMedia src={MEDIA[2]} baseUrl={baseUrl} />
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
              <CardMedia src={MEDIA[i]} baseUrl={baseUrl} />
            </div>
          );
        })
      )}

      {brief.brandMark ? (
        <div className="absolute" style={{ left: pad, top: pad, ...enterAt(Math.round(fps * 0.1)).style }}>
          <Img
            src={`${baseUrl}/asset/shared/logos/hububb-wordmark.svg`}
            alt="Hububb"
            style={{ height: mark, width: "auto", filter: dark ? "brightness(0) invert(1)" : undefined }}
          />
        </div>
      ) : null}

      <div
        className="absolute flex flex-col"
        style={{ left: pad, top: head.top, maxWidth: head.maxW, gap: Math.round(headPx * 0.2) }}
      >
        {c.headline ? (
          <span
            className={`font-semibold tracking-tight ${mainText}`}
            style={{
              fontSize: headPx,
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              opacity: intro.s * vibrancy,
              transform: intro.style.transform,
            }}
          >
            {c.headline}
          </span>
        ) : null}
        {c.headlineTail ? (
          <span
            className={`font-semibold tracking-tight ${mainText}`}
            style={{ fontSize: headPx, lineHeight: 1.0, letterSpacing: "-0.03em", ...tail.style }}
          >
            {c.headlineTail}
          </span>
        ) : null}
      </div>
    </AbsoluteFill>
  );
}
