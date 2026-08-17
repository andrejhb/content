import type { Brief } from "@/lib/creatives";
import { CreativeCanvas, BrandMark } from "./canvas";

// Quote-card tokens, pinned with design-system names the way compare.tsx pins
// accent hexes (the app layer only emits mono utilities).
// color.orange.2 — warm off-white. Not yellow.
const GROUND = "#fff6e5";
// color.neutral.19 — near-black type
const INK = "#1a1a1a";
// color.neutral.15 — attribution
const MUTED = "#4d4d4d";
// Parent-brand warm accent (launch-shared LAUNCH_ACCENT). Not yellow.
const ACCENT = "#ff7a59";
const ACCENT_WASH = "rgba(255, 122, 89, 0.32)";

function HighlightedQuote({
  text,
  highlight,
  fontSize,
  maxWidth,
}: {
  text: string;
  highlight?: string;
  fontSize: number;
  maxWidth: number;
}) {
  const mark = highlight && text.includes(highlight) ? highlight : null;
  const i = mark ? text.indexOf(mark) : -1;

  return (
    <p
      style={{
        fontSize,
        lineHeight: 1.32,
        color: INK,
        maxWidth,
        fontWeight: 450,
      }}
    >
      {mark && i >= 0 ? (
        <>
          {text.slice(0, i)}
          <span
            style={{
              background: ACCENT_WASH,
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone",
              padding: `0 ${Math.round(fontSize * 0.12)}px`,
              borderRadius: Math.round(fontSize * 0.12),
            }}
          >
            {mark}
          </span>
          {text.slice(i + mark.length)}
        </>
      ) : (
        text
      )}
    </p>
  );
}

function QuoteCard({
  brief,
  w,
  h,
}: {
  brief: Brief;
  w: number;
  h: number;
}) {
  const c = brief.copy;
  const min = Math.min(w, h);
  const tall = w / h <= 0.6;
  const pad = Math.round(min * (tall ? 0.082 : 0.078));
  const head = Math.round(min * (tall ? 0.078 : 0.062));
  const quote = Math.round(w * (tall ? 0.042 : 0.036));
  const attr = Math.round(w * 0.022);
  const chip = Math.round(min * (tall ? 0.092 : 0.078));
  const mark = Math.round(min * 0.038);
  const ctaH = Math.round(min * (tall ? 0.078 : 0.072));
  const ctaSize = Math.round(w * (tall ? 0.028 : 0.026));

  return (
    <CreativeCanvas w={w} h={h} style={{ background: GROUND, color: INK }}>
      <div
        className="absolute inset-0 flex flex-col"
        style={{ padding: pad, gap: Math.round(min * 0.04) }}
      >
        <div className="flex items-start justify-between">
          <div
            aria-hidden
            style={{
              width: chip,
              height: chip,
              background: ACCENT,
              borderRadius: Math.round(chip * 0.22),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: Math.round(chip * 0.7),
              fontWeight: 600,
              lineHeight: 1,
              paddingBottom: Math.round(chip * 0.08),
            }}
          >
            “
          </div>
          {brief.brandMark ? <BrandMark height={mark} /> : <span />}
        </div>

        <div
          className="flex flex-1 flex-col justify-center"
          style={{ gap: Math.round(head * 0.42) }}
        >
          <h1
            className="font-semibold tracking-tight text-balance"
            style={{ fontSize: head, lineHeight: 1.08, maxWidth: w - pad * 2 }}
          >
            {c.headline}
          </h1>
          {c.subhead ? (
            <HighlightedQuote
              text={c.subhead}
              highlight={c.headlineTail}
              fontSize={quote}
              maxWidth={Math.round(w * (tall ? 0.86 : 0.88))}
            />
          ) : null}
          {c.proof ? (
            <p
              style={{
                fontSize: attr,
                lineHeight: 1.3,
                color: MUTED,
                letterSpacing: "0.01em",
                fontWeight: 500,
              }}
            >
              {c.proof}
            </p>
          ) : null}
        </div>

        {c.cta ? (
          <div
            style={{
              display: "inline-flex",
              width: "fit-content",
              alignItems: "center",
              height: ctaH,
              paddingLeft: Math.round(min * 0.042),
              paddingRight: Math.round(min * 0.042),
              borderRadius: 9999,
              background: ACCENT,
              color: INK,
              fontWeight: 600,
              fontSize: ctaSize,
              boxShadow:
                "0 1px 2px rgba(17, 24, 39, 0.06), 0 4px 8px rgba(17, 24, 39, 0.04), 0 12px 24px rgba(17, 24, 39, 0.03)",
            }}
          >
            {c.cta}
          </div>
        ) : null}
      </div>
    </CreativeCanvas>
  );
}

// Proof card: allowlisted proof claim as centred type, or a quote-card when
// copy.cta is set (chip, quote, highlight, attribution, accent button).
export function ProofCardTemplate({
  brief,
  w,
  h,
}: {
  brief: Brief;
  w: number;
  h: number;
}) {
  if (brief.copy.cta) {
    return <QuoteCard brief={brief} w={w} h={h} />;
  }

  const c = brief.copy;
  const pad = Math.round(Math.min(w, h) * 0.09);
  const eye = Math.round(w * 0.022);
  const head = Math.round(Math.min(w, h * 1.05) * 0.082);
  const sub = Math.round(w * 0.03);
  const mark = Math.round(w * 0.034);

  return (
    <CreativeCanvas w={w} h={h} className="bg-mono-1 text-mono-21">
      <div
        className="absolute inset-0 flex flex-col items-center justify-between text-center"
        style={{ padding: pad }}
      >
        <span
          className="font-mono text-mono-11"
          style={{ fontSize: eye, letterSpacing: "0.01em" }}
        >
          {c.eyebrow ?? "Proof"}
        </span>

        <div className="flex flex-1 flex-col items-center justify-center" style={{ gap: Math.round(sub * 0.9) }}>
          <span
            aria-hidden
            className="rounded-full bg-mono-21"
            style={{ width: Math.round(w * 0.07), height: Math.max(2, Math.round(h * 0.004)) }}
          />
          <h1
            className="font-semibold tracking-tight text-balance"
            style={{ fontSize: head, lineHeight: 1.06, maxWidth: w - pad * 2 }}
          >
            {c.headline}
          </h1>
          {c.subhead ? (
            <p
              className="text-mono-11"
              style={{ fontSize: sub, lineHeight: 1.4, maxWidth: w * 0.78 }}
            >
              {c.subhead}
            </p>
          ) : null}
        </div>

        {brief.brandMark ? <BrandMark height={mark} /> : <span />}
      </div>
    </CreativeCanvas>
  );
}
