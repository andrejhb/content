import type React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import {
  TransitionSeries,
  linearTiming,
  type TransitionPresentation,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import type { FilmBeat, FilmTransition } from "../../lib/creatives";
import { MotionTheme, pushThrough, zoomBlur } from "../motion/remocn";
import { SCENE } from "../motion/tokens";
import { ChatShot } from "../motion/shots/chat";
import { MediaShot } from "../motion/shots/media";
import { NotifyShot } from "../motion/shots/notify";
import { RosterShot } from "../motion/shots/roster";
import { StatShot } from "../motion/shots/stat";
import { StatementShot } from "../motion/shots/statement";
import { StrikeShot } from "../motion/shots/strike";
import { WordmarkShot } from "../motion/shots/wordmark";
import type { ShotProps } from "../motion/shots/types";
import type { VideoInputProps } from "../root";

// motion-film: a beat-driven film assembled from the closed shot vocabulary in
// brief.film.beats (validated by lib/creative-schema.ts). Beats cut hard by
// default; a beat may name a transition OUT of itself (fade, push, blur). The
// film's duration is the sum of beat durations: calculateMetadata in root.tsx
// derives durationInFrames from the beats, and each transition's overlap is
// absorbed by lengthening the outgoing beat so the sum stays exact.

const SHOTS: Record<FilmBeat["shot"], React.ComponentType<ShotProps>> = {
  statement: StatementShot,
  chat: ChatShot,
  stat: StatShot,
  strike: StrikeShot,
  notify: NotifyShot,
  media: MediaShot,
  roster: RosterShot,
  wordmark: WordmarkShot,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PRESENTATIONS: Record<Exclude<FilmTransition, "cut">, () => TransitionPresentation<any>> = {
  fade: () => fade(),
  push: () => pushThrough(),
  blur: () => zoomBlur(),
};

export function MotionFilm({ brief, baseUrl }: VideoInputProps) {
  const { fps } = useVideoConfig();
  const beats = brief.film?.beats ?? [];
  const dark = brief.variant === "dark";
  const ground = dark ? SCENE.dark.ground : SCENE.light.ground;
  const transFrames = Math.round(fps * 0.33);

  const children: React.ReactNode[] = [];
  beats.forEach((beat, i) => {
    const isLast = i === beats.length - 1;
    const trans = !isLast && beat.transition && beat.transition !== "cut" ? beat.transition : null;
    const frames = Math.round(beat.durationSec * fps) + (trans ? transFrames : 0);
    const Shot = SHOTS[beat.shot];
    children.push(
      <TransitionSeries.Sequence key={`beat-${i}`} durationInFrames={frames}>
        <Shot beat={beat} baseUrl={baseUrl} dark={dark} />
      </TransitionSeries.Sequence>,
    );
    if (trans) {
      children.push(
        <TransitionSeries.Transition
          key={`trans-${i}`}
          presentation={PRESENTATIONS[trans]()}
          timing={linearTiming({ durationInFrames: transFrames })}
        />,
      );
    }
  });

  return (
    <AbsoluteFill style={{ backgroundColor: ground }}>
      <MotionTheme dark={dark}>
        <TransitionSeries>{children}</TransitionSeries>
      </MotionTheme>
    </AbsoluteFill>
  );
}
