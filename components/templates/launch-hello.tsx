import type { Brief } from "@/lib/creatives";
import { CreativeCanvas, BrandMark } from "./canvas";
import { LaunchBackdrop, LaunchEyebrow } from "./launch-shared";

// launch-hello: the @wearehububb greeting. A big, light-weight sentence-case
// line on a near-black canvas with soft depth. Editorial negative space (Casa),
// monochrome depth (Revolut). Type only, no image dependency.
export function LaunchHelloTemplate({
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
  const pad = Math.round(Math.min(w, h) * 0.085);
  const head = Math.round(Math.min(w, h * 1.05) * (landscape ? 0.12 : 0.108));
  const eye = Math.round(Math.min(w, h) * 0.018);
  const sub = Math.round(Math.min(w, h) * 0.026);
  const mark = Math.round(Math.min(w, h) * 0.03);

  return (
    <CreativeCanvas w={w} h={h} className="bg-mono-20 text-mono-1">
      <LaunchBackdrop glowX={0.34} glowY={0.3} />
      <div
        className="absolute inset-0 flex flex-col justify-between"
        style={{ padding: pad }}
      >
        {c.eyebrow ? (
          <LaunchEyebrow label={c.eyebrow} size={eye} />
        ) : (
          <span />
        )}

        <div className="flex flex-col" style={{ gap: Math.round(sub * 1.4) }}>
          <h1
            className="font-light tracking-tight text-balance"
            style={{
              fontSize: head,
              lineHeight: 1.02,
              maxWidth: w - pad * 2,
              letterSpacing: "-0.02em",
            }}
          >
            {c.headline}
          </h1>
          {c.subhead ? (
            <p
              className="text-mono-9 font-normal"
              style={{
                fontSize: sub,
                lineHeight: 1.4,
                maxWidth: landscape ? w * 0.6 : w * 0.82,
              }}
            >
              {c.subhead}
            </p>
          ) : null}
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
