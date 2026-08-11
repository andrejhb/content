import type { FilmBeat } from "../../../lib/creatives";

// Every shot renders inside its beat's TransitionSeries sequence, so
// useCurrentFrame() is beat-local. Sizing comes from useVideoConfig.
export type ShotProps = {
  beat: FilmBeat;
  baseUrl: string;
  dark: boolean;
};
