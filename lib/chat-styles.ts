// The chat-thread look, shared by the static template
// (components/templates/chat-thread.tsx) and the motion composition
// (remotion/compositions/animated-chat-thread.tsx) so a still and its reel are
// the same artwork, one animated.
//
// The palettes and the geometry are lifted from the signed Paper board
// ("06 · CHATTHREAD VAR01", page [Content review] - 02), measured at 1080 wide.
// Everything in GEO is in those 1080-wide pixels; both renderers multiply by
// u = w / 1080, so the thread reads identically at every format.

export type ChatStyleKey = "whatsapp" | "imessage" | "black";

export type ChatPalette = {
  ground: string;
  headerBg: string;
  headerBorder: string;
  headerInk: string;
  avatar: string;
  chipBg: string;
  chipInk: string;
  inBg: string;
  inInk: string;
  outBg: string;
  outInk: string;
  /** Timestamp under an outgoing bubble. */
  meta: string;
  /** Timestamp under an incoming bubble, when the outgoing colour would not read there. */
  inMeta?: string;
  /** Read receipt once the message has landed, and while it is still sending. */
  tick: string;
  tickIdle: string;
};

// whatsapp is the brief's default ("WhatsApp styling, not iMessage"); imessage
// and black are the two alternates the Paper board carries beside it.
export const CHAT_STYLES: Record<ChatStyleKey, ChatPalette> = {
  whatsapp: {
    ground: "#efeae2",
    headerBg: "#f7f5f3",
    headerBorder: "#e4dfd8",
    headerInk: "#1a1a1a",
    avatar: "#d3cec6",
    chipBg: "#ffffff",
    chipInk: "#667781",
    inBg: "#ffffff",
    inInk: "#1a1a1a",
    outBg: "#d9fdd3",
    outInk: "#111b21",
    meta: "#667781",
    tick: "#53bdeb",
    tickIdle: "#8696a0",
  },
  imessage: {
    ground: "#ffffff",
    headerBg: "#ffffff",
    headerBorder: "#ebebeb",
    headerInk: "#1a1a1a",
    avatar: "#d4d4d4",
    chipBg: "#f2f2f2",
    chipInk: "#666666",
    inBg: "#e9e9eb",
    inInk: "#1a1a1a",
    outBg: "#007aff",
    outInk: "#ffffff",
    meta: "rgba(255,255,255,0.72)",
    inMeta: "#8e8e93",
    tick: "#ffffff",
    tickIdle: "rgba(255,255,255,0.45)",
  },
  black: {
    ground: "#ffffff",
    headerBg: "#ffffff",
    headerBorder: "#ebebeb",
    headerInk: "#1a1a1a",
    avatar: "#d4d4d4",
    chipBg: "#f2f2f2",
    chipInk: "#666666",
    inBg: "#e9e9eb",
    inInk: "#1a1a1a",
    outBg: "#0d0d0d",
    outInk: "#ffffff",
    // The mint is the one accent the monochrome ramp has (same tick green as
    // components/templates/stack).
    meta: "#a6a6a6",
    inMeta: "#8e8e93",
    tick: "#b2ffea",
    tickIdle: "rgba(255,255,255,0.4)",
  },
};

export function chatPalette(style?: string): ChatPalette {
  return CHAT_STYLES[(style as ChatStyleKey) ?? "whatsapp"] ?? CHAT_STYLES.whatsapp;
}

// Geometry in 1080-wide pixels, straight off the Paper board.
export const GEO = {
  header: { top: 56, bottom: 34, inline: 44, gap: 28, border: 2, avatar: 88, name: 44, chevron: 34, video: 46 },
  thread: { inline: 44, top: 44, bottom: 76, gap: 36 },
  chip: { fs: 26, py: 14, px: 30, gap: 8 },
  bubble: { fs: 44, line: 60, radius: 52, py: 30, px: 40, outBottom: 22, inMax: 770, outMax: 830, tail: 40 },
  meta: { fs: 26, gap: 10, tickW: 34, tickH: 20 },
  card: { radius: 44, top: 56, bottom: 44, inline: 52, gap: 34, head: 52, line: 64, logoH: 62, ctaFs: 30, ctaPy: 18, ctaPx: 30 },
} as const;

// The closing card's ground. The Paper board specifies it in oklab; these are
// the same three stops converted to sRGB so the render never depends on the
// renderer's oklab support.
export const CARD_GRADIENT =
  "linear-gradient(155deg, #1e2532 0%, #12151b 48%, #0b0b0d 100%)";

