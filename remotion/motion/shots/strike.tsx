import { AbsoluteFill, useVideoConfig } from "remotion";
import { StrikethroughReplace } from "../remocn";
import { SCENE } from "../tokens";
import type { ShotProps } from "./types";

// The problem line gets struck through and the solution replaces it.
export function StrikeShot({ beat, dark }: ShotProps) {
  const { width: w, height: h } = useVideoConfig();
  const s = dark ? SCENE.dark : SCENE.light;
  const min = Math.min(w, h);
  const strike = beat.strike;
  if (!strike) return null;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: Math.round(min * 0.09),
      }}
    >
      <StrikethroughReplace
        from={strike.from}
        to={strike.to}
        fontSize={Math.round(min * 0.062)}
        fontWeight={600}
        color={s.ink}
        lineColor={s.ink}
      />
    </AbsoluteFill>
  );
}
