// Shared pieces for the @wearehububb launch templates. Monochrome, dark,
// editorial: a near-black canvas with a soft radial glow and a faint off-canvas
// ring for depth (the Revolut register), plus one restrained warm accent used
// at most once per creative.

// The single warm accent for the parent brand. Used sparingly (a small dot),
// never as a fill. Reads as coral on near-black.
export const LAUNCH_ACCENT = "#ff7a59";

// The app layer emits only part of the design system's neutral ramp as mono-*
// utilities (steps 1-5, 11, 17-21). The launch templates lean on three greys
// from the un-emitted middle of the ramp for their editorial hierarchy on
// near-black, so those are pinned here by hex with their token names
// (color.neutral.*) rather than as mono-* classes that resolve to nothing.
export const LAUNCH_INK = {
  soft: "#b3b3b3", // color.neutral.7: index numerals
  muted: "#a6a6a6", // color.neutral.8: handle, eyebrow label
  body: "#999999", // color.neutral.9: subheads, row copy, hairline
};

// Full-bleed dark backdrop. `glow` positions the radial highlight (0..1 of the
// canvas) so each template can steer the light behind its focal point.
export function LaunchBackdrop({
  glowX = 0.5,
  glowY = 0.32,
}: {
  glowX?: number;
  glowY?: number;
}) {
  return (
    <div className="absolute inset-0 bg-mono-20" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 90% at ${glowX * 100}% ${
            glowY * 100
          }%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 32%, rgba(255,255,255,0) 62%)`,
        }}
      />
      <div
        className="absolute rounded-full border border-mono-18"
        style={{
          width: "78%",
          aspectRatio: "1 / 1",
          right: "-22%",
          bottom: "-30%",
          opacity: 0.5,
        }}
      />
      <div
        className="absolute rounded-full border border-mono-18"
        style={{
          width: "52%",
          aspectRatio: "1 / 1",
          right: "-8%",
          bottom: "-14%",
          opacity: 0.35,
        }}
      />
    </div>
  );
}

// A quiet index eyebrow: a short hairline, a small mono label, and a single
// warm accent dot (the one spot of colour).
export function LaunchEyebrow({
  label,
  size,
  accent = true,
}: {
  label: string;
  size: number;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center" style={{ gap: Math.round(size * 0.7) }}>
      <span
        style={{
          width: Math.round(size * 1.8),
          height: Math.max(1, Math.round(size * 0.07)),
          backgroundColor: LAUNCH_INK.body,
        }}
      />
      <span
        className="font-mono"
        style={{ fontSize: size, letterSpacing: "0.06em", color: LAUNCH_INK.muted }}
      >
        {label}
      </span>
      {accent ? (
        <span
          className="rounded-full"
          style={{
            width: Math.round(size * 0.42),
            height: Math.round(size * 0.42),
            backgroundColor: LAUNCH_ACCENT,
          }}
        />
      ) : null}
    </div>
  );
}
