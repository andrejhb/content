import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { ChatPalette } from "../../lib/chat-styles";
import {
  CARD_GRADIENT,
  CARD_SHADOW,
  GEO,
  chatLayout,
  chatPalette,
  chatSchedule,
  rowHeight,
} from "../../lib/chat-styles";
import { CharRise, RISE } from "../motion/char-rise";
import type { VideoInputProps } from "../root";
import { interVars } from "./font";

// Motion take on the chat-thread template: the thread plays out instead of being
// posted. The contact types, the bubble dissolves in and its text rises
// character by character (remocn per-character-rise, inlined in
// remotion/motion/char-rise), the thread fills from the top and scrolls once it
// is full, the host's ticks turn read, and the closing card rises last like a
// keyboard coming up. Same palettes and the same chatLayout numbers as
// components/templates/chat-thread, so the reel is the still moving.
//
// One easing language throughout: per-character-rise's own bezier drives the
// row opening and the bubble dissolve too, so nothing springs or snaps except
// the closing card, which keeps its settled spring on purpose.
//
// Every row's space grows from nothing via a one-row grid going 0fr → 1fr. That
// is what buys real push-up: the row's resting height is its own content height,
// which nothing here has to measure. The content itself is never clipped by the
// growing row (see GrowRow); it dissolves in at full size. The row gap lives
// INSIDE the growing area, or a collapsed row would still hold a gap open.

/** Frames a row's space takes to open, and a bubble to dissolve in. */
const OPEN_FRAMES = 16;
const BUBBLE_FRAMES = 18;
/** Frames after a sent bubble lands before its ticks turn read. */
const READ_DELAY_SEC = 0.7;

function TypingDots({
  size,
  color,
  frame,
  fps,
  from,
}: {
  size: number;
  color: string;
  frame: number;
  fps: number;
  from: number;
}) {
  const d = Math.round(size * 0.3);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: Math.round(d * 0.62), height: size }}>
      {[0, 1, 2].map((i) => {
        // A 0.9s cycle, each dot a third of a beat behind the one before it.
        const cycle = ((frame - from) / fps / 0.9 - i * 0.16) % 1;
        const t = cycle < 0 ? cycle + 1 : cycle;
        const lift = Math.max(0, Math.sin(t * Math.PI * 2));
        return (
          <span
            key={i}
            style={{
              width: d,
              height: d,
              borderRadius: 9999,
              background: color,
              opacity: 0.4 + lift * 0.55,
              transform: `translateY(${-lift * d * 0.35}px)`,
            }}
          />
        );
      })}
    </span>
  );
}

function ReadTicks({ w, h, color }: { w: number; h: number; color: string }) {
  return (
    <svg width={w} height={h} viewBox="0 0 34 20" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2 11.2l5 5.2 10.5-13" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 11.2l5 5.2 10.5-13" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BubbleTail({ side, size, color }: { side: "in" | "out"; size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={{ position: "absolute", bottom: 0, [side === "in" ? "left" : "right"]: -size * 0.45 }}
    >
      <path
        d={side === "in" ? "M40 0C40 20 34 34 4 40C22 32 26 20 26 0Z" : "M0 0C0 20 6 34 36 40C18 32 14 20 14 0Z"}
        fill={color}
      />
    </svg>
  );
}

/**
 * A row whose SPACE grows from nothing, gap included. The content is never
 * clipped by that growth: it sits at full size, top-anchored, and dissolves in
 * on its own opacity. Clipping the bubble to the opening row read as a
 * top-to-bottom wipe, which is not how a message arrives. Anything below the
 * row (only the closing card, at the end) still gets pushed as the space opens,
 * and when the thread is full the column slides up by the same amount, so a
 * new bubble fades in while rising into place, the way a sent message does.
 */
function GrowRow({ open, gap, children }: { open: number; gap: number; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateRows: `${open}fr` }}>
      <div style={{ minHeight: 0, overflow: "visible" }}>
        <div style={{ paddingTop: gap }}>{children}</div>
      </div>
    </div>
  );
}

