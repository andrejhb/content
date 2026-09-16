import { Easing, interpolate } from "remotion";

// components/remocn/per-character-rise.tsx, made inline. The vendored component
// is a full-frame centred heading (position:absolute, inset:0, no wrapping), so
// it cannot sit inside a chat bubble; this carries its curves and frame
// constants verbatim and only changes the container: words are inline-block so
// the browser wraps the sentence, characters inside them rise one by one.
//
// Keep RISE in step with the vendored file when `shadcn add` refreshes it.
export const RISE = {
  /** Frames one character takes to reach full opacity. */
  charDuration: 21,
  /** Frames one character takes to travel `distance` to rest. */
  charTravel: 10,
  /** Frames between consecutive characters in the component. */
  stagger: 1,
  opacity: Easing.bezier(0.2, 0.8, 0.2, 1),
  travel: Easing.bezier(0.2, 0.8, 0.6, 0.85),
} as const;

/**
 * Stagger for a run of `chars` characters so the whole sentence finishes its
 * rise inside a bounded window. The component's 1 frame per character is right
 * for a five-word heading and reads as a crawl across a ninety-character
 * message, so long runs overlap more instead of taking longer: the stagger
 * window is capped, the per-character curve is untouched.
 */
export const STAGGER_WINDOW = 18;

export function riseStagger(chars: number) {
  return Math.min(RISE.stagger, STAGGER_WINDOW / Math.max(1, chars));
}

/** Frames from the first character starting to the last one settling. */
export function riseFrames(chars: number) {
  return Math.min(STAGGER_WINDOW, chars * RISE.stagger) + RISE.charDuration;
}

export function CharRise({
  text,
  frame,
  startFrame,
  fontSize,
  lineHeight,
  color,
  distance,
  fontWeight = 400,
}: {
  text: string;
  frame: number;
  startFrame: number;
  fontSize: number;
  lineHeight: number;
  color: string;
  /** Pixels each character rises from. The component's 32 is sized for 72px type. */
  distance: number;
  fontWeight?: number;
}) {
  const stagger = riseStagger(Array.from(text).length);
  const local0 = frame - startFrame;
  let index = 0;
  // Split keeping the whitespace tokens so the words can wrap between them.
  const tokens = text.split(/(\s+)/).filter((t) => t.length > 0);
  return (
    <span style={{ fontSize, lineHeight, color, fontWeight }}>
      {tokens.map((tok, ti) => {
        if (/^\s+$/.test(tok)) {
          index += tok.length;
          return <span key={ti}>{tok}</span>;
        }
        return (
          <span key={ti} style={{ display: "inline-block", whiteSpace: "pre" }}>
            {Array.from(tok).map((ch, ci) => {
              const local = local0 - index++ * stagger;
              const opacity = interpolate(local, [0, RISE.charDuration], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: RISE.opacity,
              });
              const y = interpolate(local, [0, RISE.charTravel], [distance, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: RISE.travel,
              });
              return (
                <span
                  key={ci}
                  style={{
                    display: "inline-block",
                    backfaceVisibility: "hidden",
                    transformOrigin: "50% 55%",
                    opacity,
                    translate: `0 ${y}px`,
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
}
