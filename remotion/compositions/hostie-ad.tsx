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

// Animated rebuild of the shipped Hostie hero on hububb-web's Host page
// (src/sections/marketing-v2/hero-agent-phone + _hero-agent/phone + checkin-visual).
// The real UI is reproduced 1:1 — same copy, structure, styles, and assets — then
// animated with Remotion frame math (the web's framer-motion / CSS keyframes are
// not available here). Colours come from an explicit palette keyed on the variant
// so every render is deterministic; layout uses the same tokens as the real UI.
//
// The chat microcopy, the listing name/rating (4.92), the guest name, and the CTA
// label are reproduced UI constants — they deliberately live here, not in
// brief.copy (which carries only the QA-gated headline + subhead).

type Palette = {
  bg: string; // page + phone screen + conversation sheet
  subtle: string; // header surface, grey reply bubble, logo ring
  card: string; // raised wells (listing pill, status dot backing, nav chips)
  border: string; // hairlines
  t1: string; // primary text
  t2: string; // secondary text
  t3: string; // tertiary text
  muted: string; // meta text
  fg: string; // CTA pill fill
  onFg: string; // CTA pill text
  success: string; // "checked in" + green pulse
  panelShadow: string;
  ring: string; // phone hairline ring
};

function palette(dark: boolean): Palette {
  return dark
    ? {
        bg: "#111111",
        subtle: "#222222",
        card: "#1f1f1f",
        border: "#2d2d2d",
        t1: "#f2f2f2",
        t2: "#cccccc",
        t3: "#999999",
        muted: "#808080",
        fg: "#f2f2f2",
        onFg: "#111111",
        success: "#b2ffea",
        panelShadow: "rgba(0,0,0,0.7)",
        ring: "rgba(255,255,255,0.10)",
      }
    : {
        bg: "#ffffff",
        subtle: "#f2f2f2",
        card: "#ffffff",
        border: "#e6e6e6",
        t1: "#1a1a1a",
        t2: "#333333",
        t3: "#666666",
        muted: "#808080",
        fg: "#1a1a1a",
        onFg: "#ffffff",
        success: "#00b280",
        panelShadow: "rgba(0,0,0,0.5)",
        ring: "rgba(0,0,0,0.06)",
      };
}

// Fixed brand marks — identical in both themes. Airbnb bélo copied verbatim from
// hububb-web _hero-agent/airbnb-mark.tsx.
function AirbnbMark({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 64 64" style={{ width: size, height: size, display: "block" }} aria-hidden>
      <path
        fillRule="evenodd"
        fill="#ff5a5f"
        d="M60.9 45.487l-.966-2.305-1.475-3.27-.062-.062a661.83 661.83 0 0 0-14.15-28.957l-.198-.384-1.524-3.073a18.4 18.4 0 0 0-2.305-3.52A10.35 10.35 0 0 0 32.027 0a10.76 10.76 0 0 0-8.203 3.84 22.1 22.1 0 0 0-2.305 3.52l-1.735 3.395c-4.956 9.615-9.74 19.342-14.163 28.957l-.062.124c-.384 1.053-.892 2.13-1.413 3.284-.322.702-.644 1.47-.966 2.305a14.4 14.4 0 0 0-.768 6.914 13.63 13.63 0 0 0 8.327 10.631 13.16 13.16 0 0 0 5.192 1.028 14.57 14.57 0 0 0 1.66-.124 16.93 16.93 0 0 0 6.406-2.18 32.44 32.44 0 0 0 7.943-6.666 33.62 33.62 0 0 0 7.943 6.666 16.92 16.92 0 0 0 6.406 2.18c.55.073 1.105.114 1.66.124 1.783.018 3.55-.332 5.192-1.028a13.63 13.63 0 0 0 8.327-10.631 12.11 12.11 0 0 0-.582-6.852zM32.026 48.82c-3.457-4.362-5.7-8.45-6.468-11.92-.314-1.277-.38-2.6-.198-3.903.127-.965.48-1.886 1.028-2.7a6.79 6.79 0 0 1 5.638-2.825c2.236-.086 4.362.974 5.638 2.813a6.17 6.17 0 0 1 1.028 2.69 10.3 10.3 0 0 1-.198 3.903c-.768 3.395-3 7.435-6.468 11.92zm25.562 3c-.5 3.337-2.7 6.166-5.836 7.435a9.7 9.7 0 0 1-4.857.706 12.6 12.6 0 0 1-4.87-1.66 29.91 29.91 0 0 1-7.298-6.195c4.225-5.192 6.8-9.913 7.757-14.163a16.11 16.11 0 0 0 .322-5.452c-.238-1.567-.832-3.06-1.735-4.362-2.062-2.942-5.453-4.666-9.045-4.597-3.572-.046-6.942 1.65-9.033 4.547-.903 1.303-1.497 2.794-1.735 4.362a13.31 13.31 0 0 0 .322 5.452c.966 4.225 3.593 9.033 7.757 14.225a28.79 28.79 0 0 1-7.298 6.195 12.6 12.6 0 0 1-4.882 1.71 10.26 10.26 0 0 1-4.87-.644C9.16 58.12 6.94 55.292 6.45 51.954a10.61 10.61 0 0 1 .582-4.956c.198-.644.508-1.24.83-2.044.446-1.028.966-2.12 1.475-3.2l.062-.124c4.424-9.54 9.157-19.28 14.1-28.772l.186-.458 1.536-2.95a14.05 14.05 0 0 1 1.846-2.838 6.73 6.73 0 0 1 10.247 0 13.87 13.87 0 0 1 1.747 2.813l1.536 2.95.186.384c4.87 9.553 9.628 19.28 14.04 28.834v.062c.508 1.028.966 2.18 1.475 3.2.322.768.644 1.413.83 2.044a10.81 10.81 0 0 1 .446 4.956z"
      />
    </svg>
  );
}

