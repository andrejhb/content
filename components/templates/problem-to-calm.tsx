import type { Brief } from "@/lib/creatives";
import { CreativeCanvas, BrandMark } from "./canvas";

// Problem to calm — the second job (chaos) versus the calm layer, split.
export function ProblemToCalmTemplate({
  brief,
  w,
  h,
}: {
  brief: Brief;
  w: number;
  h: number;
}) {
  const c = brief.copy;
  const portrait = h >= w;
  const pad = Math.round(Math.min(w, h) * 0.072);
  const label = Math.round(w * 0.019);
  const item = Math.round(w * (portrait ? 0.036 : 0.03));
  const calmHead = Math.round(Math.min(w, h * 1.05) * (portrait ? 0.07 : 0.06));
  const mark = Math.round(w * 0.03);

  const problems = c.problems ?? [];

  return (
    <CreativeCanvas w={w} h={h}>
      <div className={`absolute inset-0 flex ${portrait ? "flex-col" : "flex-row"}`}>
        {/* Problem — the second job */}
        <div
          className="flex flex-[46] flex-col justify-center gap-5 bg-mono-2 text-mono-17"
          style={{ padding: pad }}
        >
          <span
            className="font-mono text-mono-11"
            style={{ fontSize: label, letterSpacing: "0.01em" }}
          >
            {c.problemLabel ?? "The second job"}
          </span>
          <ul className="flex flex-col" style={{ gap: Math.round(item * 0.55) }}>
            {problems.map((p, i) => (
              <li
                key={i}
                className="flex items-baseline text-mono-18"
                style={{ fontSize: item, lineHeight: 1.25, gap: Math.round(item * 0.5) }}
              >
                <span className="text-mono-11">—</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Calm — the calm layer */}
        <div
          className="flex flex-[54] flex-col justify-between bg-mono-20 text-mono-1"
          style={{ padding: pad }}
        >
          <span
            className="font-mono text-mono-5"
            style={{ fontSize: label, letterSpacing: "0.01em" }}
          >
            {c.calmLabel ?? "The calm layer"}
          </span>
          <p
            className="font-semibold tracking-tight text-balance"
            style={{ fontSize: calmHead, lineHeight: 1.08 }}
          >
            {c.calm ?? c.headline}
          </p>
          <div className="flex items-end justify-between gap-6">
            {c.subhead ? (
              <p
                className="text-mono-4"
                style={{ fontSize: Math.round(w * 0.024), lineHeight: 1.3, maxWidth: portrait ? "100%" : w * 0.32 }}
              >
                {c.subhead}
              </p>
            ) : (
              <span />
            )}
            {brief.brandMark ? <BrandMark height={mark} invert /> : null}
          </div>
        </div>
      </div>
    </CreativeCanvas>
  );
}
