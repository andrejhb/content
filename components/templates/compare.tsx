import type { Brief } from "@/lib/creatives";
import { CreativeCanvas, BrandMark, ProofChip } from "./canvas";

// Compare: the "old way vs with Hububb" two-column checklist. Light: muted
// left panel with crosses, brand-ink right panel with checks. Dark variant
// flips the hierarchy: near-black canvas (optionally over a dimmed lifestyle
// photo via brief.image), glassy muted left panel, white right panel, white
// CTA pill. Copy comes from copy.compare { leftTitle, rightTitle, left[],
// right[], footer }.

function MarkIcon({ kind, size }: { kind: "check" | "cross"; size: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      {kind === "check" ? <path d="M5 12.5l4.2 4.2L19 7" /> : <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />}
    </svg>
  );
}

export function CompareTemplate({
  brief,
  w,
  h,
}: {
  brief: Brief;
  w: number;
  h: number;
}) {
  const c = brief.copy;
  const cmp = c.compare ?? { left: [], right: [] };
  const dark = brief.variant === "dark";
  const landscape = w > h;
  const tall = w / h <= 0.6;
  const min = Math.min(w, h);
  const pad = Math.round(min * 0.07);
  const eye = Math.round(w * 0.022);
  const head = Math.round(Math.min(w, h * 1.05) * (landscape ? 0.052 : tall ? 0.07 : 0.06));
  const mark = Math.round(w * 0.037);
  // Accent marks from the design-system token scales (tokens.json). The app
  // layer only ships mono utilities, so the accent hexes are pinned here with
  // their token names.
  const crossColor = dark ? "#ff3333" : "#cc0000"; // color.red.9 / color.red.13
  const checkColor = dark ? "#00b280" : "#00cc93"; // color.support.green / color.green.13
  const item = Math.round(w * (tall ? 0.026 : 0.0235));
  const icon = Math.round(item * 1.05);
  const colPad = Math.round(w * 0.045);
  const colGap = Math.round(w * 0.03);
  const rowGap = Math.round(item * 1.05);

  const column = (
    title: string | undefined,
    items: string[],
    kind: "check" | "cross",
  ) => {
    const winner = kind === "check";
    // Light: muted grey vs brand ink. Dark: glassy muted vs solid white.
    const panelClass = dark
      ? winner
        ? "bg-mono-1 text-mono-21"
        : ""
      : winner
        ? "border-mono-21 bg-mono-21 text-mono-1"
        : "border-mono-4 bg-mono-2 text-mono-12";
    const panelStyle = dark
      ? winner
        ? { boxShadow: "0 26px 52px rgba(0,0,0,0.5)" }
        : {
            background: "rgba(255,255,255,0.055)",
            border: "1px solid rgba(255,255,255,0.13)",
            color: "rgba(255,255,255,0.78)",
          }
      : {
          boxShadow: winner
            ? "0 22px 44px rgba(38,38,38,0.18)"
            : "0 1px 2px rgba(38,38,38,0.04), 0 16px 32px rgba(38,38,38,0.06)",
        };
    const titleClass = dark
      ? winner
        ? "text-mono-10"
        : ""
      : winner
        ? "text-mono-6"
        : "text-mono-10";
    const titleStyle = dark && !winner ? { color: "rgba(255,255,255,0.55)" } : {};
    const iconStyle = { color: winner ? checkColor : crossColor };

    return (
      <div
        className={`flex flex-1 flex-col rounded-3xl border ${panelClass}`}
        style={{ padding: colPad, gap: rowGap, borderColor: dark && winner ? "#ffffff" : undefined, ...panelStyle }}
      >
        {title ? (
          <span
            className={`font-mono ${titleClass}`}
            style={{
              fontSize: Math.round(eye * 0.95),
              letterSpacing: "0.01em",
              marginBottom: Math.round(rowGap * 0.3),
              ...titleStyle,
            }}
          >
            {title}
          </span>
        ) : null}
        {items.map((label, i) => (
          <div key={i} className="flex items-start" style={{ gap: Math.round(icon * 0.6) }}>
            <span style={{ marginTop: Math.round(item * 0.12), ...iconStyle }}>
              <MarkIcon kind={kind} size={icon} />
            </span>
            <span style={{ fontSize: item, lineHeight: 1.3, fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <CreativeCanvas w={w} h={h} className={dark ? "bg-mono-21 text-mono-1" : "bg-mono-1 text-mono-21"}>
      {dark && brief.image ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brief.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "rgba(10,10,10,0.86)" }} />
        </>
      ) : null}
      <div
        className="absolute inset-0 flex flex-col justify-center"
        style={{ padding: pad, gap: Math.round(head * 0.55) }}
      >
        <div className="flex flex-col items-start">
          {brief.brandMark ? <BrandMark height={mark} invert={dark} /> : null}
          <h1
            className="font-semibold tracking-tight text-balance"
            style={{ fontSize: head, lineHeight: 1.05, marginTop: brief.brandMark ? Math.round(head * 0.3) : 0 }}
          >
            {c.headline}
          </h1>
          {c.subhead ? (
            <p
              className={dark ? "text-mono-5" : "text-mono-11"}
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
        </div>

        <div className="flex items-stretch" style={{ gap: colGap }}>
          {column(cmp.leftTitle, cmp.left ?? [], "cross")}
          {column(cmp.rightTitle, cmp.right ?? [], "check")}
        </div>

        {cmp.footer ? (
          <span
            className={`font-mono ${dark ? "text-mono-6" : "text-mono-11"}`}
            style={{ fontSize: Math.round(eye * 0.95), letterSpacing: "0.01em" }}
          >
            {cmp.footer}
          </span>
        ) : null}

        {c.cta || c.proof ? (
          <div className="flex flex-wrap items-center" style={{ gap: Math.round(eye * 0.9) }}>
            {c.cta ? (
              <div
                className={dark ? "bg-mono-1 text-mono-21" : "bg-mono-21 text-mono-1"}
                style={{
                  display: "inline-flex",
                  width: "fit-content",
                  alignItems: "center",
                  gap: Math.round(min * 0.014),
                  height: Math.round(min * 0.068),
                  paddingLeft: Math.round(min * (c.ctaIcon ? 0.034 : 0.04)),
                  paddingRight: Math.round(min * 0.04),
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
                    style={{ height: Math.round(min * 0.068 * 0.42), width: "auto" }}
                  />
                ) : null}
                {c.cta}
              </div>
            ) : null}
            {c.proof ? <ProofChip text={c.proof} fontSize={Math.round(eye * 0.92)} invert={dark} /> : null}
          </div>
        ) : null}
      </div>
    </CreativeCanvas>
  );
}
