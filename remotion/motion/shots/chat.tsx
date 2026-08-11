import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { assetUrl, rise } from "../helpers";
import { MessageBubble, TypingIndicator } from "../remocn";
import { SCENE, SPRING, mono } from "../tokens";
import type { ShotProps } from "./types";

// A guest exchange, full frame: the question types out, a typing indicator
// bridges, the answer lands in place of the dots, and the "answered by" tag
// settles beneath it. Unlike phone-mockup-ui's reproduced UI, this exchange IS
// the ad and is QA-gated copy. Laid out at a logical width and scaled to the
// frame so the remocn bubbles keep their proportions at render size. The
// question types as a plain frame-driven substring (the vendored Typewriter is
// a full-frame component and does not fit inside a bubble).
const LOGICAL_W = 460;
const CPS = 30; // typing speed, chars per second

export function ChatShot({ beat, baseUrl, dark }: ShotProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const s = dark ? SCENE.dark : SCENE.light;
  const min = Math.min(w, h);
  const chat = beat.chat;
  if (!chat) return null;

  const scale = (min * 0.92) / LOGICAL_W;
  const t = frame / fps;

  const qStart = 0.35;
  const qDur = chat.question.length / CPS;
  const dotsFrom = qStart + qDur + 0.3;
  const answerAt = dotsFrom + 0.95;
  const tagAt = answerAt + 0.4;

  const headerIn = rise(frame, fps, 0.05);
  const questionIn = rise(frame, fps, qStart - 0.15);
  const answerIn = rise(frame, fps, answerAt, SPRING.card);
  const tagIn = rise(frame, fps, tagAt);

  const typed = chat.question.slice(
    0,
    Math.max(0, Math.floor((t - qStart) * CPS)),
  );

  // The dots hold the answer's slot, then hand it over without a reflow.
  const dotsOpacity =
    interpolate(t, [dotsFrom, dotsFrom + 0.18], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) *
    interpolate(t, [answerAt - 0.12, answerAt], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const avatar = assetUrl(baseUrl, chat.avatar);

  const bubble = (v: number) => ({
    opacity: v,
    translateY: (1 - v) * 14,
    scale: 0.94 + v * 0.06,
  });

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: LOGICAL_W,
          transform: `scale(${scale})`,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {(chat.name || chat.time) && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: headerIn }}>
            {avatar ? (
              <Img
                src={avatar}
                style={{ width: 26, height: 26, borderRadius: 999, objectFit: "cover" }}
              />
            ) : null}
            {chat.name ? (
              <span style={{ fontSize: 13, fontWeight: 600, color: s.ink }}>{chat.name}</span>
            ) : null}
            {chat.time ? (
              <span style={{ fontSize: 12, color: s.muted, marginLeft: "auto" }}>{chat.time}</span>
            ) : null}
          </div>
        )}

        <MessageBubble variant="incoming" style={bubble(questionIn)} maxWidth="88%">
          <span style={{ fontWeight: 500 }}>{typed.length ? typed : " "}</span>
        </MessageBubble>

        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, opacity: dotsOpacity }}>
            <MessageBubble variant="incoming" state="visible" maxWidth="100%">
              <TypingIndicator color={s.muted} size={5} />
            </MessageBubble>
          </div>
          <MessageBubble variant="outgoing" style={bubble(answerIn)} maxWidth="88%">
            {chat.answer}
          </MessageBubble>
          {chat.tag ? (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 6,
                marginTop: 10,
                opacity: tagIn,
                transform: `translateY(${(1 - tagIn) * 8}px)`,
              }}
            >
              <svg width={13} height={13} viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="8" fill={dark ? mono(1) : mono(19)} />
                <path
                  d="M4.6 8.2l2.3 2.3 4.5-4.7"
                  stroke={dark ? mono(19) : mono(1)}
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ fontSize: 12, fontWeight: 500, color: s.muted }}>{chat.tag}</span>
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
}
