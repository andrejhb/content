import type { Brief } from "@/lib/creatives";
import type { ChatBubble, ChatPalette } from "@/lib/chat-styles";
import { CARD_GRADIENT, CARD_SHADOW, GEO, chatLayout, chatPalette } from "@/lib/chat-styles";
import { CreativeCanvas, BrandMark } from "./canvas";

// Chat thread: a full-bleed phone message thread with no browser or device
// frame, closing on a solid Hububb card where the board's image placeholder
// would sit. Use it when the ad IS a conversation — the proof is that the
// exchange reads as a screenshot someone actually took, so nothing here may
// look like invented UI.
//
// The thread is copy.thread, the header name is copy.contact, and the closing
// card is copy.headline + copy.cta. brief.chatStyle dresses it as WhatsApp (the
// brief's default), iMessage or the monochrome black. All measurements come out
// of chatLayout so the still and remotion/compositions/animated-chat-thread are
// the same artwork.

// The three-dot indicator. On an outgoing bubble it is the whole message: a host
// who started typing and had nothing to say.
export function TypingDots({ size, color }: { size: number; color: string }) {
  const d = Math.round(size * 0.3);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: Math.round(d * 0.62), height: size }}>
      {[0.9, 0.62, 0.4].map((o, i) => (
        <span
          key={i}
          style={{ width: d, height: d, borderRadius: 9999, background: color, opacity: o }}
        />
      ))}
    </span>
  );
}

export function ReadTicks({ w, h, color }: { w: number; h: number; color: string }) {
  return (
    <svg width={w} height={h} viewBox="0 0 34 20" fill="none" style={{ flexShrink: 0 }} aria-hidden>
      <path d="M2 11.2l5 5.2 10.5-13" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 11.2l5 5.2 10.5-13" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The bubble's own pointer, drawn on the outer edge of its last line. */
export function BubbleTail({ side, size, color }: { side: "in" | "out"; size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={{ position: "absolute", bottom: 0, [side === "in" ? "left" : "right"]: -size * 0.45 }}
      aria-hidden
    >
      <path
        d={
          side === "in"
            ? "M40 0C40 20 34 34 4 40C22 32 26 20 26 0Z"
            : "M0 0C0 20 6 34 36 40C18 32 14 20 14 0Z"
        }
        fill={color}
      />
    </svg>
  );
}

export function ChatHeader({
  name,
  avatar,
  p,
  u,
}: {
  name: string;
  avatar?: string;
  p: ChatPalette;
  u: number;
}) {
  const g = GEO.header;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        gap: g.gap * u,
        paddingTop: g.top * u,
        paddingBottom: g.bottom * u,
        paddingLeft: g.inline * u,
        paddingRight: g.inline * u,
        background: p.headerBg,
        borderBottom: `${g.border * u}px solid ${p.headerBorder}`,
      }}
    >
      <svg width={g.chevron * u} height={g.chevron * u} viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M10 3.2l-4.6 4.8 4.6 4.8" stroke={p.headerInk} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div
        style={{
          width: g.avatar * u,
          height: g.avatar * u,
          borderRadius: 9999,
          background: p.avatar,
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : null}
      </div>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: g.name * u,
          lineHeight: 1.23,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: p.headerInk,
        }}
      >
        {name}
      </span>
      <svg width={g.video * u} height={g.video * u} viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="2" y="6" width="13" height="12" rx="3" stroke={p.headerInk} strokeWidth="1.9" />
        <path d="M15.5 11l5.5-3.2v8.4L15.5 13z" stroke={p.headerInk} strokeWidth="1.9" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function DayChip({ text, p, u, s }: { text: string; p: ChatPalette; u: number; s: number }) {
  const g = GEO.chip;
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <span
        style={{
          borderRadius: 9999,
          background: p.chipBg,
          color: p.chipInk,
          fontSize: g.fs * u * s,
          lineHeight: 1.24,
          fontWeight: 500,
          letterSpacing: "0.04em",
          paddingTop: g.py * u * s,
          paddingBottom: g.py * u * s,
          paddingLeft: g.px * u * s,
          paddingRight: g.px * u * s,
        }}
      >
        {text}
      </span>
    </div>
  );
}