function StarMark({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size, display: "block" }} aria-hidden>
      <path
        fill="#f59e0b"
        d="M12 2.2l2.82 6.02 6.63.62-4.99 4.4 1.47 6.5L12 16.9l-5.93 3.44 1.47-6.5-4.99-4.4 6.63-.62z"
      />
    </svg>
  );
}

// Verified badge — a blue disc with a white tick (a clean stand-in for Phosphor's
// scalloped SealCheck, which we don't pull into the render bundle).
function SealCheckMark({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size, display: "block" }} aria-hidden>
      <circle cx="12" cy="12" r="11" fill="#3b82f6" />
      <path
        d="M7 12.4l3.1 3.1L17 8.6"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// The Hostie orb: a fixed dark radial with an inverted white glyph and a soft,
// frame-driven inner highlight (replaces the web's `hostie-pulse` CSS keyframe).
function HostieAvatarOrb({
  size,
  baseUrl,
  breathe,
}: {
  size: number;
  baseUrl: string;
  breathe: number;
}) {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "9999px",
        overflow: "hidden",
        background: "radial-gradient(120% 120% at 30% 22%, #3a3a3a 0%, #0a0a0a 62%)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.10)",
        flexShrink: 0,
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "9999px",
          background:
            "radial-gradient(55% 55% at 34% 28%, rgba(255,255,255,0.5) 0%, transparent 72%)",
          opacity: breathe,
        }}
      />
      <Img
        src={`${baseUrl}/asset/host/brand/hostie-avatar.svg`}
        alt=""
        style={{ width: "56%", height: "56%", objectFit: "contain", filter: "invert(1)" }}
      />
    </span>
  );
}

