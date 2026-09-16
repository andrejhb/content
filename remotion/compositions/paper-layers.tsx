import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { PaperLayer } from "../../lib/creatives";
import type { VideoInputProps } from "../root";
import { interVars } from "./font";

// paper-layers: a light motion pass over a still designed in Paper. The still is
// exported as flat layers (background, wordmark, device plate / screen / frame,
// floating cards) and each layer enters on its own beat with opacity and travel
// only. Type is rendered live in Inter so the copy stays QA-gated: the headline
// lands as two beats, holds, then clears for the CTA as its own two-beat close.
//
// brief.image is the background still. brief.layers places every exported PNG
// in 1080-square design pixels (scaled by w / 1080 for other sizes) with an
// entrance and a start time. A layer with `clip` is a masked window whose image
// drifts up by `scroll` px during the hold, which is how the calendar screen
// reads as live UI without redrawing it.

const EASE = (t: number) => 1 - Math.pow(1 - t, 3);

function useEnter(at: number, len: number) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = Math.max(0, Math.min(1, (frame - at * fps) / (len * fps)));
  return EASE(t);
}

function Layer({ layer, baseUrl, u, hold }: { layer: PaperLayer; baseUrl: string; u: number; hold: [number, number] }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = layer.at ?? 0;
  const enter = layer.enter ?? "fade";

  // Devices rise on a spring; cards and chrome ease in on travel + opacity.
  const sp = spring({ frame: frame - at * fps, fps, config: { damping: 22, mass: 0.9, stiffness: 110 } });
  const e = useEnter(at, 0.5);
  const p = enter === "up" ? sp : e;
  const travel = Math.round(90 * u);
  const dx = enter === "left" ? -travel * (1 - p) : enter === "right" ? travel * (1 - p) : 0;
  const dy = enter === "up" ? Math.round(160 * u) * (1 - p) : 0;
  const opacity = enter === "up" ? Math.min(1, sp * 1.6) : e;

  const scroll = layer.scroll
    ? interpolate(frame, [hold[0] * fps, hold[1] * fps], [0, -layer.scroll * u], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: (t) => 0.5 - 0.5 * Math.cos(Math.PI * t),
      })
    : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: layer.x * u,
        top: layer.y * u,
        width: layer.w * u,
        height: layer.h * u,
        transform: `translate(${dx}px, ${dy}px)`,
        opacity,
        filter: layer.shadow,
        borderRadius: layer.clip ? layer.clip * u : undefined,
        overflow: layer.clip ? "hidden" : undefined,
        background: layer.clip ? "#ffffff" : undefined,
      }}
    >
      <Img
        src={`${baseUrl}${layer.src}`}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          transform: scroll ? `translateY(${scroll}px)` : undefined,
        }}
      />
      {layer.scroll && layer.scrollFrom ? (
        // Everything above the grid (status bar, island, property row, weekday
        // labels) stays put like a sticky header: a second, unscrolled copy of
        // that band sits over the drifting weeks, so the scroll reads as the app.
        <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: layer.scrollFrom * u, overflow: "hidden" }}>
          <Img src={`${baseUrl}${layer.src}`} style={{ width: layer.w * u, height: layer.h * u, display: "block" }} />
        </div>
      ) : null}
    </div>
  );
}

function Line({
  text,
  weight,
  at,
  out,
  size,
  u,
}: {
  text: string;
  weight: 400 | 600;
  at: number;
  out?: number;
  size: number;
  u: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = useEnter(at, 0.3);
  const outP = out === undefined ? 0 : EASE(Math.max(0, Math.min(1, (frame - out * fps) / (0.25 * fps))));
  const dy = Math.round(26 * u) * (1 - inP) - Math.round(14 * u) * outP;
  return (
    <div
      style={{
        fontSize: size,
        lineHeight: 1.16,
        fontWeight: weight,
        letterSpacing: "-0.02em",
        color: "#ffffff",
        opacity: inP * (1 - outP),
        transform: `translateY(${dy}px)`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
}

export function PaperLayers({ brief, baseUrl }: VideoInputProps) {
  const { width: w, durationInFrames, fps } = useVideoConfig();
  const u = w / 1080;
  const c = brief.copy;
  const layers = brief.layers ?? [];
  const total = durationInFrames / fps;

  // Beat sheet, in seconds. Headline lands in two pieces, holds while the
  // screen drifts, clears, then the CTA lands in two pieces and holds to the end.
  const h1At = 0.7;
  const h2At = 1.15;
  // The screen drifts across most of the film, not just the hold, so the
  // movement is one long ease with no visible start or stop.
  const hold: [number, number] = [1.6, Math.min(8.4, total - 1.4)];
  const outAt = 6.4;
  const cta1At = outAt + 0.35;
  const cta2At = cta1At + 0.4;

  const size = Math.round(69 * u);
  const [ctaA, ctaB] = splitCta(c.cta ?? "");

  return (
    <AbsoluteFill style={{ background: "#0d0d0d", fontFamily: "var(--font-inter)", ...interVars }}>
      {brief.image ? (
        <Img src={`${baseUrl}${brief.image}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : null}

      {layers.map((l, i) => (
        <Layer key={`${l.src}-${i}`} layer={l} baseUrl={baseUrl} u={u} hold={hold} />
      ))}

      <div style={{ position: "absolute", left: 81 * u, top: 182 * u, width: 860 * u, display: "flex", flexDirection: "column" }}>
        {c.headline ? <Line text={c.headline} weight={400} at={h1At} out={outAt} size={size} u={u} /> : null}
        {c.headlineTail ? <Line text={c.headlineTail} weight={600} at={h2At} out={outAt} size={size} u={u} /> : null}
      </div>

      {c.cta ? (
        <div style={{ position: "absolute", left: 81 * u, top: 182 * u, width: 860 * u, display: "flex", flexDirection: "column" }}>
          <Line text={ctaA} weight={400} at={cta1At} size={size} u={u} />
          {ctaB ? <Line text={ctaB} weight={600} at={cta2At} size={size} u={u} /> : null}
        </div>
      ) : null}
    </AbsoluteFill>
  );
}

// "List on Hububb, get longer stays" → ["List on Hububb,", "get longer stays"]
function splitCta(cta: string): [string, string] {
  const i = cta.indexOf(",");
  if (i === -1) return [cta, ""];
  const a = cta.slice(0, i + 1).trim();
  const b = cta.slice(i + 1).trim();
  return [a, b];
}