export const CARD_SHADOW =
  "0 30px 80px rgba(11,13,18,0.34), 0 8px 24px rgba(11,13,18,0.18)";

export type ChatBubble = {
  from: "in" | "out" | "day";
  text?: string;
  time?: string;
  typing?: boolean;
};

/**
 * Wrapped-line count for a bubble, without laying it out. Inter at these sizes
 * averages a shade over half an em per character; the static template only needs
 * this to pick a fit scale, and the composition needs it to know how far the
 * thread has to travel as each message pushes the older ones up.
 */
const AVG_CHAR_EM = 0.505;

export function bubbleLines(text: string, fs: number, maxWidth: number): number {
  const perLine = Math.max(8, Math.floor(maxWidth / (fs * AVG_CHAR_EM)));
  // Break on the words, not the raw character count: a long word that will not
  // fit the tail of a line pushes the whole word down, which the character
  // count alone under-counts.
  let lines = 1;
  let used = 0;
  for (const word of text.split(/\s+/)) {
    const w = word.length + (used === 0 ? 0 : 1);
    if (used + w > perLine && used > 0) {
      lines += 1;
      used = word.length;
    } else {
      used += w;
    }
  }
  return lines;
}

/**
 * Height of one thread row (bubble or day chip) in canvas px. `s` is the FULL
 * scale the row renders at, i.e. the canvas unit times any fit shrink (u * s),
 * because GEO is in 1080-wide pixels.
 */
export function rowHeight(m: ChatBubble, s: number): number {
  const g = GEO;
  if (m.from === "day") return (g.chip.fs * 1.24 + g.chip.py * 2) * s;
  const fs = g.bubble.fs * s;
  const max = (m.from === "out" ? g.bubble.outMax : g.bubble.inMax) * s - g.bubble.px * 2 * s;
  // A typing bubble is one short line whatever it replaces.
  const lines = m.typing || !m.text ? 1 : bubbleLines(m.text, fs, max);
  const body = lines * g.bubble.line * s;
  const meta = m.time ? (g.meta.fs * 1.24 + 4) * s : 0;
  // A bubble carrying a timestamp tucks its floor in, so the meta row sits
  // against the text instead of floating in a tall well.
  const padY = (g.bubble.py + (m.time ? g.bubble.outBottom : g.bubble.py)) * s;
  return body + meta + padY;
}

/** Total height of a thread at scale `s` with an explicit row gap. */
export function threadHeight(messages: ChatBubble[], s: number, gap: number): number {
  if (messages.length === 0) return 0;
  return messages.reduce((sum, m) => sum + rowHeight(m, s), 0) + gap * (messages.length - 1);
}

export type ChatLayout = {
  /** 1080-wide pixel unit for this canvas. */
  u: number;
  /** Extra shrink applied to the thread when it will not fit. 1 = Paper size. */
  s: number;
  gap: number;
  headerH: number;
  cardH: number;
  inline: number;
  threadTop: number;
  threadBottom: number;
  /** Vertical room the bubbles actually have, card and padding removed. */
  threadRoom: number;
};

/**
 * Resolve every measurement for one canvas.
 *
 * A thread is intrinsically variable height, and a still and a reel want
 * opposite things when it will not fit:
 *
 * - "fit" (a still): every bubble has to be on the poster, so close the row gaps
 *   first (down to 62%) and only then shrink the type, floored at 0.8. A thread
 *   too long for the frame is a copy problem, not a layout one — trim it in the
 *   brief the way the Paper board trims its 4:5.
 * - "scroll" (a reel): the thread runs at full size and the oldest bubbles leave
 *   under the header as new ones land, which is the effect, not a defect.
 */
