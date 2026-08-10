import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { VideoInputProps } from "../root";
import { interVars } from "./font";

// phone-mockup-ui: a GENERIC phone-mockup template. A real iPhone frame (light,
// clean, no status bar / island) sits in the scene with a left/top headline that
// crossfades into a CTA; the phone SCREEN is the swappable, animatable surface.
// Two screens ship:
//   - `screen: "chat"` (default) — a guest chat modelled on the hububb.com/hosts
//     hero: guest identity header + listing chip, a white rounded sheet, guest
//     light bubbles and dark Hostie replies tagged "Answered by Hostie AI".
//   - `screen: "agent"` — the hububb.com/hosts hero's Hostie chat itself, ported
//     beat for beat: Hostie AI header (seal + property pill), host questions on
//     the right, Hostie answers streaming in on the left with the rich beat
//     visuals beneath (check-in pulse, cleaner confirmed, revenue count-up +
//     bars, upcoming stays with OTA badges) and the "Hostie is thinking" shimmer.
// To animate other app UI, add a new <XScreen> and a `screen` case; the frame,
// scene, dark mode, rotation and CTA are all reusable as-is.
//
// variant "dark" = a dark scene (background + headline/CTA) with the phone kept
// light. When brief.rotate is set the chat screen flips between
// brief.conversations (the agent screen always cycles its beats), then the
// headline crossfades into brief.cta.button — rendered as the website hero's
// solid pill button (bélo + label) when brief.cta.icon is set, else plain type.
// brief.copy.channels (label + icons) renders the hero's "Connected to" badge
// above the headline.
//
// Surfaces + colours are taken verbatim from the design-system light tokens.
// Chat microcopy, guest names, listings and beat data are reproduced UI; they
// live here (or in the brief's beats/conversations), not in brief.copy (which
// carries only the QA-gated headline).

const FRAME_SRC = "/asset/host/mockups/iphone-frame-silver-cutout.png";
const GLYPH_SRC = "/asset/host/brand/hostie-avatar.svg";
const SCREEN = { left: 0.0421, top: 0.0176, width: 0.9118, height: 0.9639 };
const FRAME_ASPECT = 499 / 1024;

// design-system light tokens
const C = {
  bg: "#ffffff",
  subtle: "#f5f5f5",
  card: "#ffffff",
  border: "#e6e6e6",
  borderSubtle: "#f2f2f2",
  fg: "#1a1a1a",
  t1: "#1a1a1a",
  t2: "#333333",
  t3: "#666666",
  muted: "#808080",
  success: "#00b280",
  seal: "#3b82f6",
  star: "#f59e0b",
};

type Conversation = {
  guest: string;
  photo: string;
  listing: string;
  listingThumb: string;
  channel: string;
  time: string;
  question: string;
  answer: string;
};

// A normal guest thread: the guest is the person you are chatting with (header),
// their question lands, and the reply comes back answered by Hostie.
const CONVERSATIONS: Conversation[] = [
  {
    guest: "Maya R.",
    photo: "/asset/general/guests/guest-5.png",
    listing: "Bright garden flat in De Beauvoir",
    listingThumb: "/asset/host/photos/listing-de-beauvoir.jpg",
    channel: "airbnb.png",
    time: "2:14 AM",
    question: "Hi, we just landed and cannot find the key box. Any help?",
    answer: "Welcome. The lockbox is by the blue door, code 4471, and the wifi is on the welcome card inside.",
  },
  {
    guest: "Daniel O.",
    photo: "/asset/general/guests/guest-2.png",
    listing: "Riverside loft in Shoreditch",
    listingThumb: "/asset/host/photos/listing-de-beauvoir.jpg",
    channel: "booking-b.svg",
    time: "9:26 AM",
    question: "Is there parking nearby, and what time is checkout?",
    answer: "Yes, free parking on Elm Row after 6pm and paid bays by day. Checkout is 11am, no rush.",
  },
];

function Chevron({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="0 0 16 16" style={{ width: size, height: size, marginLeft: -size * 0.06 }} aria-hidden>
      <path d="M10 3.2l-4.6 4.8 4.6 4.8" fill="none" stroke={color} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MoreGlyph({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="0 0 16 16" style={{ width: size, height: size }} aria-hidden>
      <circle cx="3" cy="8" r="1.55" fill={color} />
      <circle cx="8" cy="8" r="1.55" fill={color} />
      <circle cx="13" cy="8" r="1.55" fill={color} />
    </svg>
  );
}

function CheckSeal({ size }: { size: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: "9999px", background: C.seal, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg viewBox="0 0 24 24" style={{ width: size * 0.66, height: size * 0.66 }} aria-hidden>
        <path d="M6 12.5l3.4 3.4L18 7.5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function TypingDots({ frame, size, color }: { frame: number; size: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.6 }}>
      {[0, 1, 2].map((i) => {
        const t = Math.sin((frame / 30) * Math.PI * 3 - i * 0.9);
        const on = 0.5 + 0.5 * t;
        return <span key={i} style={{ width: size, height: size, borderRadius: "9999px", background: color, opacity: 0.35 + 0.5 * on, transform: `translateY(${-(size * 0.35) * on}px)` }} />;
      })}
    </div>
  );
}

function HostieOrb({ size, frame, baseUrl, ring = false }: { size: number; frame: number; baseUrl: string; ring?: boolean }) {
  const pulse = 0.5 + 0.5 * Math.sin(frame / 14);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "radial-gradient(120% 120% at 30% 22%, #3a3a3a 0%, #0a0a0a 62%)",
        boxShadow: ring ? "0 2px 8px rgba(0,0,0,0.22)" : "0 1px 3px rgba(0,0,0,0.2)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Img src={`${baseUrl}${GLYPH_SRC}`} style={{ width: "56%", height: "56%", filter: "invert(1)" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "radial-gradient(55% 55% at 34% 28%, rgba(255,255,255,0.5) 0%, transparent 72%)",
          opacity: 0.35 + 0.45 * pulse,
          transform: `scale(${0.9 + 0.18 * pulse})`,
        }}
      />
    </div>
  );
}

