import {
  AbsoluteFill,
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
// The built-in screen is a guest chat (`screen: "chat"`, the default) modelled on
// the hububb.com/hosts hero — guest identity header + listing chip, a white
// rounded sheet, guest light bubbles and dark Hostie replies tagged "Answered by
// Hostie AI". To animate other app UI, add a new <XScreen> and a `screen` case;
// the frame, scene, dark mode, rotation and CTA are all reusable as-is.
//
// variant "dark" = a dark scene (background + headline/CTA) with the phone kept
// light. When brief.rotate is set it flips between brief.conversations, then the
// headline crossfades into brief.cta.button.
//
// Surfaces + colours are taken verbatim from the design-system light tokens.
// Chat microcopy, guest names and listings are reproduced UI constants; they
// live here, not in brief.copy (which carries only the QA-gated headline).

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

export function PhoneMockupUi({ brief, baseUrl }: VideoInputProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h, durationInFrames } = useVideoConfig();
  const c = brief.copy ?? {};
  const cta = (brief as { cta?: { button?: string } }).cta;
  const rotate = Boolean((brief as { rotate?: boolean }).rotate);
  // Which app UI plays on the phone screen. Only "chat" ships today; the shell
  // (frame, scene, dark mode, headline/CTA) is screen-agnostic.
  const screen = (brief as { screen?: string }).screen ?? "chat";
  // Dark = a dark scene (background + headline/CTA) with the phone kept light.
  const dark = brief.variant === "dark";
  // Conversations are data-driven: a brief may supply its own guest exchanges,
  // otherwise the built-in defaults play. This is what makes it a template.
  const briefConvos = (brief as { conversations?: Conversation[] }).conversations;
  const convos = Array.isArray(briefConvos) && briefConvos.length ? briefConvos : CONVERSATIONS;

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
    ? Math.round(h * 0.088)
    : square
      ? Math.round(w * 0.082)
      : tall
        ? Math.round(w * 0.074)
        : Math.round(w * 0.08);
  const textZoneH = Math.round(headSize * 1.08 * 2);

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
    phoneTop = pad + textZoneH + HS(0.035);
  } else {
    const areaTop = pad + textZoneH + HS(0.03);
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
  const count = rotate ? convos.length : 1;
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
    lineHeight: 1.05,
    letterSpacing: "-0.02em",
    fontWeight: 600,
    color: sceneInk,
    textWrap: "balance",
  };

  const copy = (
    <div style={{ position: "relative", height: textZoneH, textAlign: alignText }}>
      <h1 style={{ ...headStyle, position: "absolute", top: 0, left: 0, right: 0, opacity: he * (1 - swap), transform: `translateY(${headEnterDy - Math.round(headSize * 0.12) * swap}px)` }}>
        {headline}
      </h1>
      {cta?.button ? (
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: landscape ? "flex-start" : "center", opacity: swap, transform: `translateY(${Math.round(headSize * 0.14) * (1 - swap)}px)` }}>
          <span style={{ ...headStyle }}>{cta.button}</span>
        </div>
      ) : null}
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
        {/* The animatable phone screen. Only "chat" ships today; add cases here.
            Guests swap by dissolving: the next fades in on top of the current. */}
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
