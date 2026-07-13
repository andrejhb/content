import type { Brief } from "@/lib/creatives";
import { CreativeCanvas, BrandMark, ProofChip } from "./canvas";

// Image card: eyebrow + headline up top, a large rounded image below.
// Light or dark. The image is supplied (a real photo or product screenshot).
export function ImageCardTemplate({
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
  const mark = Math.round(w * 0.03);

  const bg = dark ? "bg-mono-20 text-mono-1" : "bg-mono-1 text-mono-21";
  const eyeColor = dark ? "text-mono-5" : "text-mono-11";
  const accentBg = dark ? "bg-mono-5" : "bg-mono-11";
  const frame = dark ? "border-mono-18" : "border-mono-4";
  // Lift the image off the page, matching the feature-card panel's depth.
  const imageShadow = dark
    ? "0 24px 48px rgba(0,0,0,0.5)"
    : "0 20px 40px rgba(38,38,38,0.10)";
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
              style={{
                width: Math.round(eye * 1.5),
                height: Math.max(2, Math.round(h * 0.0026)),
              }}
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
        style={{ fontSize: head, lineHeight: 1.05, marginTop: hasKicker ? Math.round(head * 0.24) : 0 }}
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
            maxWidth: landscape ? "100%" : w * 0.8,
          }}
        >
          {c.subhead}
        </p>
      ) : null}
      {c.proof ? (
        <div style={{ marginTop: Math.round(head * 0.42) }}>
          <ProofChip text={c.proof} fontSize={Math.round(eye * 0.92)} invert={dark} />
        </div>
      ) : null}
    </div>
  );

  const image = (
    <div
      className={`relative min-h-0 flex-1 overflow-hidden rounded-3xl border ${frame}`}
      style={{ boxShadow: imageShadow }}
    >
      {brief.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brief.image}
          alt={c.headline ?? ""}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-mono-3">
          <span className="font-mono text-mono-11" style={{ fontSize: eye }}>
            supply an image
          </span>
        </div>
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
            {image}
          </>
        ) : (
          <>
            {text}
            {image}
          </>
        )}
      </div>
    </CreativeCanvas>
  );
}