function enter(frame: number, start: number, fps: number, dy: number) {
  const s = spring({ frame: frame - start, fps, config: { damping: 24, mass: 0.8 } });
  return {
    opacity: interpolate(s, [0, 1], [0, 1]),
    transform: `translateY(${interpolate(s, [0, 1], [dy, 0])}px)`,
  };
}

// The built-in "chat" screen: a normal guest chat rendered with the hero
// surfaces. The guest is the thread identity in the header; their message lands
// on the left; Hostie types and the answer comes back on the right, tagged
// "Answered by Hostie AI". A new screen type is just another component like this.
function ChatScreen({
  screenW,
  screenH,
  baseUrl,
  conv,
  localFrame,
  slotFrames,
  frame,
}: {
  screenW: number;
  screenH: number;
  baseUrl: string;
  conv: Conversation;
  localFrame: number;
  slotFrames: number;
  frame: number;
}) {
  const k = screenW / 360;
  const fps = 30;

  // Beats land in the first ~half of the slot so the answered thread then holds
  // still for ~1s+ before the guest dissolves into the next one.
  const questionAt = Math.round(slotFrames * 0.11);
  const typingAt = Math.round(slotFrames * 0.3);
  const answerAt = Math.round(slotFrames * 0.46);
  const typing = localFrame >= typingAt && localFrame < answerAt;

  const circleBtn = (child: React.ReactNode) => (
    <span style={{ display: "flex", width: 36 * k, height: 36 * k, alignItems: "center", justifyContent: "center", borderRadius: "9999px", background: C.card, boxShadow: `0 1px 3px rgba(16,16,18,0.1), inset 0 0 0 ${Math.max(1, k)}px rgba(0,0,0,0.05)`, color: C.t1 }}>
      {child}
    </span>
  );

  return (
    <div style={{ width: screenW, height: screenH, overflow: "hidden", background: C.subtle, display: "flex", flexDirection: "column" }}>
      {/* Header on the subtle tone: the guest is the thread identity */}
      <div style={{ padding: `${34 * k}px ${26 * k}px ${16 * k}px` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {circleBtn(<Chevron size={16 * k} color={C.t1} />)}
          <span style={{ position: "relative", flexShrink: 0 }}>
            <span style={{ display: "block", width: 46 * k, height: 46 * k, borderRadius: "9999px", overflow: "hidden", boxShadow: "0 1px 3px rgba(16,16,18,0.14)" }}>
              <Img src={`${baseUrl}${conv.photo}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </span>
            <span style={{ position: "absolute", bottom: -1 * k, right: -1 * k, width: 19 * k, height: 19 * k, borderRadius: "9999px", overflow: "hidden", boxShadow: `0 0 0 ${2 * k}px #fff, 0 1px 2px rgba(0,0,0,0.18)` }}>
              <Img src={`${baseUrl}/asset/host/channels/${conv.channel}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </span>
          </span>
          {circleBtn(<MoreGlyph size={17 * k} color={C.t1} />)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 9 * k }}>
          <span style={{ fontSize: 14.5 * k, fontWeight: 600, color: C.t1 }}>{conv.guest}</span>
          <div style={{ display: "flex", maxWidth: screenW * 0.78, alignItems: "center", gap: 6 * k, background: C.card, borderRadius: "9999px", padding: `${3 * k}px ${11 * k}px ${3 * k}px ${4 * k}px`, marginTop: 7 * k, boxShadow: "0 1px 3px rgba(16,16,18,0.08)" }}>
            <span style={{ width: 18 * k, height: 18 * k, borderRadius: "9999px", overflow: "hidden", flexShrink: 0 }}>
              <Img src={`${baseUrl}${conv.listingThumb}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </span>
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 11.5 * k, fontWeight: 500, color: C.t3 }}>{conv.listing}</span>
          </div>
        </div>
      </div>

      {/* Conversation sheet: white, rounded top, rising off the subtle header */}
      <div style={{ flex: 1, minHeight: 0, background: C.bg, borderTopLeftRadius: 52 * k, borderTopRightRadius: 52 * k, boxShadow: "0 -8px 20px -14px rgba(0,0,0,0.18)", padding: `${24 * k}px ${20 * k}px`, display: "flex", flexDirection: "column", gap: 14 * k }}>
        {/* Guest message (left) */}
        {localFrame >= questionAt ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", ...enter(localFrame, questionAt, fps, 10 * k) }}>
            <div style={{ maxWidth: "84%", background: C.subtle, color: C.t1, borderRadius: 18 * k, borderBottomLeftRadius: 7 * k, padding: `${13 * k}px ${17 * k}px`, fontSize: 15 * k, lineHeight: 1.45 }}>
              {conv.question}
            </div>
            <span style={{ marginLeft: 6 * k, marginTop: 6 * k, fontSize: 10.5 * k, color: C.muted }}>{conv.time}</span>
          </div>
        ) : null}

        {/* Hostie typing, then the answer (right) with a Hostie orb marker */}
        {typing ? (
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", gap: 7 * k }}>
            <div style={{ background: C.fg, borderRadius: 18 * k, borderBottomRightRadius: 7 * k, padding: `${15 * k}px ${18 * k}px` }}>
              <TypingDots frame={frame} size={6 * k} color="#ffffff" />
            </div>
            <HostieOrb size={27 * k} frame={frame} baseUrl={baseUrl} />
          </div>
        ) : null}
        {localFrame >= answerAt ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", ...enter(localFrame, answerAt, fps, 10 * k) }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 7 * k, maxWidth: "90%" }}>
              <div style={{ background: C.fg, color: "#ffffff", borderRadius: 18 * k, borderBottomRightRadius: 7 * k, padding: `${13 * k}px ${17 * k}px`, fontSize: 15 * k, lineHeight: 1.45 }}>
                {conv.answer}
              </div>
              <HostieOrb size={27 * k} frame={frame} baseUrl={baseUrl} />
            </div>
            <span style={{ display: "flex", alignItems: "center", gap: 4 * k, marginRight: 34 * k, marginTop: 6 * k, fontSize: 10.5 * k, color: C.muted }}>
              <CheckSeal size={11 * k} />
              Answered by Hostie AI
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Agent screen — the hububb.com/hosts hero chat, ported beat for beat.
// Data mirrors the website's mock-data (De Beauvoir property); a brief overrides
// it with brief.beats / brief.property. All reproduced UI, not QA-gated copy.
// ---------------------------------------------------------------------------

type AgentPerson = { name: string; photo: string };
type AgentCard =
  | { kind: "checkin"; guest: AgentPerson; accessed: string[]; when: string }
  | { kind: "task"; cleaner: AgentPerson; role: string; when: string; state: string }
  | {
      kind: "revenue";
      totalValue: number;
      range: string;
      delta: string;
      series: { label: string; value: number }[];
      insight: string;
    }
  | {
      kind: "reservation";
      title: string;
      reservations: { guest: AgentPerson; dates: string; nights: number; channel: string }[];
    };
type AgentBeat = { host?: string; hostie: string; card: AgentCard };
type AgentProperty = { title: string; thumb: string; rating?: number };

const AGENT_PROPERTY: AgentProperty = {
  title: "Bright garden flat in De Beauvoir",
  thumb: "/asset/host/photos/listing-de-beauvoir.jpg",
  rating: 4.92,
};

// Beat order and voice match the website hero: check-in and the turnover are
// proactive; revenue and reservations answer the host. Revenue series sums to
// the headline figure so the chart stays honest.
const AGENT_BEATS: AgentBeat[] = [
  {
    hostie:
      "Maya checked in and opened the guest portal. She has the door code, wifi, and the local guide.",
    card: {
      kind: "checkin",
      guest: { name: "Maya R.", photo: "/asset/general/guests/guest-5.png" },
      accessed: ["Door code", "Wifi", "Local guide"],
      when: "just now",
    },
  },
  {
    hostie:
      "I have booked the next turnover for right after checkout in two days. Sofia confirmed the slot.",
    card: {
      kind: "task",
      cleaner: { name: "Sofia", photo: "/asset/host/people/sofia.png" },
      role: "Cleaner",
      when: "Thu, right after the 11:00 checkout",
      state: "Confirmed",
    },
  },
  {
    host: "How's the De Beauvoir flat doing?",
    hostie:
      "Revenue is up 12% over the last two weeks. I filled two weekend gaps at the higher rate.",
    card: {
      kind: "revenue",
      totalValue: 2870,
      range: "Last 14 days",
      delta: "12%",
      series: [150, 140, 165, 180, 260, 275, 160, 175, 170, 190, 205, 290, 310, 200].map(
        (value, i) => ({ label: "MTWTFSSMTWTFSS"[i] ?? "", value }),
      ),
      insight: "Both weekends sold out at the higher rate.",
    },
  },
  {
    host: "What's coming up?",
    hostie:
      "Three stays across this week and next, all confirmed. The portal is ready for each guest.",
    card: {
      kind: "reservation",
      title: "This & next week",
      reservations: [
        { guest: { name: "Maya R.", photo: "/asset/general/guests/guest-5.png" }, dates: "Tue to Thu", nights: 2, channel: "airbnb.png" },
        { guest: { name: "James P.", photo: "/asset/general/guests/guest-2.png" }, dates: "Fri to Mon", nights: 3, channel: "booking-b.svg" },
        { guest: { name: "Lena K.", photo: "/asset/general/guests/guest-8.png" }, dates: "Wed to Fri", nights: 2, channel: "expedia.png" },
      ],
    },
  },
];

const SUCCESS_BG = "#e5fff8";

// The Airbnb bélo, inline so the brand coral is exact (ported from the website
// hero's AirbnbMark).
function AirbnbBelo({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 64 64" style={{ width: size, height: size, flexShrink: 0 }} aria-hidden>
      <path
        fillRule="evenodd"
        fill="#ff5a5f"
        d="M60.9 45.487l-.966-2.305-1.475-3.27-.062-.062a661.83 661.83 0 0 0-14.15-28.957l-.198-.384-1.524-3.073a18.4 18.4 0 0 0-2.305-3.52A10.35 10.35 0 0 0 32.027 0a10.76 10.76 0 0 0-8.203 3.84 22.1 22.1 0 0 0-2.305 3.52l-1.735 3.395c-4.956 9.615-9.74 19.342-14.163 28.957l-.062.124c-.384 1.053-.892 2.13-1.413 3.284-.322.702-.644 1.47-.966 2.305a14.4 14.4 0 0 0-.768 6.914 13.63 13.63 0 0 0 8.327 10.631 13.16 13.16 0 0 0 5.192 1.028 14.57 14.57 0 0 0 1.66-.124 16.93 16.93 0 0 0 6.406-2.18 32.44 32.44 0 0 0 7.943-6.666 33.62 33.62 0 0 0 7.943 6.666 16.92 16.92 0 0 0 6.406 2.18c.55.073 1.105.114 1.66.124 1.783.018 3.55-.332 5.192-1.028a13.63 13.63 0 0 0 8.327-10.631 12.11 12.11 0 0 0-.582-6.852zM32.026 48.82c-3.457-4.362-5.7-8.45-6.468-11.92-.314-1.277-.38-2.6-.198-3.903.127-.965.48-1.886 1.028-2.7a6.79 6.79 0 0 1 5.638-2.825c2.236-.086 4.362.974 5.638 2.813a6.17 6.17 0 0 1 1.028 2.69 10.3 10.3 0 0 1-.198 3.903c-.768 3.395-3 7.435-6.468 11.92zm25.562 3c-.5 3.337-2.7 6.166-5.836 7.435a9.7 9.7 0 0 1-4.857.706 12.6 12.6 0 0 1-4.87-1.66 29.91 29.91 0 0 1-7.298-6.195c4.225-5.192 6.8-9.913 7.757-14.163a16.11 16.11 0 0 0 .322-5.452c-.238-1.567-.832-3.06-1.735-4.362-2.062-2.942-5.453-4.666-9.045-4.597-3.572-.046-6.942 1.65-9.033 4.547-.903 1.303-1.497 2.794-1.735 4.362a13.31 13.31 0 0 0 .322 5.452c.966 4.225 3.593 9.033 7.757 14.225a28.79 28.79 0 0 1-7.298 6.195 12.6 12.6 0 0 1-4.882 1.71 10.26 10.26 0 0 1-4.87-.644C9.16 58.12 6.94 55.292 6.45 51.954a10.61 10.61 0 0 1 .582-4.956c.198-.644.508-1.24.83-2.044.446-1.028.966-2.12 1.475-3.2l.062-.124c4.424-9.54 9.157-19.28 14.1-28.772l.186-.458 1.536-2.95a14.05 14.05 0 0 1 1.846-2.838 6.73 6.73 0 0 1 10.247 0 13.87 13.87 0 0 1 1.747 2.813l1.536 2.95.186.384c4.87 9.553 9.628 19.28 14.04 28.834v.062c.508 1.028.966 2.18 1.475 3.2.322.768.644 1.413.83 2.044a10.81 10.81 0 0 1 .446 4.956z"
      />
    </svg>
  );
}

function StarGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 16 16" style={{ width: size, height: size, flexShrink: 0 }} aria-hidden>
      <path d="M8 1.4l2 4.1 4.5.7-3.3 3.2.8 4.5L8 11.8l-4 2.1.8-4.5-3.3-3.2 4.5-.7z" fill={C.star} />
    </svg>
  );
}

function TrendUpGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 16 16" style={{ width: size, height: size, flexShrink: 0 }} aria-hidden>
      <path d="M1.5 11.5L6 7l3 3 5.5-5.5" fill="none" stroke={C.success} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.8 4.5h3.7v3.7" fill="none" stroke={C.success} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// The website's ShiningText thinking shimmer, frame-driven (2s sweep at 30fps).
function ShiningText({ text, frame, size }: { text: string; frame: number; size: number }) {
  const pos = 200 - ((frame * (400 / 60)) % 400);
  return (
    <span
      style={{
        fontSize: size,
        fontWeight: 400,
        backgroundImage: "linear-gradient(110deg,#404040,35%,#ffffff,50%,#404040,75%,#404040)",
        backgroundSize: "200% 100%",
        backgroundPosition: `${pos}% 0`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      {text}
    </span>
  );
}

// A portrait in the website's soft-cornered frame (PersonPhoto).
function PersonPhoto({ src, size, k, round = false, baseUrl }: { src: string; size: number; k: number; round?: boolean; baseUrl: string }) {
  return (
    <span style={{ display: "block", width: size, height: size, borderRadius: round ? "9999px" : 16 * k * (size / (52 * k)), overflow: "hidden", background: C.subtle, flexShrink: 0 }}>
      <Img src={`${baseUrl}${src}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </span>
  );
}

function easeEnter(vf: number, delay: number, dur = 12) {
  const t = interpolate(vf, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  return t;
}

// The four beat visuals, ported from the website's borderless card components.
function AgentVisual({ card, vf, k, frame, fps, baseUrl }: { card: AgentCard; vf: number; k: number; frame: number; fps: number; baseUrl: string }) {
  if (card.kind === "checkin") {
    const ping = (frame % 42) / 42;
    return (
      <div style={{ display: "flex", gap: 14 * k, alignItems: "center" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <PersonPhoto src={card.guest.photo} size={52 * k} k={k} baseUrl={baseUrl} />
          <span style={{ position: "absolute", bottom: -3 * k, right: -3 * k, width: 15 * k, height: 15 * k, borderRadius: "9999px", background: C.card, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ position: "relative", width: 9 * k, height: 9 * k }}>
              <span style={{ position: "absolute", inset: 0, borderRadius: "9999px", background: C.success, opacity: 0.55 * (1 - ping), transform: `scale(${1 + ping * 1.15})` }} />
              <span style={{ position: "absolute", inset: 0, borderRadius: "9999px", background: C.success }} />
            </span>
          </span>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 7 * k, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15 * k, fontWeight: 600, color: C.t1 }}>{card.guest.name}</span>
            <span style={{ fontSize: 11 * k, fontWeight: 500, color: C.success, whiteSpace: "nowrap" }}>Checked in · {card.when}</span>
          </div>
          <p style={{ margin: 0, marginTop: 2 * k, fontSize: 12.5 * k, color: C.t3 }}>Opened the guest portal</p>
          <p style={{ margin: 0, marginTop: 7 * k, fontSize: 10.5 * k, color: C.muted }}>{card.accessed.join("  ·  ")}</p>
        </div>
      </div>
    );
  }
  if (card.kind === "task") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 * k }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 * k }}>
          <PersonPhoto src={card.cleaner.photo} size={52 * k} k={k} baseUrl={baseUrl} />
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 15 * k, fontWeight: 600, color: C.t1 }}>{card.cleaner.name}</p>
            <p style={{ margin: 0, marginTop: 1.5 * k, fontSize: 12.5 * k, color: C.t3 }}>{card.role}</p>
          </div>
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5 * k, borderRadius: "9999px", background: SUCCESS_BG, padding: `${3.5 * k}px ${9 * k}px`, fontSize: 11 * k, fontWeight: 500, color: C.success, whiteSpace: "nowrap" }}>
            <span style={{ width: 5 * k, height: 5 * k, borderRadius: "9999px", background: C.success }} />
            {card.state}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 12.5 * k, color: C.t2 }}>Turnover clean · {card.when}</p>
      </div>
    );
  }
  if (card.kind === "revenue") {
    const max = Math.max(...card.series.map((p) => p.value), 1);
    const countT = interpolate(vf, [0, Math.round(0.9 * fps)], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    const display = Math.round(card.totalValue * countT).toLocaleString("en-GB");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 * k }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 * k }}>
          <div>
            <p style={{ margin: 0, fontSize: 26 * k, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1, color: C.t1, fontVariantNumeric: "tabular-nums" }}>£{display}</p>
            <p style={{ margin: 0, marginTop: 5 * k, fontSize: 10.5 * k, color: C.t3 }}>{card.range}</p>
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 * k, borderRadius: "9999px", background: SUCCESS_BG, padding: `${2.5 * k}px ${8 * k}px`, fontSize: 10.5 * k, fontWeight: 500, color: C.success }}>
            <TrendUpGlyph size={11 * k} />
            {card.delta}
          </span>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3 * k, height: 76 * k, borderBottom: `1px solid ${C.borderSubtle}`, paddingBottom: 1 }}>
            {card.series.map((point, i) => {
              const isLast = i === card.series.length - 1;
              const grow = easeEnter(vf, Math.round((0.05 + i * 0.025) * fps), 12);
              return (
                <div key={i} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <div
                    style={{
                      width: "100%",
                      borderRadius: 2.5 * k,
                      height: `${Math.max(8, Math.round((point.value / max) * 100))}%`,
                      transform: `scaleY(${grow})`,
                      transformOrigin: "bottom",
                      background: isLast ? "linear-gradient(to top, #1a1a1a, rgba(26,26,26,0.7))" : "rgba(26,26,26,0.15)",
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 * k, fontSize: 8.5 * k, color: C.t3 }}>
            <span>2 weeks ago</span>
            <span>Today</span>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 12 * k, color: C.t3 }}>{card.insight}</p>
      </div>
    );
  }
  // reservation
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 * k }}>
      <p style={{ margin: 0, fontSize: 10 * k, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted }}>{card.title}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 * k }}>
        {card.reservations.map((r, i) => {
          const t = easeEnter(vf, Math.round((0.08 + i * 0.1) * fps), 11);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 * k, opacity: t, transform: `translateX(${(1 - t) * 8 * k}px)` }}>
              <PersonPhoto src={r.guest.photo} size={36 * k} k={k} round baseUrl={baseUrl} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 12.5 * k, fontWeight: 500, color: C.t1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.guest.name}</p>
                <p style={{ margin: 0, marginTop: 1 * k, fontSize: 10.5 * k, color: C.t3 }}>
                  {r.dates} · {r.nights} {r.nights === 1 ? "night" : "nights"}
                </p>
              </div>
              <span style={{ width: 18 * k, height: 18 * k, borderRadius: "9999px", overflow: "hidden", flexShrink: 0, boxShadow: "0 0 0 1px rgba(0,0,0,0.05)" }}>
                <Img src={`${baseUrl}/asset/host/channels/${r.channel}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// The agent screen: Hostie is the thread identity (seal + property pill); each
// beat plays question → thinking shimmer → streamed answer → rich visual, then
// the shell cross-dissolves to the next beat.
function AgentScreen({
  screenW,
  screenH,
  baseUrl,
  beat,
  property,
  localFrame,
  slotFrames,
  frame,
}: {
  screenW: number;
  screenH: number;
  baseUrl: string;
  beat: AgentBeat;
  property: AgentProperty;
  localFrame: number;
  slotFrames: number;
  frame: number;
}) {
  const k = screenW / 360;
  const fps = 30;

  const hasQ = Boolean(beat.host);
  const qAt = Math.round(slotFrames * 0.05);
  const thinkAt = Math.round(slotFrames * (hasQ ? 0.18 : 0.07));
  const answerAt = Math.round(slotFrames * (hasQ ? 0.3 : 0.19));
  const charsPerFrame = 3.2;
  const streamed = Math.max(0, Math.floor((localFrame - answerAt) * charsPerFrame));
  const answerText = beat.hostie.slice(0, streamed);
  const streamFrames = Math.ceil(beat.hostie.length / charsPerFrame);
  const visualAt = answerAt + streamFrames + 4;
  const thinking = localFrame >= thinkAt && localFrame < answerAt;
  const vf = localFrame - visualAt;

  const circleBtn = (child: React.ReactNode) => (
    <span style={{ display: "flex", width: 36 * k, height: 36 * k, alignItems: "center", justifyContent: "center", borderRadius: "9999px", background: C.card, boxShadow: `0 1px 3px rgba(16,16,18,0.1), inset 0 0 0 ${Math.max(1, k)}px rgba(0,0,0,0.05)`, color: C.t1 }}>
      {child}
    </span>
  );

  return (
    <div style={{ width: screenW, height: screenH, overflow: "hidden", background: C.subtle, display: "flex", flexDirection: "column" }}>
      {/* Header on the subtle tone: Hostie AI is the thread identity */}
      <div style={{ padding: `${34 * k}px ${26 * k}px ${15 * k}px` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {circleBtn(<Chevron size={16 * k} color={C.t1} />)}
          <HostieOrb size={46 * k} frame={frame} baseUrl={baseUrl} ring />
          {circleBtn(<MoreGlyph size={17 * k} color={C.t1} />)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 8 * k }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4.5 * k, fontSize: 14 * k, fontWeight: 600, color: C.t1 }}>
            Hostie AI
            <CheckSeal size={14 * k} />
          </span>
          <div style={{ display: "flex", maxWidth: screenW * 0.82, alignItems: "center", gap: 6 * k, background: C.card, borderRadius: "9999px", padding: `${3.5 * k}px ${10 * k}px ${3.5 * k}px ${4 * k}px`, marginTop: 6.5 * k, boxShadow: "0 1px 3px rgba(16,16,18,0.08)" }}>
            <span style={{ width: 19 * k, height: 19 * k, borderRadius: "9999px", overflow: "hidden", flexShrink: 0 }}>
              <Img src={`${baseUrl}${property.thumb}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </span>
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 11.5 * k, fontWeight: 500, color: C.t1 }}>{property.title}</span>
            {property.rating ? (
              <span style={{ display: "flex", alignItems: "center", gap: 2.5 * k, fontSize: 11 * k, color: C.t2, flexShrink: 0 }}>
                <StarGlyph size={10.5 * k} />
                {property.rating}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Conversation sheet: white, rounded top, rising off the subtle header */}
      <div style={{ flex: 1, minHeight: 0, background: C.bg, borderTopLeftRadius: 30 * k, borderTopRightRadius: 30 * k, boxShadow: "0 -8px 20px -14px rgba(0,0,0,0.18)", padding: `${22 * k}px ${20 * k}px`, display: "flex", flexDirection: "column", gap: 11 * k }}>
        {/* Host question — right, dark bubble */}
        {hasQ && localFrame >= qAt ? (
          <div style={{ display: "flex", justifyContent: "flex-end", ...enter(localFrame, qAt, fps, 8 * k) }}>
            <div style={{ maxWidth: "80%", background: C.fg, color: "#ffffff", borderRadius: 16 * k, borderBottomRightRadius: 6 * k, padding: `${8 * k}px ${13 * k}px`, fontSize: 13 * k, lineHeight: 1.5 }}>
              {beat.host}
            </div>
          </div>
        ) : null}

        {/* Thinking shimmer */}
        {thinking ? (
          <div style={{ paddingLeft: 2 * k, ...enter(localFrame, thinkAt, fps, 4 * k) }}>
            <ShiningText text="Hostie is thinking" frame={frame} size={12.5 * k} />
          </div>
        ) : null}

        {/* Hostie reply — left, light bubble, visual settles beneath */}
        {localFrame >= answerAt && streamed > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 * k, ...enter(localFrame, answerAt, fps, 6 * k) }}>
            <div style={{ maxWidth: "88%", background: C.subtle, color: C.t1, borderRadius: 16 * k, borderBottomLeftRadius: 6 * k, padding: `${8 * k}px ${13 * k}px`, fontSize: 13 * k, lineHeight: 1.5 }}>
              {answerText}
            </div>
            {vf >= 0 ? (
              <div style={{ width: "100%", paddingRight: 4 * k, paddingLeft: 2 * k, ...enter(localFrame, visualAt, fps, 8 * k) }}>
                <AgentVisual card={beat.card} vf={vf} k={k} frame={frame} fps={fps} baseUrl={baseUrl} />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function PhoneMockupUi({ brief, baseUrl }: VideoInputProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h, durationInFrames } = useVideoConfig();
  const c = brief.copy ?? {};
  const cta = (brief as { cta?: { button?: string; icon?: string } }).cta;
  const rotate = Boolean((brief as { rotate?: boolean }).rotate);
  // Which app UI plays on the phone screen ("chat" or "agent"). The shell
  // (frame, scene, dark mode, headline/CTA) is screen-agnostic.
  const screen = (brief as { screen?: string }).screen ?? "chat";
  // Dark = a dark scene (background + headline/CTA) with the phone kept light.
  const dark = brief.variant === "dark";
  // Conversations / beats are data-driven: a brief may supply its own exchanges,
  // otherwise the built-in defaults play. This is what makes it a template.
  const briefConvos = (brief as { conversations?: Conversation[] }).conversations;
  const convos = Array.isArray(briefConvos) && briefConvos.length ? briefConvos : CONVERSATIONS;
  const briefBeats = (brief as { beats?: AgentBeat[] }).beats;
  const beats = Array.isArray(briefBeats) && briefBeats.length ? briefBeats : AGENT_BEATS;
  const property = (brief as { property?: AgentProperty }).property ?? AGENT_PROPERTY;
  // The website hero's "Connected to" badge, rendered above the headline when
  // the brief carries copy.channels ({label, icons[], more?}).
  const channels = (c as { channels?: { label?: string; icons: string[]; more?: string } }).channels;
  const hasChannels = Boolean(channels?.icons?.length);

  const headline = c.headline ?? "Guests never wait for you to wake up";
  const sceneInk = dark ? "#f4f4f5" : C.t1;

  const aspect = w / h;
  const min = Math.min(w, h);
  const landscape = w > h;
  const square = !landscape && Math.abs(aspect - 1) < 0.06;
  const tall = aspect <= 0.62;
  // 1x1 / 4x5 run the phone large and bleed it off the bottom (same on light and
  // dark — the positioning the user locked in).
  const showcase = !landscape && !tall;

  const pad = Math.round(min * 0.07);
  const HS = (n: number) => Math.round(min * n);
  const brandH = brief.brandMark ? HS(0.06) : pad;

  const headSize = landscape
    ? Math.round(h * 0.083)
    : square
      ? Math.round(w * 0.078)
      : tall
        ? Math.round(w * 0.07)
        : Math.round(w * 0.076);
  const textZoneH = Math.round(headSize * 1.2 * 2);
  // Extra top-zone height when the "Connected to" badge renders above the headline.
  const pillIconSize = HS(0.03);
  const pillZoneH = hasChannels ? Math.round(pillIconSize * 1.7 + HS(0.022)) : 0;

  // Device geometry — a touch smaller than before.
  let framedH: number;
  let phoneLeft: number;
  let phoneTop: number;
  if (landscape) {
    const textColW = w * 0.46;
    const areaW = w - textColW - pad;
    const areaH = h - 2 * pad;
    framedH = Math.min(areaH, areaW / FRAME_ASPECT) * 0.94;
    const fw = framedH * FRAME_ASPECT;
    phoneLeft = textColW + (areaW - fw) / 2;
    phoneTop = (h - framedH) / 2;
  } else if (showcase) {
    const fw = (square ? 0.58 : 0.7) * w;
    framedH = fw / FRAME_ASPECT;
    phoneLeft = (w - fw) / 2;
    phoneTop = pad + pillZoneH + textZoneH + HS(0.035);
  } else {
    const areaTop = pad + pillZoneH + textZoneH + HS(0.03);
    const areaBottom = h - brandH;
    const areaH = areaBottom - areaTop;
    const areaW = w - 2 * pad;
    framedH = Math.min(areaH, areaW / FRAME_ASPECT) * 0.96;
    const fw = framedH * FRAME_ASPECT;
    phoneLeft = (w - fw) / 2;
    phoneTop = areaTop + (areaH - framedH) / 2;
  }
  const framedW = framedH * FRAME_ASPECT;
  const screenW = framedW * SCREEN.width;
  const screenH = framedH * SCREEN.height;

  // Guest rotation: split the pre-CTA span into equal slots. Transitions are a
  // smooth CROSS-DISSOLVE — the next guest fades in on top of the current one (which
  // stays full behind, so the screen never blanks to the backdrop), then takes
  // over. Reads as one guest dissolving into the next.
  const convSpan = cta?.button ? 0.82 : 0.98;
  const count = screen === "agent" ? beats.length : rotate ? convos.length : 1;
  const slotFrames = (convSpan * durationInFrames) / count;
  const cur = Math.min(count - 1, Math.floor(frame / slotFrames));
  const localCur = frame - cur * slotFrames;
  const dissolveFrames = Math.round(slotFrames * 0.15);
  const inXfade = count > 1 && cur < count - 1 && localCur > slotFrames - dissolveFrames;
  const rawT = inXfade ? (localCur - (slotFrames - dissolveFrames)) / dissolveFrames : 0;
  const dissolveT = rawT * rawT * (3 - 2 * rawT); // smoothstep ease
  const nextLocalFrame = frame - (cur + 1) * slotFrames;

  const phoneIn = spring({ frame: frame - 8, fps, config: { damping: 18, mass: 0.9 } });
  const phoneStyle: React.CSSProperties = {
    opacity: phoneIn,
    transform: `translateY(${interpolate(phoneIn, [0, 1], [Math.round(h * 0.05), 0])}px)`,
  };

  // Fast, smooth crossfade from the headline to the CTA (a snappy spring).
  const swap = cta?.button
    ? Math.max(0, Math.min(1, spring({ frame: frame - Math.round(durationInFrames * 0.8), fps, config: { damping: 20, stiffness: 190, mass: 0.6 } })))
    : 0;

  // The frame photo blends invisibly into the LIGHT scene. On dark, its soft
  // anti-aliased edge + fine silver bezel would read as a pixelated fringe. So on
  // dark we composite the whole phone over a soft light "plate" (below) — the
  // exact trick the light scene does for free — and use a plain soft shadow here.
  const deviceShadow = dark
    ? "drop-shadow(0 30px 55px rgba(0,0,0,0.5))"
    : "drop-shadow(0 34px 60px rgba(0,0,0,0.2))";
  const he = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  const headEnterDy = interpolate(he, [0, 1], [Math.round(h * 0.015), 0]);
  const alignText = landscape ? "left" : "center";
  const headStyle: React.CSSProperties = {
    margin: 0,
    fontSize: headSize,
    lineHeight: 1.2,
    letterSpacing: "-0.02em",
    fontWeight: 600,
    color: sceneInk,
    textWrap: "balance",
  };

  // The hero's "Connected to" badge — label + overlapping channel circles ringed
  // in the badge's own tone so the stack reads as one piece over the gradient.
  const pillRing = dark ? "#232326" : "#eeedeb";
  const channelsBadge = hasChannels ? (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: Math.round(pillIconSize * 0.5),
        background: dark ? "rgba(255,255,255,0.08)" : "rgba(26,26,26,0.05)",
        borderRadius: 9999,
        padding: `${Math.round(pillIconSize * 0.34)}px ${Math.round(pillIconSize * 0.5)}px ${Math.round(pillIconSize * 0.34)}px ${Math.round(pillIconSize * 0.72)}px`,
      }}
    >
      <span style={{ fontSize: HS(0.02), fontWeight: 500, color: dark ? "#c9c9cc" : C.t2, whiteSpace: "nowrap" }}>
        {channels?.label ?? "Connected to"}
      </span>
      <span style={{ display: "flex", alignItems: "center" }}>
        {channels?.icons.map((src, i) => (
          <span
            key={src}
            style={{
              width: pillIconSize,
              height: pillIconSize,
              borderRadius: "9999px",
              overflow: "hidden",
              background: "#ffffff",
              marginLeft: i ? -pillIconSize * 0.24 : 0,
              boxShadow: `0 0 0 ${Math.max(2, HS(0.003))}px ${pillRing}`,
              flexShrink: 0,
            }}
          >
            <Img src={`${baseUrl}${src}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </span>
        ))}
        {channels?.more ? (
          <span
            style={{
              width: pillIconSize,
              height: pillIconSize,
              borderRadius: "9999px",
              background: "#ffffff",
              marginLeft: -pillIconSize * 0.24,
              boxShadow: `0 0 0 ${Math.max(2, HS(0.003))}px ${pillRing}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: pillIconSize * 0.42,
              fontWeight: 600,
              color: C.t2,
              flexShrink: 0,
            }}
          >
            {channels.more}
          </span>
        ) : null}
      </span>
    </div>
  ) : null;

  // CTA end state: the website hero's solid pill button (bélo + label) when the
  // brief sets cta.icon ("airbnb" = the inline bélo, else a served icon path);
  // plain headline-weight type otherwise (the original behaviour).
  const btnH = HS(0.072);
  const ctaEl = cta?.button ? (
    cta.icon ? (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: HS(0.015),
          height: btnH,
          padding: `0 ${HS(0.04)}px 0 ${HS(0.032)}px`,
          borderRadius: 9999,
          background: dark ? "#f2f2f2" : C.fg,
          color: dark ? C.t1 : "#ffffff",
          fontWeight: 600,
          fontSize: HS(0.026),
          boxShadow: "0 6px 20px rgba(26,26,26,0.22)",
          whiteSpace: "nowrap",
        }}
      >
        {cta.icon === "airbnb" ? (
          <AirbnbBelo size={Math.round(btnH * 0.38)} />
        ) : (
          <Img src={`${baseUrl}${cta.icon}`} style={{ height: Math.round(btnH * 0.42), width: "auto" }} />
        )}
        {cta.button}
      </span>
    ) : (
      <span style={{ ...headStyle }}>{cta.button}</span>
    )
  ) : null;

  const copy = (
    <div style={{ textAlign: alignText }}>
      {channelsBadge ? (
        <div
          style={{
            display: "flex",
            justifyContent: landscape ? "flex-start" : "center",
            marginBottom: HS(0.022),
            opacity: he,
            transform: `translateY(${headEnterDy}px)`,
          }}
        >
          {channelsBadge}
        </div>
      ) : null}
      <div style={{ position: "relative", height: textZoneH }}>
        <h1 style={{ ...headStyle, position: "absolute", top: 0, left: 0, right: 0, opacity: he * (1 - swap), transform: `translateY(${headEnterDy - Math.round(headSize * 0.12) * swap}px)` }}>
          {headline}
        </h1>
        {ctaEl ? (
          <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: landscape ? "flex-start" : "center", opacity: swap, transform: `translateY(${Math.round(headSize * 0.14) * (1 - swap)}px)` }}>
            {ctaEl}
          </div>
        ) : null}
      </div>
    </div>
  );

  // Extend the screen content just a hair past the measured cutout so it meets
  // the bezel with no seam, while staying essentially the exact screen width so
  // the sheet's rounded corners land right on the screen edges. A solid backdrop
  // in the screen tone sits behind it as a further safety net.
  const bleed = Math.round(framedW * 0.004);
  // Left/right inset for the dark-scene light plate: just inside the body so the
  // side buttons (which protrude ~0.6% of the width) sit out on the dark ground.
  // Top/bottom stay flush (inset 0) so the frame's soft top/bottom edge composites
  // over light like the sides do — otherwise a thin dark fringe reads at the top.
  const plateInset = Math.max(2, Math.round(framedW * 0.007));
  const phone = (
    <div style={{ position: "absolute", left: phoneLeft, top: phoneTop, width: framedW, height: framedH, ...phoneStyle }}>
      {/* Dark scene only: a light plate the device composites over, so its edge
          sits on light (as on the light scene) instead of fringing on the dark.
          Inset just inside the body silhouette (the side buttons protrude ~0.6%
          past the body), so it is fully hidden AND the volume/side buttons sit
          out on the dark like a real device. No spill, no blur. */}
      {dark ? (
        <div style={{ position: "absolute", top: 0, left: plateInset, right: plateInset, bottom: 0, borderRadius: framedW * 0.18, background: "#e6e7eb" }} />
      ) : null}
      {/* Backdrop in the screen tone, radius < the frame's screen hole so it fully
          covers the rounded corners (no dark sliver peeking through on dark). */}
      <div style={{ position: "absolute", left: framedW * SCREEN.left - bleed, top: framedH * SCREEN.top - bleed, width: screenW + 2 * bleed, height: screenH + 2 * bleed, borderRadius: Math.round(screenW * 0.13), background: C.subtle, overflow: "hidden" }} />
      <div style={{ position: "absolute", left: framedW * SCREEN.left - bleed, top: framedH * SCREEN.top - bleed, width: screenW + 2 * bleed, height: screenH + 2 * bleed, borderRadius: Math.round(screenW * 0.175), overflow: "hidden" }}>
        {/* The animatable phone screen ("chat" or "agent"); add cases here.
            Beats swap by dissolving: the next fades in on top of the current. */}
        {screen === "chat" ? (
          <>
            <div style={{ position: "absolute", inset: 0 }}>
              <ChatScreen screenW={screenW + 2 * bleed} screenH={screenH + 2 * bleed} baseUrl={baseUrl} conv={convos[cur]} localFrame={localCur} slotFrames={slotFrames} frame={frame} />
            </div>
            {inXfade ? (
              <div style={{ position: "absolute", inset: 0, opacity: dissolveT }}>
                <ChatScreen screenW={screenW + 2 * bleed} screenH={screenH + 2 * bleed} baseUrl={baseUrl} conv={convos[cur + 1]} localFrame={nextLocalFrame} slotFrames={slotFrames} frame={frame} />
              </div>
            ) : null}
          </>
        ) : null}
        {screen === "agent" ? (
          <>
            <div style={{ position: "absolute", inset: 0 }}>
              <AgentScreen screenW={screenW + 2 * bleed} screenH={screenH + 2 * bleed} baseUrl={baseUrl} beat={beats[cur]} property={property} localFrame={localCur} slotFrames={slotFrames} frame={frame} />
            </div>
            {inXfade ? (
              <div style={{ position: "absolute", inset: 0, opacity: dissolveT }}>
                <AgentScreen screenW={screenW + 2 * bleed} screenH={screenH + 2 * bleed} baseUrl={baseUrl} beat={beats[cur + 1]} property={property} localFrame={nextLocalFrame} slotFrames={slotFrames} frame={frame} />
              </div>
            ) : null}
          </>
        ) : null}
      </div>
      <Img src={`${baseUrl}${FRAME_SRC}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: deviceShadow }} />
    </div>
  );

  const sceneBg = dark
    ? "linear-gradient(157deg, #1c1c20 0%, #0b0b0d 100%)"
    : "linear-gradient(155deg, #ffffff 0%, #f1efec 100%)";

  return (
    <AbsoluteFill style={{ background: sceneBg, ...interVars, fontFamily: "var(--font-inter)", overflow: "hidden" }}>
      {landscape ? (
        <div style={{ position: "absolute", inset: 0 }}>
          <div style={{ position: "absolute", left: pad, top: 0, bottom: 0, width: "42%", display: "flex", flexDirection: "column", justifyContent: "center" }}>{copy}</div>
          {phone}
        </div>
      ) : (
        <div style={{ position: "absolute", inset: 0 }}>
          {phone}
          <div style={{ position: "absolute", top: pad, left: pad, right: pad }}>{copy}</div>
        </div>
      )}

      {brief.brandMark && landscape ? (
        <div style={{ position: "absolute", top: Math.round(phoneTop), left: HS(0.07), opacity: 0.45 * phoneIn }}>
          <Img src={`${baseUrl}/asset/shared/logos/hububb-wordmark.svg`} style={{ height: HS(0.052), filter: dark ? "invert(1)" : "none" }} />
        </div>
      ) : brief.brandMark && !showcase ? (
        <div style={{ position: "absolute", bottom: HS(0.03), left: 0, right: 0, display: "flex", justifyContent: "center", opacity: 0.5 * phoneIn }}>
          <Img src={`${baseUrl}/asset/shared/logos/hububb-wordmark.svg`} style={{ height: HS(0.022), filter: dark ? "invert(1)" : "none" }} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
}
