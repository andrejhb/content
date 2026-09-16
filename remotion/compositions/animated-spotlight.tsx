import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { VideoInputProps } from "../root";
import { interVars } from "./font";

function assetSrc(path: string, baseUrl: string) {
  return path.startsWith("http") ? path : `${baseUrl}${path}`;
}

/** Crossfading Ken Burns stills. One photo keeps the original slow camera drift. */
function PhotoCarousel({
  paths,
  baseUrl,
  frame,
  fps,
  durationInFrames,
}: {
  paths: string[];
  baseUrl: string;
  frame: number;
  fps: number;
  durationInFrames: number;
}) {
  const n = paths.length;
  // Long overlap: each still cross-dissolves for most of a second so the day to
  // night walk reads as one slow change of light, not a slideshow.
  const fade = Math.round(fps * 0.9);
  const hold = Math.max(fade + 8, Math.round(durationInFrames / n));
  const kbScale = interpolate(frame, [0, durationInFrames], [1.06, 1.17], {
    extrapolateRight: "clamp",
  });
  const kbX = interpolate(frame, [0, durationInFrames], [-1.2, 1.2], {
    extrapolateRight: "clamp",
  });

  if (n === 1) {
    return (
      <Img
        src={assetSrc(paths[0], baseUrl)}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${kbScale}) translateX(${kbX}%)`,
        }}
      />
    );
  }

  return (
    <>
      {paths.map((p, i) => {
        const start = i * hold;
        const next = start + hold;
        const isLast = i === n - 1;
        const opacity = interpolate(
          frame,
          isLast ? [start, start + fade] : [start, start + fade, next, next + fade],
          isLast ? [0, 1] : [0, 1, 1, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.inOut(Easing.cubic),
          },
        );
        if (opacity <= 0.01) return null;
        const local = Math.max(0, frame - start);
        const scale = interpolate(local, [0, hold + fade], [1.04, 1.13], {
          extrapolateRight: "clamp",
        });
        return (
          <AbsoluteFill key={`${p}-${i}`} style={{ opacity }}>
            <Img
              src={assetSrc(p, baseUrl)}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${scale})`,
              }}
            />
          </AbsoluteFill>
        );
      })}
    </>
  );
}

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
    Math.min(w, h * 1.05) * (landscape ? 0.066 : tall ? 0.1 : 0.08),
  );
  const bottom = brief.spotAlign === "end";
  const pair = bottom && !c.headlineTail;
  const sub = pair ? head : Math.round(w * 0.024);
  const textMax = landscape
    ? Math.round(w * 0.5)
    : tall
      ? Math.round(w * 0.78)
      : Math.round(w * 0.86);
  const ctaH = Math.round(min * 0.075);
  const centerText = (brief as { textAlign?: string }).textAlign === "center";
  const vCenter = (brief as { vAlign?: string }).vAlign === "center";
  const ctaLink = (brief as { ctaStyle?: string }).ctaStyle === "link";
  const ctaBeat = (brief as { ctaBeat?: boolean }).ctaBeat === true;
  const sequential = (brief as { sequential?: boolean }).sequential === true;

  const stills = (brief.images?.length ? brief.images : brief.image ? [brief.image] : []).filter(
    (p): p is string => typeof p === "string" && p.length > 0,
  );
  const src = stills[0]
    ? stills[0].startsWith("http")
      ? stills[0]
      : `${baseUrl}${stills[0]}`
    : brief.image
      ? brief.image.startsWith("http")
        ? brief.image
        : `${baseUrl}${brief.image}`
      : null;
  const isVideo = !!src && stills.length <= 1 && /\.(mp4|webm|mov)$/i.test(src);

  const rotating = c.rotating ?? [];
  const hasRotating = rotating.length > 0;
  const logoH = Math.round(min * 0.098);
  const logoIn = interpolate(frame, [0, Math.round(fps * 0.5)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // The pair lockup snaps into place; every other brief keeps the slow settle.
  const enterConfig = pair
    ? { damping: 26, stiffness: 220, mass: 0.7 }
    : { damping: 200 };
  const enter = (delay: number) => {
    const s = spring({ frame: frame - delay, fps, config: enterConfig });
    return {
      opacity: s,
      transform: `translateY(${interpolate(s, [0, 1], [Math.round(h * 0.02), 0])}px)`,
    };
  };

  // brief.ctaPill: false turns the CTA into a second beat: the headline holds,
  // then crossfades into the CTA line rendered at headline weight (the
  // phone-mockup-ui ending, brought to the spotlight).
  const ctaText = (brief as { ctaPill?: boolean }).ctaPill === false && Boolean(c.cta);
  const ctaSwap = ctaText
    ? Math.max(
        0,
        Math.min(
          1,
          spring({
            frame: frame - Math.round(durationInFrames * 0.58),
            fps,
            config: { damping: 20, stiffness: 170, mass: 0.6 },
          }),
        ),
      )
    : 0;
  // Pair lockup: setup lands first, payoff one second later, then setup
  // opacity drops, then the CTA pill.
  const setupDelay = pair ? Math.round(fps * 0.3) : 8;
  const payoffDelay = pair ? Math.round(fps * 2.0) : 15;
  const dimAt = pair ? payoffDelay : 0;
  const ctaDelay = pair && c.cta && !ctaText ? Math.round(fps * 2.0) : 22;
  // Beat clock, derived from the composition length so the piece can be recut
  // to any duration: the ask holds for a fixed tail, the two copy beats split
  // what is left evenly, each clearing before the next lands.
  const totalSec = durationInFrames / fps;
  const ctaTail = 4.4;
  const beatGap = 0.5;
  const seqStart = 0.3;
  const ctaInSec = Math.max(seqStart + 2, totalSec - ctaTail);
  const beatSpan = Math.max(0.8, (ctaInSec - seqStart - beatGap * 2) / 2);
  const setupOutSec = seqStart + beatSpan;
  const payoffInSec = setupOutSec + beatGap;
  const payoffOutSec = payoffInSec + beatSpan;
  const copyExitAt = Math.round(fps * (ctaInSec - 0.6));
  const copyOut = ctaBeat
    ? interpolate(frame, [copyExitAt, copyExitAt + Math.round(fps * 0.35)], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.in(Easing.cubic),
      })
    : 1;
  // One line at a time: each beat springs in, holds, then clears before the next.
  const beatAt = (inSec: number, outSec: number | null) => {
    const inFrame = Math.round(fps * inSec);
    const s = Math.max(
      0,
      Math.min(1, spring({ frame: frame - inFrame, fps, config: enterConfig })),
    );
    const out =
      outSec === null
        ? 1
        : interpolate(
            frame,
            [Math.round(fps * outSec), Math.round(fps * (outSec + 0.3))],
            [1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.in(Easing.cubic),
            },
          );
    return {
      opacity: s * out,
      transform: `translateY(${
        interpolate(s, [0, 1], [Math.round(h * 0.02), 0]) + Math.round(head * 0.3) * (1 - out)
      }px)`,
    };
  };
  const ctaBeatIn = ctaBeat
    ? Math.max(
        0,
        Math.min(1, spring({ frame: frame - Math.round(fps * ctaInSec), fps, config: enterConfig })),
      )
    : 0;
  const headSpring = spring({
    frame: frame - setupDelay,
    fps,
    config: enterConfig,
  });
  const setupDim = pair
    ? interpolate(frame, [dimAt, dimAt + Math.round(fps * 0.22)], [1, 0.5], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    : 1;
  const outro = interpolate(
    frame,
    [durationInFrames - Math.round(fps * 0.5), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const scrim = vCenter
    ? [
        "linear-gradient(0deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.64) 34%, rgba(0,0,0,0.58) 62%, rgba(0,0,0,0.66) 100%)",
      ].join(", ")
    : bottom
    ? [
        centerText
          ? "linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.56) 38%, rgba(0,0,0,0.2) 62%, rgba(0,0,0,0) 80%)"
          : "linear-gradient(0deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.38) 36%, rgba(0,0,0,0) 62%)",
        "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.12) 30%, rgba(0,0,0,0) 50%)",
      ].join(", ")
    : [
        "linear-gradient(90deg, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.7) 42%, rgba(0,0,0,0.38) 72%, rgba(0,0,0,0.12) 100%)",
        "linear-gradient(0deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0) 50%)",
      ].join(", ");

  return (
    <AbsoluteFill style={{ background: "#111111", ...interVars, fontFamily: "var(--font-inter)" }}>
      {isVideo && src ? (
        <AbsoluteFill>
          <OffthreadVideo
            src={src}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>
      ) : stills.length ? (
        <AbsoluteFill>
          <PhotoCarousel
            paths={stills}
            baseUrl={baseUrl}
            frame={frame}
            fps={fps}
            durationInFrames={durationInFrames}
          />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ background: scrim }} />

      {/* Hububb wordmark, top-left, white on the dark scrim. */}
      <div style={{ position: "absolute", top: pad, left: pad, opacity: logoIn * (pair ? 1 : outro) }}>
        <Img
          src={`${baseUrl}/asset/shared/logos/hububb-wordmark-white.svg`}
          alt="Hububb"
          style={{ height: logoH, display: "block" }}
        />
      </div>

      <AbsoluteFill
        style={{
          display: sequential ? "none" : "flex",
          flexDirection: "column",
          justifyContent: vCenter ? "center" : bottom ? "flex-end" : "center",
          alignItems: centerText ? "center" : undefined,
          textAlign: centerText ? "center" : undefined,
          padding: pad,
          paddingBottom: centerText && bottom && !vCenter ? Math.round(h * 0.1) : pad,
          gap: Math.round(head * 0.5),
          opacity: (pair ? 1 : outro) * copyOut,
          transform: `translateY(${Math.round(head * 0.3) * (1 - copyOut)}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: centerText ? "center" : undefined,
            maxWidth: textMax,
            gap: Math.round(head * 0.28),
          }}
        >
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
                      lineHeight: 1.2,
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
            <div style={{ position: "relative" }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: head,
                  lineHeight: pair ? 1.19 : 1.2,
                  letterSpacing: pair ? "-0.03em" : "-0.02em",
                  fontWeight: 600,
                  color: "#ffffff",
                  textWrap: "balance",
                  opacity: headSpring * setupDim * (1 - ctaSwap),
                  transform: `translateY(${interpolate(headSpring, [0, 1], [Math.round(h * 0.02), 0]) - Math.round(head * 0.12) * ctaSwap}px)`,
                }}
              >
                <span>{c.headline}</span>
                {c.headlineTail ? (
                  <span style={{ color: "rgba(255,255,255,0.5)" }}> {c.headlineTail}</span>
                ) : null}
              </h1>
              {ctaText ? (
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    fontSize: head,
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                    fontWeight: 600,
                    color: "#ffffff",
                    textWrap: "balance",
                    opacity: ctaSwap,
                    transform: `translateY(${Math.round(head * 0.14) * (1 - ctaSwap)}px)`,
                  }}
                >
                  {c.cta}
                </span>
              ) : null}
            </div>
          )}
          {c.subhead ? (
            <p
              style={{
                margin: 0,
                fontSize: sub,
                lineHeight: pair ? 1.19 : 1.4,
                letterSpacing: pair ? "-0.03em" : undefined,
                fontWeight: pair ? 600 : 400,
                color: pair ? "#ffffff" : "rgba(255,255,255,0.66)",
                maxWidth: Math.round(textMax * 0.92),
                ...enter(pair ? payoffDelay : 15),
              }}
            >
              {c.subhead}
            </p>
          ) : null}
        </div>

        {c.cta && !ctaText && !ctaBeat ? (
          ctaLink ? (
            // No button: the CTA is a line of type with an arrow off the end.
            <div
              style={{
                display: "inline-flex",
                width: "fit-content",
                alignItems: "center",
                gap: Math.round(min * 0.018),
                color: "#ffffff",
                fontWeight: 600,
                fontSize: Math.round(w * 0.042),
                letterSpacing: "-0.01em",
                ...enter(ctaDelay),
              }}
            >
              <span>{c.cta}</span>
              <span style={{ fontSize: "1.05em", lineHeight: 1 }}>&#8594;</span>
            </div>
          ) : (
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
                ...enter(ctaDelay),
              }}
            >
              {c.cta}
            </div>
          )
        ) : null}
      </AbsoluteFill>

      {sequential
        ? (
            [
              { key: "setup", text: c.headline, inAt: seqStart, outAt: setupOutSec },
              { key: "payoff", text: c.subhead, inAt: payoffInSec, outAt: payoffOutSec },
            ] as const
          ).map((b) =>
            b.text ? (
              <AbsoluteFill
                key={b.key}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: vCenter ? "center" : "flex-end",
                  alignItems: centerText ? "center" : "flex-start",
                  textAlign: centerText ? "center" : undefined,
                  padding: pad,
                  ...beatAt(b.inAt, b.outAt),
                }}
              >
                <h1
                  style={{
                    margin: 0,
                    fontSize: head,
                    lineHeight: 1.19,
                    letterSpacing: "-0.03em",
                    fontWeight: 600,
                    color: "#ffffff",
                    textWrap: "balance",
                    // Narrower measure on the wider formats so the setup breaks
                    // into three lines the way it does at 9:16, instead of
                    // splitting "short-term" across a line end.
                    maxWidth: tall ? textMax : Math.round(w * 0.7),
                  }}
                >
                  {b.text}
                </h1>
              </AbsoluteFill>
            ) : null,
          )
        : null}

      {/* End card: the copy clears, then the ask lands on its own. */}
      {ctaBeat && c.cta ? (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: vCenter ? "center" : "flex-end",
            alignItems: centerText ? "center" : "flex-start",
            textAlign: centerText ? "center" : undefined,
            padding: pad,
            gap: Math.round(head * 0.22),
            opacity: ctaBeatIn,
            transform: `translateY(${Math.round(head * 0.28) * (1 - ctaBeatIn)}px)`,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: Math.round(min * 0.022),
              fontSize: head,
              lineHeight: 1.19,
              letterSpacing: "-0.03em",
              fontWeight: 600,
              color: "#ffffff",
            }}
          >
            <span>{c.cta}</span>
            <span style={{ fontSize: "0.92em", lineHeight: 1 }}>&#8594;</span>
          </div>
          {c.ctaSub ? (
            <p
              style={{
                margin: 0,
                fontSize: sub,
                lineHeight: 1.19,
                letterSpacing: "-0.03em",
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {c.ctaSub}
            </p>
          ) : null}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
}
