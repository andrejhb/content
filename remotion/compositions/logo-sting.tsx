import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { VideoInputProps } from "../root";
import { interVars } from "./font";

// Short brand outro: the symbol springs in, the wordmark follows, everything
// breathes once and fades. Light background, no copy.
export function LogoSting({ baseUrl }: VideoInputProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h, durationInFrames } = useVideoConfig();

  const symbol = Math.round(Math.min(w, h) * 0.16);
  const word = Math.round(Math.min(w, h) * 0.052);

  const symbolIn = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
  const wordIn = spring({
    frame: frame - Math.round(fps * 0.45),
    fps,
    config: { damping: 200 },
  });
  const breathe = 1 + Math.sin((frame / fps) * Math.PI * 0.5) * 0.008;
  const outro = interpolate(
    frame,
    [durationInFrames - Math.round(fps * 0.6), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      className="bg-mono-1 font-sans items-center justify-center"
      style={interVars}
    >
      <div
        className="flex flex-col items-center"
        style={{ gap: Math.round(symbol * 0.35), opacity: outro, transform: `scale(${breathe})` }}
      >
        <Img
          src={`${baseUrl}/asset/shared/logos/hububb-symbol.svg`}
          alt="Hububb"
          style={{
            height: symbol,
            width: "auto",
            opacity: symbolIn,
            transform: `scale(${interpolate(symbolIn, [0, 1], [0.72, 1])})`,
          }}
        />
        <Img
          src={`${baseUrl}/asset/shared/logos/hububb-wordmark.svg`}
          alt="Hububb"
          style={{
            height: word,
            width: "auto",
            opacity: wordIn,
            transform: `translateY(${interpolate(wordIn, [0, 1], [Math.round(h * 0.012), 0])}px)`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
}
