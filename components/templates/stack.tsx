import type { Brief } from "@/lib/creatives";
import { CreativeCanvas, BrandMark } from "./canvas";

// The brand ramp is monochrome, so this mint is the one accent the system has.
// It is already the "checked in" green in remotion/compositions/hostie-ad.
const MINT = "#b2ffea";

// Marks a card as done rather than merely notified: the whole point is that the
// work was already handled, not that something needs the host's attention.
function DoneTick({ size }: { size: number }) {
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="8" fill={MINT} />
      <path
        d="M4.6 8.2l2.3 2.3 4.5-4.7"
        stroke="#0d0d0d"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Stack: a full-bleed photo under a centred axis of wordmark, a receding pile of
// notification cards, then headline / subhead / CTA. Use it when the point is that
// work happened while the host was not looking: the cards are the proof, the photo
// is the life they were living instead. Unlike spotlight (left-aligned under a
// left-heavy scrim) this is centre-weighted, so it carries its own top-down +
// bottom-up scrim instead.
//
// copy.notifications drives the pile, front card first. The icons are the real
// iOS app icons under /asset/<product>/channels (plus brand/host-icon.png),
// which is what keeps the cards from reading as invented UI.
export function StackTemplate({
  brief,
  w,
  h,
}: {
  brief: Brief;
  w: number;
  h: number;
}) {
  const c = brief.copy;
  const landscape = w > h;
  const tall = w / h <= 0.6; // 9:16 — bigger type, narrower measure so it wraps
  const min = Math.min(w, h);
  const pad = Math.round(min * 0.085);
  const compact = brief.compactHead;
  // One notch under spotlight's scale: the stack owns the upper half, so the
  // headline is not the sole focal point.
  const head = Math.round(
    Math.min(w, h * 1.05) *
      (landscape ? 0.05 : tall ? (compact ? 0.058 : 0.082) : compact ? 0.052 : 0.062),
  );
  const sub = Math.round(w * 0.027);
  const ctaH = Math.round(min * 0.075);
  const logoH = Math.round(min * 0.044);

  // A squarer canvas has less room above the copy, so it carries a shallower pile.
  const maxDepth = h / w >= 1.15 ? 4 : 3;
  const cards = (c.notifications ?? []).slice(0, maxDepth);

  const cardW = Math.round(w * (landscape ? 0.46 : 0.8));
  const cardPad = Math.round(min * 0.03);
  const icon = Math.round(min * 0.062);
  const title = Math.round(min * 0.027);
  const body = Math.round(min * 0.024);
  const metaFs = Math.round(min * 0.021);
  // Every card is exactly this tall, content centred. A card that grew with its
  // own text would break the pile's rhythm, and `step` derives from this number.
  const cardH = Math.max(icon, Math.round(title * 1.25) + Math.round(body * 1.4)) + cardPad * 2;
  // Height-derived, not min-derived: a landscape card is shorter, so a min-derived
  // radius would read as less round than the portrait one.
  const radius = Math.round(cardH * 0.24);

  // A big fan on purpose. iOS collapses its stack to a ~6% peek, but at that size
  // the cards behind are a sliver and the depth cues land on nothing. Revealing
  // most of each card is what makes the pile read, and it is the reference's look.
  const step = Math.round(cardH * 0.72);
  const stackH = cardH + step * Math.max(0, cards.length - 1);
  const textMax = landscape ? Math.round(w * 0.5) : cardW;

  // Two soft layers. The elevation tokens cap at a 16px blur, which reads as
  // pasted-on under a card floating over a photo at this size; feature-card sets
  // the same bespoke-shadow precedent with its panelShadow.
  const cardShadow =
    `0 ${Math.round(min * 0.002)}px ${Math.round(min * 0.006)}px rgba(0,0,0,0.10), ` +
    `0 ${Math.round(min * 0.016)}px ${Math.round(min * 0.038)}px rgba(0,0,0,0.22)`;

  // The top ramp is structural, not decoration: it is what the faded cards at the
  // back of the pile are seen against. Without it they vanish into a bright photo.
  // brief.topScrim upgrades it rather than enabling it.
  const topScrim =
    brief.topScrim === true
      ? "linear-gradient(180deg, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.3) 34%, rgba(0,0,0,0) 62%)"
      : "linear-gradient(180deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.2) 34%, rgba(0,0,0,0) 62%)";
  // Reaches much further up than spotlight's bottom ramp, because spotlight leans
  // on its left gradient for copy legibility and this template has none.
  const bottomScrim =
    "linear-gradient(0deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.72) 30%, rgba(0,0,0,0.42) 55%, rgba(0,0,0,0.12) 75%, rgba(0,0,0,0) 88%)";
  const scrim = [topScrim, bottomScrim].join(", ");

  return (
    <CreativeCanvas w={w} h={h} className="bg-mono-21 text-mono-1">
      {brief.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brief.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      {brief.dim ? (
        // flat overlay to knock back a bright photo so white copy stays legible
        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${brief.dim})` }} />
      ) : null}
      <div className="absolute inset-0" style={{ background: scrim }} />

      <div
        className="absolute inset-0 flex flex-col items-center justify-between"
        style={{ padding: pad }}
      >
        <div className="flex flex-col items-center" style={{ gap: Math.round(h * 0.045) }}>
          {brief.brandMark ? <BrandMark height={logoH} invert variant="wordmark" /> : null}

          {/* The deepest card's blur bleeds a few px past the pile: the pad above
              keeps that soft edge off the canvas, which is overflow-hidden and
              would slice it dead straight. */}
          <div
            style={{
              position: "relative",
              width: cardW,
              height: stackH,
              // Dissolve the back of the pile into the photo. Without this the
              // faintest card still ends on a hard horizontal edge, which reads
              // as a cut-off panel rather than as depth.
              maskImage: "linear-gradient(180deg, #000 58%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(180deg, #000 58%, transparent 100%)",
            }}
          >
          {cards.length === 0 ? (
            <div
              className="flex h-full w-full items-center justify-center rounded-3xl border font-mono"
              style={{
                borderColor: "rgba(255,255,255,0.4)",
                color: "rgba(255,255,255,0.7)",
                fontSize: metaFs,
              }}
            >
              supply copy.notifications
            </div>
          ) : null}
          {/* Deepest first so the front card paints last. */}
          {cards
            .map((n, d) => ({ n, d }))
            .reverse()
            .map(({ n, d }) => (
              <div
                key={`${n.title}-${d}`}
                className="absolute left-0 right-0 flex items-center"
                style={{
                  top: step * d,
                  height: cardH,
                  transform: `scale(${1 - d * 0.055})`,
                  zIndex: cards.length - d,
                  // Fade the whole card, never its background alpha: alpha would
                  // leave full-strength text and shadow on a ghost card.
                  opacity: 1 - d * 0.16,
                  // Gentle on purpose: enough to throw the pile out of focus, not
                  // enough to stop each card being a card. A heavy ramp here reads
                  // as a rendering smear rather than as depth.
                  filter: d === 0 ? undefined : `blur(${(min * 0.0013 * d).toFixed(1)}px)`,
                  gap: Math.round(cardPad * 0.72),
                  paddingLeft: cardPad,
                  paddingRight: cardPad,
                  borderRadius: radius,
                  background: "#ffffff",
                  boxShadow: cardShadow,
                }}
              >
                <div
                  className="flex shrink-0 items-center justify-center overflow-hidden"
                  style={{
                    width: icon,
                    height: icon,
                    // A squircle, not a circle: these sources are already iOS app
                    // icons, so rounding them fully would clip the artwork.
                    borderRadius: Math.round(icon * 0.24),
                    background: n.icon ? undefined : "#111111",
                  }}
                >
                  {n.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={n.icon} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <BrandMark height={Math.round(icon * 0.5)} invert variant="symbol" />
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col" style={{ gap: Math.round(min * 0.005) }}>
                  <div className="flex min-w-0 items-center" style={{ gap: Math.round(min * 0.009) }}>
                    <span
                      className="truncate font-semibold"
                      style={{ fontSize: title, color: "#111111", letterSpacing: "-0.01em" }}
                    >
                      {n.title}
                    </span>
                    <DoneTick size={Math.round(title * 0.72)} />
                  </div>
                  {n.text ? (
                    <span
                      className="truncate"
                      style={{ fontSize: body, lineHeight: 1.35, color: "rgba(17,17,17,0.68)" }}
                    >
                      {n.text}
                    </span>
                  ) : null}
                </div>

                {n.meta ? (
                  <span
                    className="font-mono shrink-0"
                    style={{ fontSize: metaFs, color: "rgba(17,17,17,0.45)" }}
                  >
                    {n.meta}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div
          className="flex flex-col items-center text-center"
          style={{ gap: Math.round(head * 0.4) }}
        >
          <div
            className="flex flex-col items-center"
            style={{ maxWidth: textMax, gap: Math.round(head * 0.26) }}
          >
            <h1
              className="font-semibold tracking-tight text-balance"
              style={{ fontSize: head, lineHeight: 1.2 }}
            >
              <span>{c.headline}</span>
              {c.headlineTail ? (
                <>
                  <br />
                  <span>{c.headlineTail}</span>
                </>
              ) : null}
            </h1>
            {c.subhead ? (
              <p
                style={{
                  fontSize: sub,
                  lineHeight: 1.4,
                  color: "#ffffff",
                  maxWidth: Math.round(textMax * 0.9),
                }}
              >
                {c.subhead}
              </p>
            ) : null}
          </div>

          {c.cta ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: Math.round(min * 0.014),
                height: ctaH,
                paddingLeft: Math.round(min * (c.ctaIcon ? 0.038 : 0.045)),
                paddingRight: Math.round(min * 0.045),
                borderRadius: 9999,
                background: "#ffffff",
                color: "#111111",
                fontWeight: 600,
                fontSize: Math.round(w * 0.022),
              }}
            >
              {c.ctaIcon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.ctaIcon} alt="" style={{ height: Math.round(ctaH * 0.42), width: "auto" }} />
              ) : null}
              {c.cta}
            </div>
          ) : null}
        </div>
      </div>
    </CreativeCanvas>
  );
}