export function chatLayout(
  messages: ChatBubble[],
  headline: string,
  w: number,
  h: number,
  mode: "fit" | "scroll" = "fit",
): ChatLayout {
  const u = w / 1080;
  const g = GEO;
  const inline = g.thread.inline * u;

  const headerH =
    (g.header.top + g.header.bottom + Math.max(g.header.avatar, g.header.name * 1.23) + g.header.border) * u;

  const cardInner = w - inline * 2 - g.card.inline * 2 * u;
  const headLines = headline ? bubbleLines(headline, g.card.head * u, cardInner) : 0;
  const cardRow = Math.max(g.card.logoH, g.card.ctaFs * 1.2 + g.card.ctaPy * 2) * u;
  const cardH = headline
    ? (g.card.top + g.card.bottom) * u + headLines * g.card.line * u + g.card.gap * u + cardRow
    : 0;

  const threadTop = g.thread.top * u;
  const threadBottom = g.thread.bottom * u;
  // The card is the last row of the thread, so it takes a gap of its own.
  const threadRoom = h - headerH - threadTop - threadBottom - cardH - (cardH ? g.thread.gap * u : 0);

  let s = 1;
  let gap = g.thread.gap * u;
  if (mode === "scroll") return { u, s, gap, headerH, cardH, inline, threadTop, threadBottom, threadRoom };
  const fits = (sc: number, gp: number) => threadHeight(messages, u * sc, gp) <= threadRoom;
  if (!fits(s, gap)) {
    const tight = g.thread.gap * u * 0.62;
    if (fits(s, tight)) {
      // Binary-search the widest gap that still fits, so a thread that only just
      // overflows does not slam shut to the minimum.
      let lo = tight;
      let hi = gap;
      for (let i = 0; i < 12; i++) {
        const mid = (lo + hi) / 2;
        if (fits(s, mid)) lo = mid;
        else hi = mid;
      }
      gap = lo;
    } else {
      gap = tight;
      const bare = threadHeight(messages, u, 0);
      const gaps = tight * Math.max(0, messages.length - 1);
      s = Math.max(0.8, Math.min(1, (threadRoom - gaps) / Math.max(1, bare)));
      gap = tight * s;
    }
  }

  return { u, s, gap, headerH, cardH, inline, threadTop, threadBottom, threadRoom };
}

// ---------------------------------------------------------------------------
// Reel timing. Lives here, import-free, so the composition and the offline
// scripts derive a brief's durationSec from the same numbers instead of
// guessing one and squeezing the thread to fit it.

/** Seconds. Paced fast on purpose: this is a reel, not a film. */
export const CHAT_PACE = {
  leadIn: 0.35,
  /** Contact's typing indicator before the bubble lands: the first one sets the
   *  scene and gets its full beat, the rest are quicker so the thread moves. */
  typeFirst: 0.55,
  typeNext: 0.3,
  /** Pause before the host answers. */
  leadOut: 0.22,
  /** A day chip that opens the thread, and one mid-thread (time passing). */
  chipOpen: 0.28,
  chipBreak: 0.9,
  /** A typing bubble that IS the message. */
  typingHold: 1.4,
  /** After the last character has settled: a base read, plus per line. */
  readBase: 0.22,
  readPerLine: 0.12,
  cardLead: 0.3,
  /** The closing card holds long enough to be read and acted on. */
  cardHold: 5.0,
} as const;

// Mirrors RISE / STAGGER_WINDOW in remotion/motion/char-rise.tsx: the frames a
// run of characters takes to finish rising. Duplicated (two numbers) rather
// than imported because this module must stay free of Remotion.
const RISE_CHAR_DURATION = 21;
const RISE_STAGGER_WINDOW = 18;
export function riseSeconds(chars: number, fps: number) {
  return (Math.min(RISE_STAGGER_WINDOW, chars) + RISE_CHAR_DURATION) / fps;
}

export type ChatStep = { at: number; typingAt: number | null };

/**
 * When each row arrives, in seconds, at the thread's natural pace. `s` is the
 * full render scale (u * fit), which decides how many lines a bubble wraps to.
 */
export function chatSchedule(messages: ChatBubble[], s: number, fps: number) {
  const P = CHAT_PACE;
  const dwell = (m: ChatBubble) => {
    if (m.typing) return P.typingHold;
    const text = m.text ?? "";
    const max = (m.from === "out" ? GEO.bubble.outMax : GEO.bubble.inMax) * s - GEO.bubble.px * 2 * s;
    const lines = bubbleLines(text, GEO.bubble.fs * s, max);
    return riseSeconds(Array.from(text).length, fps) + P.readBase + P.readPerLine * lines;
  };
  let t = P.leadIn;
  let typed = 0;
  const steps: ChatStep[] = messages.map((m, i) => {
    if (m.from === "day") {
      const at = t;
      t += i === 0 ? P.chipOpen : P.chipBreak;
      return { at, typingAt: null };
    }
    if (m.from === "in") {
      const typingAt = t;
      const at = t + (typed++ === 0 ? P.typeFirst : P.typeNext);
      t = at + dwell(m);
      return { at, typingAt };
    }
    const at = t + P.leadOut;
    t = at + dwell(m);
    return { at, typingAt: null };
  });
  const cardAt = t + P.cardLead;
  return { steps, cardAt, naturalSec: cardAt + P.cardHold };
}