function ChannelsBadge({
  unit,
  p,
  baseUrl,
}: {
  unit: number;
  p: Palette;
  baseUrl: string;
}) {
  const chip = unit * 1.55;
  const overlap = -(unit * 0.32);
  const ringW = Math.max(1.5, unit * 0.16);
  const well = (src?: string, label?: string) => (
    <span
      key={label}
      style={{
        position: "relative",
        display: "block",
        width: chip,
        height: chip,
        marginLeft: label === "airbnb" ? 0 : overlap,
        borderRadius: "9999px",
        overflow: "hidden",
        background: "#ffffff",
        boxShadow: `0 0 0 ${ringW}px ${p.border}`,
      }}
    >
      {src ? (
        <Img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : null}
    </span>
  );
  return (
    <div
      style={{
        display: "inline-flex",
        width: "fit-content",
        alignItems: "center",
        gap: unit * 0.65,
        borderRadius: "9999px",
        background: p.subtle,
        padding: `${unit * 0.42}px ${unit * 0.7}px ${unit * 0.42}px ${unit * 1.1}px`,
      }}
    >
      <span style={{ fontSize: unit * 0.92, fontWeight: 500, color: p.t2 }}>Connected to</span>
      <span style={{ display: "flex", alignItems: "center" }}>
        {well(`${baseUrl}/asset/host/channels/airbnb.png`, "airbnb")}
        {well(`${baseUrl}/asset/host/channels/booking.png`, "booking")}
        {well(`${baseUrl}/asset/host/channels/vrbo.png`, "vrbo")}
        <span
          style={{
            display: "flex",
            width: chip,
            height: chip,
            marginLeft: overlap,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "9999px",
            background: "#ffffff",
            color: "#333333",
            fontSize: unit * 0.62,
            fontWeight: 600,
            boxShadow: `0 0 0 ${ringW}px ${p.border}`,
          }}
        >
          +3
        </span>
      </span>
    </div>
  );
}

function CtaPill({
  height,
  textSize,
  iconSize,
  p,
  glint,
}: {
  height: number;
  textSize: number;
  iconSize: number;
  p: Palette;
  glint: number;
}) {
  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: height * 0.2,
        height,
        paddingLeft: height * 0.42,
        paddingRight: height * 0.5,
        borderRadius: "9999px",
        background: p.fg,
        color: p.onFg,
        fontSize: textSize,
        fontWeight: 600,
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(0,0,0,0.10)",
      }}
    >
      <AirbnbMark size={iconSize} />
      <span>Connect your Airbnb</span>
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${glint}%`,
          width: height * 1.2,
          transform: "skewX(-18deg)",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)",
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// The Hostie phone: abstract rounded panel (the shipped PhoneShowcase), header on
// the subtle surface, and a white conversation sheet holding the grey reply bubble
// and the proactive check-in card. `k` scales the web's exact px (344px device).
function PhoneChat({
  phoneW,
  phoneH,
  p,
  baseUrl,
  frame,
  fps,
  bubbleStyle,
  cardStyle,
}: {
  phoneW: number;
  phoneH: number;
  p: Palette;
  baseUrl: string;
  frame: number;
  fps: number;
  bubbleStyle: React.CSSProperties;
  cardStyle: React.CSSProperties;
}) {
  const k = phoneW / 344;
  const radius = Math.round(phoneW * 0.135);

  // Green ping — reproduces Tailwind's `animate-ping` (scale 1->2.2, fade out),
  // looping once the check-in card is in.
  const pingActive = frame >= 88;
  const period = fps * 1.1;
  const tt = pingActive ? ((frame - 88) % period) / period : 0;
  const pingScale = pingActive ? interpolate(tt, [0, 1], [1, 2.2]) : 1;
  const pingOpacity = pingActive ? interpolate(tt, [0, 1], [0.55, 0]) : 0;

  const navChip = (child: React.ReactNode) => (
    <span
      style={{
        display: "flex",
        width: 32 * k,
        height: 32 * k,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "9999px",
        background: p.card,
        color: p.t2,
        boxShadow: `0 4px 16px #2626260d, 0 0 0 1px ${p.border}`,
      }}
    >
      {child}
    </span>
  );

  return (
    <div
      style={{
        width: phoneW,
        height: phoneH,
        borderRadius: radius,
        overflow: "hidden",
        background: p.bg,
        boxShadow: `inset 0 0 0 1px ${p.ring}, 0 ${40 * k}px ${80 * k}px ${-32 * k}px ${p.panelShadow}`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: p.subtle }}>
        {/* Header */}
        <div style={{ padding: `${24 * k}px ${20 * k}px ${16 * k}px` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {navChip(
              <svg viewBox="0 0 16 16" style={{ width: 16 * k, height: 16 * k }} aria-hidden>
                <path
                  d="M10 3l-5 5 5 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>,
            )}
            <HostieAvatarOrb
              size={46 * k}
              baseUrl={baseUrl}
              breathe={0.5 + 0.32 * Math.sin((frame / fps) * Math.PI * 0.9)}
            />
            {navChip(
              <svg viewBox="0 0 20 20" style={{ width: 18 * k, height: 18 * k }} aria-hidden>
                <g fill="currentColor">
                  <circle cx="4" cy="10" r="1.6" />
                  <circle cx="10" cy="10" r="1.6" />
                  <circle cx="16" cy="10" r="1.6" />
                </g>
              </svg>,
            )}
          </div>
          <div
            style={{
              marginTop: 8 * k,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <p
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4 * k,
                fontSize: 13 * k,
                fontWeight: 600,
                color: p.t1,
              }}
            >
              Hostie AI
              <SealCheckMark size={14 * k} />
            </p>
            <div
              style={{
                marginTop: 6 * k,
                display: "flex",
                maxWidth: "90%",
                alignItems: "center",
                gap: 6 * k,
                borderRadius: "9999px",
                background: p.card,
                padding: `${4 * k}px ${10 * k}px ${4 * k}px ${4 * k}px`,
                boxShadow: `0 4px 16px #2626260d, 0 0 0 1px ${p.border}`,
              }}
            >
              <span
                style={{
                  position: "relative",
                  width: 20 * k,
                  height: 20 * k,
                  flexShrink: 0,
                  overflow: "hidden",
                  borderRadius: "9999px",
                  background: p.subtle,
                }}
              >
                <Img
                  src={`${baseUrl}/asset/host/photos/listing-de-beauvoir.jpg`}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </span>
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontSize: 12 * k,
                  fontWeight: 500,
                  color: p.t1,
                }}
              >
                Bright garden flat in De Beauvoir
              </span>
              <span
                style={{
                  display: "flex",
                  flexShrink: 0,
                  alignItems: "center",
                  gap: 2 * k,
                  fontSize: 12 * k,
                  color: p.t2,
                }}
              >
                <StarMark size={11 * k} />
                4.92
              </span>
            </div>
          </div>
        </div>

        {/* Conversation sheet */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            borderTopLeftRadius: 28 * k,
            borderTopRightRadius: 28 * k,
            background: p.bg,
            padding: `${20 * k}px ${20 * k}px 0`,
            boxShadow: "0 -8px 20px -14px rgba(0,0,0,0.18)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 * k }}>
            {/* Hostie reply — grey left bubble */}
            <div
              style={{
                maxWidth: "88%",
                borderRadius: 16 * k,
                borderBottomLeftRadius: 6 * k,
                background: p.subtle,
                padding: `${6 * k}px ${12 * k}px`,
                fontSize: 13 * k,
                lineHeight: 1.5,
                color: p.t1,
                ...bubbleStyle,
              }}
            >
              Maya checked in and opened the guest portal. She has the door code, wifi, and the
              local guide.
            </div>

            {/* Proactive check-in card */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 * k, ...cardStyle }}>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    display: "block",
                    width: 56 * k,
                    height: 56 * k,
                    flexShrink: 0,
                    overflow: "hidden",
                    borderRadius: 16 * k,
                    background: p.subtle,
                  }}
                >
                  <Img
                    src={`${baseUrl}/asset/host/photos/guest-maya.jpg`}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </span>
                <span
                  style={{
                    position: "absolute",
                    right: -(4 * k),
                    bottom: -(4 * k),
                    display: "flex",
                    width: 16 * k,
                    height: 16 * k,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "9999px",
                    background: p.card,
                  }}
                >
                  <span style={{ position: "relative", display: "flex", width: 10 * k, height: 10 * k }}>
                    <span
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "9999px",
                        background: p.success,
                        opacity: pingOpacity,
                        transform: `scale(${pingScale})`,
                      }}
                    />
                    <span
                      style={{
                        position: "relative",
                        width: 10 * k,
                        height: 10 * k,
                        borderRadius: "9999px",
                        background: p.success,
                      }}
                    />
                  </span>
                </span>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0 }}>
                  <span style={{ fontSize: 16 * k, fontWeight: 600, color: p.t1 }}>Maya R.</span>
                  <span
                    style={{
                      whiteSpace: "nowrap",
                      fontSize: 12 * k,
                      fontWeight: 500,
                      color: p.success,
                    }}
                  >
                    Checked in · just now
                  </span>
                </p>
                <p style={{ marginTop: 2 * k, fontSize: 14 * k, color: p.t3 }}>
                  Opened the guest portal
                </p>
                <p style={{ marginTop: 8 * k, fontSize: 12 * k, color: p.muted }}>
                  Door code  ·  Wifi  ·  Local guide
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HostieAd({ brief, baseUrl }: VideoInputProps) {
  const frame = useCurrentFrame();
  const { fps, width: w, height: h, durationInFrames } = useVideoConfig();
  const c = brief.copy ?? {};
  const dark = brief.variant === "dark";
  const p = palette(dark);

  const headline = c.headline ?? "Your autonomous AI host";
  const subhead =
    c.subhead ??
    "The general AI host that runs your property end to end. Bookings, guests, cleaning, and pricing, all handled while you watch.";
  // Two-tone: the first sentence is primary, the remainder muted (the web treatment).
  const [lead, ...rest] = subhead.split(/(?<=\.)\s+/);

  const aspect = w / h;
  const min = Math.min(w, h);
  const landscape = w > h; // 16:9
  const square = Math.abs(aspect - 1) < 0.06; // 1:1
  const tall = aspect <= 0.62; // 9:16

  const pad = Math.round(min * 0.07);

  // Phone width per aspect (drives the internal scale).
  const phoneW = landscape
    ? Math.round(h * 0.6)
    : square
      ? Math.round(w * 0.6)
      : tall
        ? Math.round(w * 0.86)
        : Math.round(w * 0.66); // 4:5
  const phoneH = Math.round(phoneW * 1.9);

  // Outer copy sizing.
  const headSize = landscape
    ? Math.round(min * 0.08)
    : square
      ? Math.round(min * 0.066)
      : tall
        ? Math.round(min * 0.075)
        : Math.round(min * 0.07); // 4:5
  const subSize = landscape ? Math.round(w * 0.02) : Math.round(w * 0.029);
  const badgeUnit = Math.round(headSize * 0.26);
  const ctaH = Math.round(min * 0.062);
  const ctaText = Math.round(w * (landscape ? 0.018 : 0.024));
  const ctaIcon = Math.round(ctaText * 1.15);
  const copyGap = Math.round(headSize * 0.34);

  // Motion.
  const enter = (delayFrames: number) => {
    const s = spring({ frame: frame - delayFrames, fps, config: { damping: 200 } });
    return {
      opacity: s,
      transform: `translateY(${interpolate(s, [0, 1], [Math.round(h * 0.015), 0])}px)`,
    };
  };

  const phoneIn = spring({ frame: frame - 20, fps, config: { damping: 18, mass: 0.9 } });
  const drift = interpolate(frame, [fps * 2, durationInFrames], [0, -Math.round(h * 0.01)], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const phoneStyle: React.CSSProperties = {
    opacity: phoneIn,
    transform: `translateY(${interpolate(phoneIn, [0, 1], [Math.round(h * 0.06), 0]) + drift}px)`,
  };

  const bubbleStyle = enter(54);
  const cardIn = spring({ frame: frame - 78, fps, config: { damping: 22, mass: 0.8 } });
  const cardStyle: React.CSSProperties = {
    opacity: cardIn,
    transform: `translateY(${interpolate(cardIn, [0, 1], [Math.round((phoneW / 344) * 20), 0])}px)`,
  };

  // CTA beam glint — two subtle L->R passes.
  const glint =
    frame < 180
      ? interpolate(frame, [120, 156], [-40, 140], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : interpolate(frame, [210, 246], [-40, 140], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const outro = interpolate(
    frame,
    [durationInFrames - Math.round(fps * 0.5), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const copy = (
    <div style={{ display: "flex", flexDirection: "column", gap: copyGap }}>
      <div style={enter(3)}>
        <ChannelsBadge unit={badgeUnit} p={p} baseUrl={baseUrl} />
      </div>
      <h1
        style={{
          margin: 0,
          fontSize: headSize,
          lineHeight: 1.04,
          letterSpacing: "-0.02em",
          fontWeight: 600,
          color: p.t1,
          textWrap: "balance",
          maxWidth: landscape ? "100%" : w * 0.9,
          ...enter(8),
        }}
      >
        {headline}
      </h1>
      {!square ? (
        <p
          style={{
            margin: 0,
            fontSize: subSize,
            lineHeight: 1.4,
            maxWidth: landscape ? "100%" : w * 0.82,
            ...enter(15),
          }}
        >
          <span style={{ color: p.t1 }}>{lead} </span>
          <span style={{ color: p.t3 }}>{rest.join(" ")}</span>
        </p>
      ) : (
        <p style={{ margin: 0, fontSize: subSize, lineHeight: 1.4, color: p.t1, maxWidth: w * 0.74, ...enter(15) }}>
          {lead}
        </p>
      )}
      <div style={enter(22)}>
        <CtaPill height={ctaH} textSize={ctaText} iconSize={ctaIcon} p={p} glint={glint} />
      </div>
    </div>
  );

  const phone = (
    <div style={phoneStyle}>
      <PhoneChat
        phoneW={phoneW}
        phoneH={phoneH}
        p={p}
        baseUrl={baseUrl}
        frame={frame}
        fps={fps}
        bubbleStyle={bubbleStyle}
        cardStyle={cardStyle}
      />
    </div>
  );

  return (
    <AbsoluteFill style={{ background: p.bg, ...interVars, fontFamily: "var(--font-inter)" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: landscape ? "row" : "column",
          alignItems: landscape ? "center" : "stretch",
          padding: pad,
          gap: pad,
          opacity: outro,
        }}
      >
        {landscape ? (
          <>
            <div style={{ width: "44%", flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {copy}
            </div>
            <div
              style={{
                position: "relative",
                flex: 1,
                minWidth: 0,
                alignSelf: "stretch",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                overflow: "hidden",
              }}
            >
              {phone}
            </div>
          </>
        ) : (
          <>
            {copy}
            <div
              style={{
                position: "relative",
                flex: 1,
                minHeight: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                overflow: "hidden",
              }}
            >
              {phone}
            </div>
          </>
        )}
      </div>
    </AbsoluteFill>
  );
}
