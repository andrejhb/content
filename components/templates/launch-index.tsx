import type { Brief } from "@/lib/creatives";
import { CreativeCanvas, BrandMark } from "./canvas";
import { LaunchBackdrop, LaunchEyebrow } from "./launch-shared";

// launch-index: the "what is Hububb" explainer. A flag headline, a one-line
// thesis, then a three-row index (Host / Stay / Work) separated by hairlines.
// The one account where naming all three products together is intended.
export function LaunchIndexTemplate({
  brief,
  w,
  h,
}: {
  brief: Brief;
  w: number;
  h: number;
}) {
  const c = brief.copy;
  const items = c.items ?? [];
  const landscape = w > h;
  const pad = Math.round(Math.min(w, h) * 0.085);
  const head = Math.round(Math.min(w, h * 1.05) * (landscape ? 0.085 : 0.078));
  const eye = Math.round(Math.min(w, h) * 0.018);
  const sub = Math.round(Math.min(w, h) * 0.024);
  const num = Math.round(Math.min(w, h) * 0.016);
  const label = Math.round(Math.min(w, h) * 0.036);
  const rowText = Math.round(Math.min(w, h) * 0.024);
  const mark = Math.round(Math.min(w, h) * 0.03);

  return (
    <CreativeCanvas w={w} h={h} className="bg-mono-20 text-mono-1">
      <LaunchBackdrop glowX={0.5} glowY={0.16} />
      <div
        className="absolute inset-0 flex flex-col justify-between"
        style={{ padding: pad }}
      >
        <div className="flex flex-col" style={{ gap: Math.round(sub * 1.1) }}>
          {c.eyebrow ? <LaunchEyebrow label={c.eyebrow} size={eye} /> : null}
          <h1
            className="font-light tracking-tight text-balance"
            style={{
              fontSize: head,
              lineHeight: 1.02,
              maxWidth: w - pad * 2,
              letterSpacing: "-0.02em",
              marginTop: Math.round(sub * 0.6),
            }}
          >
            {c.headline}
          </h1>
          {c.subhead ? (
            <p
              className="text-mono-9 font-normal"
              style={{ fontSize: sub, lineHeight: 1.4, maxWidth: landscape ? w * 0.66 : w * 0.9 }}
            >
              {c.subhead}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col">
          {items.map((it, i) => (
            <div
              key={it.label}
              className="flex items-baseline border-t border-mono-18"
              style={{
                gap: Math.round(label * 0.6),
                paddingTop: Math.round(rowText * 0.9),
                paddingBottom: Math.round(rowText * 0.9),
              }}
            >
              <span
                className="font-mono text-mono-7"
                style={{ fontSize: num, width: Math.round(num * 3), flexShrink: 0 }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="font-normal text-mono-1 tracking-tight"
                style={{ fontSize: label, width: landscape ? "22%" : "34%", flexShrink: 0 }}
              >
                {it.label}
              </span>
              <span
                className="text-mono-9 font-normal"
                style={{ fontSize: rowText, lineHeight: 1.3 }}
              >
                {it.text}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-end justify-between" style={{ gap: pad }}>
          {brief.brandMark ? <BrandMark height={mark} invert /> : <span />}
          {c.handle ? (
            <span
              className="font-mono text-mono-8"
              style={{ fontSize: eye, letterSpacing: "0.04em" }}
            >
              {c.handle}
            </span>
          ) : null}
        </div>
      </div>
    </CreativeCanvas>
  );
}
