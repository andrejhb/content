import { Loop, OffthreadVideo, useVideoConfig } from "remotion";
import type { CSSProperties } from "react";

// OffthreadVideo has no `loop` prop in this Remotion version; the supported way to
// loop a clip is the <Loop> component. This wraps a muted background video so it
// restarts exactly when the playback-rate-adjusted source ends, matching the old
// `loop` behaviour. layout="none" means no wrapper box is added, so the caller's
// sizing (a full-bleed AbsoluteFill or a fixed card) is preserved. All the launch
// clips are ~5s; override srcSeconds for a different source.
const SRC_SECONDS = 5.041667;

export function LoopedVideo({
  src,
  playbackRate = 1,
  style,
  srcSeconds = SRC_SECONDS,
}: {
  src: string;
  playbackRate?: number;
  style?: CSSProperties;
  srcSeconds?: number;
}) {
  const { fps } = useVideoConfig();
  const loopFrames = Math.max(1, Math.round((srcSeconds / playbackRate) * fps));
  return (
    <Loop durationInFrames={loopFrames} layout="none">
      <OffthreadVideo src={src} muted playbackRate={playbackRate} style={style} />
    </Loop>
  );
}
