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

// Motion take on the spotlight template: the background eases in with a slow
// zoom (a still photo gets a light Ken Burns drift; an mp4 background plays as a
// light moving clip), then the eyebrow, two-tone headline, subhead, and optional
// CTA stagger up. Same layout math and scrim as components/templates/spotlight.
export function AnimatedSpotlight({ brief, baseUrl }: VideoInputProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h, durationInFrames } = useVideoConfig();
  const c = brief.copy;
  const landscape = w > h;
  const tall = w / h <= 0.6; // 9:16 — bigger type, narrower measure so it wraps
  const min = Math.min(w, h);
  const pad = Math.round(min * 0.085);
  const eye = Math.round(w * 0.02);
  const head = Math.round(
    Math.min(w, h * 1.05) * (landscape ? 0.06 : tall ? 0.096 : 0.072),
  );
  const sub = Math.round(w * 0.024);
  const textMax = landscape
    ? Math.round(w * 0.5)
    : tall
      ? Math.round(w * 0.78)
      : Math.round(w * 0.86);
  const ctaH = Math.round(min * 0.075);

  const src = brief.image
    ? brief.image.startsWith("http")
      ? brief.image
      : `${baseUrl}${brief.image}`
    : null;
  const isVideo = !!src && /\.(mp4|webm|mov)$/i.test(src);

  // Camera move: a slow push-in with a slight horizontal drift, so a still
  // background reads as a gentle live camera. (When the background is an mp4 —
  // e.g. a Higgsfield clip — the clip supplies the motion and this is skipped.)
  const kbScale = interpolate(frame, [0, durationInFrames], [1.06, 1.17], {
    extrapolateRight: "clamp",
  });
  const kbX = interpolate(frame, [0, durationInFrames], [-1.2, 1.2], {
    extrapolateRight: "clamp",
  });

  const rotating = c.rotating ?? [];
  const hasRotating = rotating.length > 0;
  const logoH = Math.round(min * 0.044);
  const logoIn = interpolate(frame, [0, Math.round(fps * 0.5)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const enter = (delay: number) => {
    const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
    return {
      opacity: s,
      transform: `translateY(${interpolate(s, [0, 1], [Math.round(h * 0.02), 0])}px)`,
    };
  };
  const outro = interpolate(
    frame,
    [durationInFrames - Math.round(fps * 0.5), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const scrim = [
    "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.52) 42%, rgba(0,0,0,0.2) 72%, rgba(0,0,0,0) 100%)",
    "linear-gradient(0deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0) 42%)",
  ].join(", ");

  return (
    <AbsoluteFill style={{ background: "#111111", ...interVars, fontFamily: "var(--font-inter)" }}>
      {src ? (
        <AbsoluteFill>
          {isVideo ? (
            <OffthreadVideo
              src={src}
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Img
              src={src}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${kbScale}) translateX(${kbX}%)`,
              }}
            />
          )}
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ background: scrim }} />

      {/* Hububb wordmark, top-left, white on the dark scrim. */}
      <div style={{ position: "absolute", top: pad, left: pad, opacity: logoIn * outro }}>
        <Img
          src={`${baseUrl}/asset/shared/logos/hububb-wordmark.svg`}
          alt="Hububb"
          style={{ height: logoH, filter: "brightness(0) invert(1)", display: "block" }}
        />
      </div>

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: pad,
          gap: Math.round(head * 0.5),
          opacity: outro,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: textMax, gap: Math.round(head * 0.28) }}>
          {c.eyebrow ? (
            <span
              style={{
                fontSize: eye,
                fontWeight: 500,
                letterSpacing: "0.01em",
                color: "rgba(255,255,255,0.66)",
                ...enter(2),
              }}
            >
              {c.eyebrow}
            </span>
          ) : null}
          {hasRotating ? (
            <div style={{ position: "relative", minHeight: Math.round(head * 3.1) }}>
              {rotating.map((msg, i) => {
                // Each message slides up into place, holds, then slides up and
                // out as the next arrives. The last one holds to the end.
                const seg = durationInFrames / rotating.length;
                const tIn = Math.round(fps * 0.22);
                const tOut = Math.round(fps * 0.22);
                const shift = Math.round(h * 0.035);
                const lf = frame - i * seg;
                const isLast = i === rotating.length - 1;
                const inO = interpolate(lf, [0, tIn], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                const outO = isLast
                  ? 1
                  : interpolate(lf, [seg - tOut, seg], [1, 0], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    });
                const inY = interpolate(lf, [0, tIn], [shift, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                const outY = isLast
                  ? 0
                  : interpolate(lf, [seg - tOut, seg], [0, -shift], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    });
                return (
                  <h1
                    key={i}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      margin: 0,
                      fontSize: head,
                      lineHeight: 1.04,
                      letterSpacing: "-0.02em",
                      fontWeight: 600,
                      color: "#ffffff",
                      textWrap: "balance",
                      maxWidth: textMax,
                      opacity: inO * outO,
                      transform: `translateY(${inY + outY}px)`,
                    }}
                  >
                    {msg}
                  </h1>
                );
              })}
            </div>
          ) : (
            <h1
              style={{
                margin: 0,
                fontSize: head,
                lineHeight: 1.04,
                letterSpacing: "-0.02em",
                fontWeight: 600,
                color: "#ffffff",
                textWrap: "balance",
                ...enter(8),
              }}
            >
              <span>{c.headline}</span>
              {c.headlineTail ? (
                <span style={{ color: "rgba(255,255,255,0.5)" }}> {c.headlineTail}</span>
              ) : null}
            </h1>
          )}
          {c.subhead ? (
            <p
              style={{
                margin: 0,
                fontSize: sub,
                lineHeight: 1.4,
                color: "rgba(255,255,255,0.66)",
                maxWidth: Math.round(textMax * 0.92),
                ...enter(15),
              }}
            >
              {c.subhead}
            </p>
          ) : null}
        </div>

        {c.cta ? (
          <div
            style={{
              display: "inline-flex",
              width: "fit-content",
              alignItems: "center",
              height: ctaH,
              paddingLeft: Math.round(min * 0.045),
              paddingRight: Math.round(min * 0.045),
              borderRadius: 9999,
              background: "#ffffff",
              color: "#111111",
              fontWeight: 600,
              fontSize: Math.round(w * 0.022),
              ...enter(22),
            }}
          >
            {c.cta}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
