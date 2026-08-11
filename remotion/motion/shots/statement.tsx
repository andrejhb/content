import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { enter } from "../helpers";
import { SoftBlurIn } from "../remocn";
import { SCENE } from "../tokens";
import type { ShotProps } from "./types";

// One line of type, big and centred; optional muted tail beneath it.
export function StatementShot({ beat, dark }: ShotProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const s = dark ? SCENE.dark : SCENE.light;
  const min = Math.min(w, h);
  const head = Math.round(min * 0.075);
  const tail = Math.round(min * 0.03);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: Math.round(head * 0.55),
        padding: Math.round(min * 0.09),
      }}
    >
      <div style={{ position: "relative", width: "100%", height: Math.round(head * 1.35) }}>
        <SoftBlurIn
          text={beat.line ?? ""}
          fontSize={head}
          color={s.ink}
          fontWeight={600}
        />
      </div>
      {beat.tail ? (
        <span
          style={{
            fontSize: tail,
            fontWeight: 500,
            color: s.muted,
            textAlign: "center",
            ...enter(frame, fps, 0.5, Math.round(min * 0.02)),
          }}
        >
          {beat.tail}
        </span>
      ) : null}
    </AbsoluteFill>
  );
}