export function AnimatedChatThread({ brief, baseUrl }: VideoInputProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h } = useVideoConfig();
  const c = brief.copy;
  const p: ChatPalette = chatPalette(brief.chatStyle);
  const messages = c.thread ?? [];
  const headline = c.headline ?? "";
  // "scroll": the reel runs the thread at full size and lets the oldest
  // bubbles leave under the header as new ones land.
  const L = chatLayout(messages, headline, w, h, "scroll");
  const g = GEO;
  const S = L.u * L.s;

  // Arrival times come from the same schedule scripts/* use to set the brief's
  // durationSec, so the reel is never squeezed to fit: it is as long as the
  // thread takes, then holds on the card.
  const { steps, cardAt } = chatSchedule(messages, S, fps);

  /** 0..1 over `frames` from `atSec`, on per-character-rise's opacity curve. */
  const ramp = (atSec: number, frames: number) =>
    interpolate(frame - atSec * fps, [0, frames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: RISE.opacity,
    });
  const open = (atSec: number) => ramp(atSec, OPEN_FRAMES);
  // The one spring left: the card's keyboard-style rise, kept as signed off.
  const cardGrow = headline
    ? spring({ frame: frame - Math.round(fps * cardAt), fps, config: { damping: 200, mass: 1.1 } })
    : 0;

  // How tall each row is right now, and therefore how far the thread has had to
  // travel. A row that has not arrived contributes nothing, gap included.
  const typingRowH = (g.bubble.py * 0.68 * 2 + g.bubble.fs) * S;
  // A typing bubble that IS the message (the host with nothing to say) holds
  // until the next message lands, then closes: they gave up typing. Anything
  // else, once open, stays open.
  const openOf = (i: number) => {
    const o = open(steps[i].at);
    const next = steps[i + 1];
    return messages[i].typing && next ? o * (1 - open(next.at)) : o;
  };
  const typingOpenOf = (i: number) => {
    const at = steps[i].typingAt;
    return at === null ? 0 : open(at) * (1 - openOf(i));
  };
  let contentH = 0;
  messages.forEach((m, i) => {
    const o = openOf(i);
    const to = typingOpenOf(i);
    contentH += rowHeight(m, S) * o + typingRowH * to;
    if (i > 0) contentH += L.gap * Math.max(o, to);
  });
  // The closing card comes to rest in the centre of the frame, and the thread
  // is pushed up to sit above it: the room the bubbles have shrinks from the
  // whole thread area to the band between the header and the card as the card
  // rises, so the push-up and the rise are one move.
  const cardTop = (h - L.cardH) / 2;
  const roomOpen = h - L.headerH - L.threadTop - L.threadBottom;
  const roomWithCard = cardTop - L.gap - L.headerH - L.threadTop;
  const room = roomOpen + (roomWithCard - roomOpen) * cardGrow;
  // The scroll follows the content on the same eased curve the rows open on, so
  // the whole thread glides up as one instead of stepping.
  const scroll = Math.max(0, contentH - room);

  const fs = g.bubble.fs * S;
  const lineHeight = g.bubble.line / g.bubble.fs;
  // per-character-rise's 32px is sized for 72px type; scale it to the bubble.
  const riseDistance = Math.round(fs * 0.32);

  return (
    <AbsoluteFill style={{ background: p.ground, ...interVars }}>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            gap: g.header.gap * L.u,
            paddingTop: g.header.top * L.u,
            paddingBottom: g.header.bottom * L.u,
            paddingLeft: g.header.inline * L.u,
            paddingRight: g.header.inline * L.u,
            background: p.headerBg,
            borderBottom: `${g.header.border * L.u}px solid ${p.headerBorder}`,
            // Above the thread so bubbles pass under it, not over it.
            zIndex: 2,
          }}
        >
          <svg width={g.header.chevron * L.u} height={g.header.chevron * L.u} viewBox="0 0 16 16" fill="none">
            <path d="M10 3.2l-4.6 4.8 4.6 4.8" stroke={p.headerInk} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div
            style={{
              width: g.header.avatar * L.u,
              height: g.header.avatar * L.u,
              borderRadius: 9999,
              background: p.avatar,
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {c.avatar ? (
              <Img src={`${baseUrl}${c.avatar}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : null}
          </div>
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: g.header.name * L.u,
              lineHeight: 1.23,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: p.headerInk,
            }}
          >
            {c.contact ?? ""}
          </span>
          <svg width={g.header.video * L.u} height={g.header.video * L.u} viewBox="0 0 24 24" fill="none">
            <rect x="2" y="6" width="13" height="12" rx="3" stroke={p.headerInk} strokeWidth="1.9" />
            <path d="M15.5 11l5.5-3.2v8.4L15.5 13z" stroke={p.headerInk} strokeWidth="1.9" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Thread. It fills from the top like a real one and only starts
            scrolling once it has run out of room. The offset is computed rather
            than measured: rowHeight is the same estimator the still lays out
            with, and it agrees with the browser to the pixel. */}
        <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              top: L.threadTop - scroll,
              left: L.inline,
              right: L.inline,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {messages.map((m, i) => {
              const st = steps[i];
              const o = openOf(i);
              const gap = i === 0 ? 0 : L.gap;

              if (m.from === "day") {
                return (
                  <GrowRow key={i} open={o} gap={gap}>
                    <div style={{ display: "flex", justifyContent: "center", opacity: ramp(st.at, BUBBLE_FRAMES) }}>
                      <span
                        style={{
                          borderRadius: 9999,
                          background: p.chipBg,
                          color: p.chipInk,
                          fontSize: g.chip.fs * S,
                          lineHeight: 1.24,
                          fontWeight: 500,
                          letterSpacing: "0.04em",
                          paddingTop: g.chip.py * S,
                          paddingBottom: g.chip.py * S,
                          paddingLeft: g.chip.px * S,
                          paddingRight: g.chip.px * S,
                        }}
                      >
                        {m.text}
                      </span>
                    </div>
                  </GrowRow>
                );
              }

              const out = m.from === "out";
              const bg = out ? p.outBg : p.inBg;
              const ink = out ? p.outInk : p.inInk;
              // A typing-only bubble dissolves out when the next message lands
              // (its row's space closes by the same amount in openOf; since rows
              // no longer clip, the bubble has to fade on its own).
              const next = steps[i + 1];
              const gone = m.typing && next ? 1 - open(next.at) : 1;
              const landed = ramp(st.at, BUBBLE_FRAMES) * gone;
              const startFrame = Math.round(st.at * fps);
              // Grey until it has been read, then the accent ticks.
              const tick =
                m.time && out
                  ? interpolateColors(ramp(st.at + READ_DELAY_SEC, 12), [0, 1], [p.tickIdle, p.tick])
                  : p.tick;

              const bubble = (
                <div style={{ display: "flex", justifyContent: out ? "flex-end" : "flex-start" }}>
                  <div
                    style={{
                      position: "relative",
                      maxWidth: (out ? g.bubble.outMax : g.bubble.inMax) * S,
                      background: bg,
                      borderRadius: g.bubble.radius * S,
                      paddingLeft: g.bubble.px * S,
                      paddingRight: g.bubble.px * S,
                      paddingTop: g.bubble.py * S,
                      paddingBottom: (m.time ? g.bubble.outBottom : g.bubble.py) * S,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4 * S,
                      opacity: landed,
                    }}
                  >
                    {m.typing ? (
                      <span style={{ display: "flex", alignItems: "center", height: g.bubble.line * S }}>
                        <TypingDots size={fs} color={ink} frame={frame} fps={fps} from={startFrame} />
                      </span>
                    ) : (
                      <CharRise
                        text={m.text ?? ""}
                        frame={frame}
                        startFrame={startFrame}
                        fontSize={fs}
                        lineHeight={lineHeight}
                        color={ink}
                        distance={riseDistance}
                      />
                    )}
                    {m.time ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: g.meta.gap * S,
                          // The meta row follows the last characters in.
                          opacity: ramp(st.at + 0.25, BUBBLE_FRAMES),
                        }}
                      >
                        <span style={{ fontSize: g.meta.fs * S, lineHeight: 1.24, color: out ? p.meta : (p.inMeta ?? p.meta) }}>
                          {m.time}
                        </span>
                        {out ? <ReadTicks w={g.meta.tickW * S} h={g.meta.tickH * S} color={tick} /> : null}
                      </span>
                    ) : null}
                    <BubbleTail side={out ? "out" : "in"} size={g.bubble.tail * S} color={bg} />
                  </div>
                </div>
              );

              if (st.typingAt === null) {
                return (
                  <GrowRow key={i} open={o} gap={gap}>
                    {bubble}
                  </GrowRow>
                );
              }

              // The contact types where the bubble is about to be, then the
              // indicator dissolves out as the message opens into its place.
              const typingOpen = open(st.typingAt) * (1 - o);
              return (
                <div key={i}>
                  <GrowRow open={typingOpen} gap={gap}>
                    <div style={{ display: "flex", justifyContent: "flex-start", opacity: typingOpen }}>
                      <div
                        style={{
                          background: p.inBg,
                          borderRadius: g.bubble.radius * S,
                          paddingLeft: g.bubble.px * S,
                          paddingRight: g.bubble.px * S,
                          paddingTop: g.bubble.py * S * 0.68,
                          paddingBottom: g.bubble.py * S * 0.68,
                          position: "relative",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", height: fs }}>
                          <TypingDots
                            size={fs}
                            color={p.inInk}
                            frame={frame}
                            fps={fps}
                            from={Math.round(fps * st.typingAt)}
                          />
                        </span>
                        <BubbleTail side="in" size={g.bubble.tail * S} color={p.inBg} />
                      </div>
                    </div>
                  </GrowRow>
                  <GrowRow open={o} gap={typingOpen > 0.02 ? 0 : gap}>
                    {bubble}
                  </GrowRow>
                </div>
              );
            })}
          </div>

          {headline ? (
            <div
              style={{
                position: "absolute",
                left: L.inline,
                right: L.inline,
                // Rests centred in the frame (this container starts under the
                // header). Rises from below the frame like a keyboard, and the
                // thread gives way above it because `room` shrinks by the same
                // spring.
                top: cardTop - L.headerH,
                transform: `translateY(${(1 - cardGrow) * (h - cardTop)}px)`,
              }}
            >
              <div
                style={{
                  borderRadius: g.card.radius * L.u,
                  background: CARD_GRADIENT,
                  boxShadow: CARD_SHADOW,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  gap: g.card.gap * L.u,
                  paddingTop: g.card.top * L.u,
                  paddingBottom: g.card.bottom * L.u,
                  paddingLeft: g.card.inline * L.u,
                  paddingRight: g.card.inline * L.u,
                }}
              >
                <span
                  style={{
                    fontSize: g.card.head * L.u,
                    lineHeight: g.card.line / g.card.head,
                    fontWeight: 600,
                    letterSpacing: "-0.03em",
                    color: "#ffffff",
                  }}
                >
                  {headline}
                </span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 * L.u }}>
                  {brief.brandMark ? (
                    <Img
                      src={`${baseUrl}/asset/shared/logos/hububb-wordmark.svg`}
                      style={{ height: g.card.logoH * L.u, width: "auto", filter: "brightness(0) invert(1)" }}
                    />
                  ) : (
                    <span />
                  )}
                  {c.cta ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 14 * L.u,
                        borderRadius: 9999,
                        background: "#ffffff",
                        color: "#0d0d0d",
                        fontSize: g.card.ctaFs * L.u,
                        lineHeight: 1.2,
                        fontWeight: 500,
                        letterSpacing: "-0.01em",
                        paddingTop: g.card.ctaPy * L.u,
                        paddingBottom: g.card.ctaPy * L.u,
                        paddingLeft: g.card.ctaPx * L.u,
                        paddingRight: g.card.ctaPx * L.u,
                      }}
                    >
                      {c.cta}
                      <span>&rarr;</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// Remotion's `Easing` is referenced by RISE in char-rise; re-exported there.
// Keeping the import here keeps the type-only path honest if RISE ever moves.
void Easing;
