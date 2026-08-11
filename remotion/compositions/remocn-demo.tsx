import { AbsoluteFill, Easing, Img, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { rise } from "../motion/helpers";
import {
  MessageBubble,
  MotionTheme,
  Odometer,
  PerWordCrossfade,
  SoftBlurIn,
  StrikethroughReplace,
  TypingIndicator,
} from "../motion/remocn";
import { SCENE, mono } from "../motion/tokens";
import type { VideoInputProps } from "../root";

// remocn-demo: a raw capability reel for the vendored remocn components. Six
// segments, 1.5s each, hard cuts, design-system weights, logo-only close.
// Not offered in the wizard; render it directly:
//   npx remotion render remocn-demo out.mp4 --props='{"brief":{},"format":"9x16","baseUrl":"http://localhost:3005"}'
const SEG = 1.5;

function OdometerSegment({ ink }: { ink: string }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const min = Math.min(width, height);
  const roll = interpolate(frame, [0, Math.round(fps * 0.9)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.5, 1, 0.5, 1),
  });
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "baseline", color: ink }}>
        <Odometer current={90 * roll} fontSize={Math.round(min * 0.14)} color={ink} fontFamily="var(--font-inter)" fontWeight={500} />
        <span style={{ fontSize: Math.round(min * 0.14), fontWeight: 500 }}>%</span>
      </div>
    </AbsoluteFill>
  );
}

function ChatSegment({ dark }: { dark: boolean }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const min = Math.min(width, height);
  const scale = (min * 0.8) / 420;
  const answerIn = rise(frame, fps, 0.7);
  const dots =
    interpolate(frame / fps, [0.1, 0.25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    interpolate(frame / fps, [0.6, 0.7], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 420, transform: `scale(${scale})`, display: "flex", flexDirection: "column", gap: 12 }}>
        <MessageBubble variant="incoming" state="visible" maxWidth="85%">
          <span style={{ fontWeight: 500 }}>Where do we find the key box?</span>
        </MessageBubble>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, opacity: dots }}>
            <MessageBubble variant="incoming" state="visible" maxWidth="100%">
              <TypingIndicator color={dark ? mono(9) : mono(11)} size={5} />
            </MessageBubble>
          </div>
          <MessageBubble
            variant="outgoing"
            style={{ opacity: answerIn, translateY: (1 - answerIn) * 12, scale: 0.95 + answerIn * 0.05 }}
            maxWidth="85%"
          >
            By the blue door, code 4471
          </MessageBubble>
        </div>
      </div>
    </AbsoluteFill>
  );
}

export function RemocnDemo({ brief, baseUrl }: VideoInputProps) {
  const { fps, width, height } = useVideoConfig();
  const min = Math.min(width, height);
  const dark = brief?.variant === "dark";
  const s = dark ? SCENE.dark : SCENE.light;
  const seg = Math.round(SEG * fps);
  const head = Math.round(min * 0.058);

  return (
    <AbsoluteFill style={{ backgroundColor: s.ground }}>
      <MotionTheme dark={dark}>
        <Sequence from={0} durationInFrames={seg}>
          <SoftBlurIn text="Answered while you sleep" fontSize={head} color={s.ink} fontWeight={500} />
        </Sequence>
        <Sequence from={seg} durationInFrames={seg}>
          <PerWordCrossfade fromText="Managing five apps" toText="One quiet layer" fontSize={head} color={s.ink} fontWeight={500} />
        </Sequence>
        <Sequence from={seg * 2} durationInFrames={seg}>
          <OdometerSegment ink={s.ink} />
        </Sequence>
        <Sequence from={seg * 3} durationInFrames={seg}>
          <StrikethroughReplace from="Manual replies" to="Answered already" fontSize={head} color={s.ink} fontWeight={500} lineColor={s.ink} />
        </Sequence>
        <Sequence from={seg * 4} durationInFrames={seg}>
          <ChatSegment dark={dark} />
        </Sequence>
        <Sequence from={seg * 5} durationInFrames={seg}>
          <LogoClose baseUrl={baseUrl} dark={dark} />
        </Sequence>
      </MotionTheme>
    </AbsoluteFill>
  );
}

// The outro is just the logo, nothing else.
function LogoClose({ baseUrl, dark }: { baseUrl: string; dark: boolean }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const min = Math.min(width, height);
  const markIn = rise(frame, fps, 0.1);
  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Img
        src={`${baseUrl}/asset/shared/logos/hububb-wordmark.svg`}
        style={{
          height: Math.round(min * 0.07),
          width: "auto",
          filter: dark ? "brightness(0) invert(1)" : undefined,
          opacity: markIn,
          transform: `translateY(${(1 - markIn) * Math.round(min * 0.015)}px)`,
        }}
      />
    </AbsoluteFill>
  );
}
