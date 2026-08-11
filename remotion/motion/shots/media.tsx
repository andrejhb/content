import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SCRIM, assetUrl, enter, kenBurns } from "../helpers";
import { mono } from "../tokens";
import type { ShotProps } from "./types";

// Full-bleed photo or clip under the house scrim, an optional caption line
// settling low in the frame. A still gets the slow Ken Burns push; an mp4
// supplies its own motion.
export function MediaShot({ beat, baseUrl }: ShotProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h, durationInFrames } = useVideoConfig();
  const min = Math.min(w, h);
  const src = assetUrl(baseUrl, beat.media);
  const isVideo = !!src && /\.(mp4|webm|mov)$/i.test(src);
  const scale = kenBurns(frame, durationInFrames, 1.04, 1.12);
  const line = Math.round(min * 0.052);
  const pad = Math.round(min * 0.09);

  return (
    <AbsoluteFill style={{ backgroundColor: mono(20) }}>
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
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${scale})`,
              }}
            />
          )}
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ background: SCRIM.bottom }} />
      {beat.line ? (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: pad,
            gap: Math.round(line * 0.4),
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: line,
              lineHeight: 1.2,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: mono(1),
              textAlign: "center",
              textWrap: "balance",
              ...enter(frame, fps, 0.4, Math.round(min * 0.025)),
            }}
          >
            {beat.line}
          </h1>
          {beat.tail ? (
            <span
              style={{
                fontSize: Math.round(min * 0.026),
                color: "rgba(255,255,255,0.66)",
                textAlign: "center",
                ...enter(frame, fps, 0.65, Math.round(min * 0.02)),
              }}
            >
              {beat.tail}
            </span>
          ) : null}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
}
