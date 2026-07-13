import type { Brief } from "@/lib/creatives";
import { CreativeCanvas, BrandMark, ProofChip } from "./canvas";

// Feature card: image-card's text treatment, but the image area is a neutral
// SURFACE PANEL (soft mono gradient) with a phone mockup floating inside it.
// Product-led feature ads: the screenshot is the focal point, the surface and
// device shadow do the polish. Light or dark. The image is a supplied mockup or
// product screenshot.
export function FeatureCardTemplate({
  brief,
  w,
  h,
}: {
  brief: Brief;
  w: number;
  h: number;
}) {
  const c = brief.copy;
  const dark = brief.variant === "dark";
  const landscape = w > h;
  const pad = Math.round(Math.min(w, h) * 0.07);
  const eye = Math.round(w * 0.022);
  const head = Math.round(Math.min(w, h * 1.05) * (landscape ? 0.058 : 0.066));
  const panelPad = Math.round(Math.min(w, h) * 0.06);
  // 1x1 and 4x5: the phone goes large and bleeds off the bottom of the panel
  // (like the website feature cards). 9x16 and 16x9 keep the contained phone.
  const aspect = w / h;
  const clip = aspect >= 0.7 && aspect <= 1.3;
  const clipTop = Math.round(Math.min(w, h) * 0.03);
  // Height-driven, not width-driven: mockups share one intrinsic aspect ratio
  // (roughly 0.487, an iPhone photo), but sizing by a fixed width% against that
  // meant a couple of pixels of extra height overflowed the panel's
  // overflow-hidden and clipped the device down to a sliver. Sizing by height
  // keeps the same generous, consistent fraction of the device visible
  // regardless of the source image's exact resolution. Slightly over 100% so
  // the device bleeds off the panel bottom like the website feature cards.
  const clipHeight = "102%";

  const bg = dark ? "bg-mono-20 text-mono-1" : "bg-mono-1 text-mono-21";
  const eyeColor = dark ? "text-mono-5" : "text-mono-11";
  const accentBg = dark ? "bg-mono-5" : "bg-mono-11";
  const frame = dark ? "border-mono-18" : "border-mono-4";
  const surface = dark
    ? "radial-gradient(125% 120% at 50% 0%, var(--color-mono-19) 0%, var(--color-mono-21) 100%)"
    : "radial-gradient(125% 120% at 50% 0%, var(--color-mono-2) 0%, var(--color-mono-4) 100%)";
  // drop-shadow follows the device's alpha shape (not a rectangle), so framed
  // phones and rounded screenshots both float cleanly on the surface.
  const deviceShadow = dark
    ? "drop-shadow(0 20px 32px rgba(0,0,0,0.55))"
    : "drop-shadow(0 18px 30px rgba(0,0,0,0.16))";
  // Lift the panel off the page with a soft shadow, and catch a thread of light
  // along its top edge: the small touches that read as crafted, not flat.
  const panelShadow = dark
    ? "0 1px 2px rgba(0,0,0,0.5), 0 24px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)"
    : "0 1px 2px rgba(38,38,38,0.05), 0 22px 44px rgba(38,38,38,0.09), inset 0 1px 0 rgba(255,255,255,0.85)";

  const mark = Math.round(w * 0.03);
  const hasKicker = brief.brandMark || Boolean(c.eyebrow);

  const text = (
    <div className="flex flex-col">
      {hasKicker ? (
        <div className="flex items-center" style={{ gap: Math.round(mark * 0.5) }}>
          {brief.brandMark ? (
            <BrandMark height={mark} invert={dark} />
          ) : (
            <span
              className={`${accentBg} rounded-full`}
              style={{ width: Math.round(eye * 1.5), height: Math.max(2, Math.round(h * 0.0026)) }}
            />
          )}
          {c.eyebrow ? (
            <span
              className={`font-mono ${eyeColor}`}
              style={{ fontSize: eye, letterSpacing: "0.01em" }}
            >
              {c.eyebrow}
            </span>
          ) : null}
        </div>
      ) : null}
      <h1
        className="font-semibold tracking-tight text-balance"
        style={{
          fontSize: head,
          lineHeight: 1.05,
          marginTop: hasKicker ? Math.round(head * 0.24) : 0,
        }}
      >
        {c.headline}
      </h1>
      {c.subhead ? (
        <p
          className={dark ? "text-mono-4" : "text-mono-11"}
          style={{
            fontSize: Math.round(w * 0.026),
            lineHeight: 1.35,
            marginTop: Math.round(head * 0.3),
            maxWidth: landscape ? "100%" : w * 0.82,
          }}
        >
          {c.subhead}
        </p>
      ) : null}
      {c.cta || c.proof ? (
        <div
          className="flex flex-wrap items-center"
          style={{ gap: Math.round(eye * 0.9), marginTop: Math.round(head * 0.42) }}
        >
          {c.cta ? (
            <div
              className={dark ? "bg-mono-1 text-mono-21" : "bg-mono-21 text-mono-1"}
              style={{
                display: "inline-flex",
                width: "fit-content",
                alignItems: "center",
                gap: Math.round(Math.min(w, h) * 0.014),
                height: Math.round(Math.min(w, h) * 0.068),
                paddingLeft: Math.round(Math.min(w, h) * (c.ctaIcon ? 0.034 : 0.04)),
                paddingRight: Math.round(Math.min(w, h) * 0.04),
                borderRadius: 9999,
                fontWeight: 600,
                fontSize: Math.round(w * 0.022),
              }}
            >
              {c.ctaIcon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.ctaIcon}
                  alt=""
                  style={{
                    height: Math.round(Math.min(w, h) * 0.068 * 0.42),
                    width: "auto",
                  }}
                />
              ) : null}
              {c.cta}
            </div>
          ) : null}
          {c.proof ? (
            <ProofChip text={c.proof} fontSize={Math.round(eye * 0.92)} invert={dark} />
          ) : null}
        </div>
      ) : null}
    </div>
  );

  // Optional lifestyle backdrop inside the panel, dimmed so the floating
  // device stays the focal point.
  const panelOverlay = dark
    ? "linear-gradient(180deg, rgba(8,8,8,0.42) 0%, rgba(8,8,8,0.62) 100%)"
    : "linear-gradient(180deg, rgba(250,250,250,0.5) 0%, rgba(250,250,250,0.72) 100%)";

  const panel = (
    <div
      className={`relative flex min-h-0 flex-1 justify-center overflow-hidden rounded-3xl border ${frame} ${clip ? "items-start" : "items-center"}`}
      style={{ background: surface, padding: clip ? 0 : panelPad, boxShadow: panelShadow }}
    >
      {brief.panelImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brief.panelImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: panelOverlay }} />
        </>
      ) : null}
      {brief.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brief.image}
          alt={c.headline ?? ""}
          className={clip ? "relative" : "relative max-h-full max-w-full rounded-2xl object-contain"}
          style={
            clip
              ? { height: clipHeight, width: "auto", marginTop: clipTop, filter: deviceShadow }
              : { filter: deviceShadow }
          }
        />
      ) : (
        <span className="font-mono text-mono-11" style={{ fontSize: eye }}>
          supply a screenshot
        </span>
      )}
    </div>
  );

  return (
    <CreativeCanvas w={w} h={h} className={bg}>
      <div
        className={`absolute inset-0 flex ${landscape ? "flex-row items-stretch" : "flex-col"}`}
        style={{ padding: pad, gap: pad }}
      >
        {landscape ? (
          <>
            <div className="flex w-[42%] shrink-0 flex-col justify-center">{text}</div>
            {panel}
          </>
        ) : (
          <>
            {text}
            {panel}
          </>
        )}
      </div>
    </CreativeCanvas>
  );
}