export function ChatRow({
  m,
  p,
  u,
  s,
  tickColor,
}: {
  m: ChatBubble;
  p: ChatPalette;
  u: number;
  s: number;
  tickColor?: string;
}) {
  const g = GEO.bubble;
  if (m.from === "day") return <DayChip text={m.text ?? ""} p={p} u={u} s={s} />;
  const out = m.from === "out";
  const bg = out ? p.outBg : p.inBg;
  const ink = out ? p.outInk : p.inInk;
  return (
    <div style={{ display: "flex", justifyContent: out ? "flex-end" : "flex-start" }}>
      <div
        style={{
          position: "relative",
          maxWidth: (out ? g.outMax : g.inMax) * u * s,
          background: bg,
          borderRadius: g.radius * u * s,
          paddingLeft: g.px * u * s,
          paddingRight: g.px * u * s,
          paddingTop: g.py * u * s,
          paddingBottom: (m.time ? g.outBottom : g.py) * u * s,
          display: "flex",
          flexDirection: "column",
          gap: 4 * u * s,
        }}
      >
        {m.typing ? (
          <span style={{ display: "flex", alignItems: "center", height: g.line * u * s }}>
            <TypingDots size={g.fs * u * s} color={ink} />
          </span>
        ) : (
          <span style={{ fontSize: g.fs * u * s, lineHeight: g.line / g.fs, color: ink }}>{m.text}</span>
        )}
        {m.time ? (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: GEO.meta.gap * u * s,
            }}
          >
            <span style={{ fontSize: GEO.meta.fs * u * s, lineHeight: 1.24, color: out ? p.meta : (p.inMeta ?? p.meta) }}>{m.time}</span>
            {out ? (
              <ReadTicks
                w={GEO.meta.tickW * u * s}
                h={GEO.meta.tickH * u * s}
                color={tickColor ?? p.tick}
              />
            ) : null}
          </span>
        ) : null}
        <BubbleTail side={out ? "out" : "in"} size={g.tail * u * s} color={bg} />
      </div>
    </div>
  );
}

export function ClosingCard({
  headline,
  cta,
  brandMark,
  u,
}: {
  headline: string;
  cta?: string;
  brandMark: boolean;
  u: number;
}) {
  const g = GEO.card;
  return (
    <div
      style={{
        borderRadius: g.radius * u,
        background: CARD_GRADIENT,
        boxShadow: CARD_SHADOW,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: g.gap * u,
        paddingTop: g.top * u,
        paddingBottom: g.bottom * u,
        paddingLeft: g.inline * u,
        paddingRight: g.inline * u,
      }}
    >
      <span
        style={{
          fontSize: g.head * u,
          lineHeight: g.line / g.head,
          fontWeight: 600,
          letterSpacing: "-0.03em",
          color: "#ffffff",
        }}
      >
        {headline}
      </span>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 * u }}>
        {brandMark ? <BrandMark height={g.logoH * u} invert variant="wordmark" /> : <span />}
        {cta ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14 * u,
              borderRadius: 9999,
              background: "#ffffff",
              color: "#0d0d0d",
              fontSize: g.ctaFs * u,
              lineHeight: 1.2,
              fontWeight: 500,
              letterSpacing: "-0.01em",
              paddingTop: g.ctaPy * u,
              paddingBottom: g.ctaPy * u,
              paddingLeft: g.ctaPx * u,
              paddingRight: g.ctaPx * u,
            }}
          >
            {cta}
            <span style={{ fontWeight: 500 }}>&rarr;</span>
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function ChatThreadTemplate({
  brief,
  w,
  h,
}: {
  brief: Brief;
  w: number;
  h: number;
}) {
  const c = brief.copy;
  const p = chatPalette(brief.chatStyle);
  const messages = c.thread ?? [];
  const headline = c.headline ?? "";
  const L = chatLayout(messages, headline, w, h);

  return (
    <CreativeCanvas w={w} h={h} style={{ background: p.ground }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        <ChatHeader name={c.contact ?? ""} avatar={c.avatar} p={p} u={L.u} />
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            paddingTop: L.threadTop,
            paddingBottom: L.threadBottom,
            paddingLeft: L.inline,
            paddingRight: L.inline,
          }}
        >
          {/* Bottom-anchored so that if a thread still overruns the frame it is
              the oldest bubble that slides under the header, never the card. */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              gap: L.gap,
            }}
          >
            {messages.length === 0 ? (
              <span style={{ fontFamily: "monospace", fontSize: 24 * L.u, color: p.chipInk }}>
                supply copy.thread
              </span>
            ) : null}
            {messages.map((m, i) => (
              <ChatRow key={`${m.from}-${i}`} m={m} p={p} u={L.u} s={L.s} />
            ))}
          </div>
          {headline ? (
            <div style={{ flexShrink: 0, paddingTop: L.gap }}>
              <ClosingCard headline={headline} cta={c.cta} brandMark={brief.brandMark} u={L.u} />
            </div>
          ) : null}
        </div>
      </div>
    </CreativeCanvas>
  );
}
