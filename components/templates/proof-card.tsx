import type { Brief } from "@/lib/creatives";
import { CreativeCanvas, BrandMark } from "./canvas";

// Proof card: built around "tested on hundreds of real London properties".
export function ProofCardTemplate({
  brief,
  w,
  h,
}: {
  brief: Brief;
  w: number;
  h: number;
}) {
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
