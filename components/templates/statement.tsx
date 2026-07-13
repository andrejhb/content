import type { Brief } from "@/lib/creatives";
import { CreativeCanvas, BrandMark, ProofChip } from "./canvas";

// Statement: one strong line, pure type on a light token background.
export function StatementTemplate({
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
  const head = Math.round(Math.min(w, h * 1.1) * 0.108);
  const eye = Math.round(w * 0.0225);
  const sub = Math.round(w * 0.028);
  const mark = Math.round(w * 0.034);

  return (
    <CreativeCanvas w={w} h={h} className="bg-mono-1 text-mono-21">
      <div
        className="absolute inset-0 flex flex-col justify-between"
        style={{ padding: pad }}
      >
        <div className="flex items-start justify-between">
          {c.eyebrow ? (
            <div className="flex items-center" style={{ gap: Math.round(eye * 0.6) }}>
              <span
                className="rounded-full bg-mono-11"
                style={{
                  width: Math.round(eye * 1.5),
                  height: Math.max(2, Math.round(h * 0.0026)),
                }}
              />
              <span
                className="font-mono text-mono-11"
                style={{ fontSize: eye, letterSpacing: "0.01em" }}
              >
                {c.eyebrow}
              </span>
            </div>
          ) : (
            <span />
          )}
        </div>

        <h1
          className="font-semibold tracking-tight text-balance"
          style={{ fontSize: head, lineHeight: 1.04, maxWidth: w - pad * 2 }}
        >
          {c.headline}
        </h1>

        <div className="flex items-end justify-between gap-8">
          <div className="flex flex-col" style={{ gap: Math.round(sub * 0.9) }}>
            {c.subhead ? (
              <p
                className="text-mono-11"
                style={{ fontSize: sub, lineHeight: 1.32, maxWidth: w * 0.66 }}
              >
                {c.subhead}
              </p>
            ) : null}
            {c.proof ? (
              <ProofChip text={c.proof} fontSize={Math.round(eye * 0.95)} />
            ) : null}
          </div>
          {brief.brandMark ? <BrandMark height={mark} /> : null}
        </div>
      </div>
    </CreativeCanvas>
  );
}
