import Link from "next/link";
import { listCreatives, renderedFormats } from "@/lib/creatives";
import { TEMPLATES } from "@/components/templates/registry";
import { QaBadge } from "@/components/creatives/qa-badge";
import { Mono } from "@/components/site/kit";

export async function Hallway() {
  const creatives = await listCreatives();

  if (creatives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
        <p className="text-body text-t2">No creatives yet.</p>
        <p className="max-w-md text-caption text-t3">
          Run <span className="font-mono text-t2">hububb-creative</span> with an
          angle and they will appear here, newest first.
        </p>
      </div>
    );
  }

  const withRenders = await Promise.all(
    creatives.map(async (b) => ({ brief: b, formats: await renderedFormats(b.id) })),
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {withRenders.map(({ brief, formats }) => {
        const thumb = formats.includes("1x1") ? "1x1" : formats[0];
        const tpl = TEMPLATES[brief.template];
        return (
          <Link
            key={brief.id}
            href={`/creative/${brief.id}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-elevation-1 transition-colors hover:border-t3"
          >
            <div className="flex aspect-square items-center justify-center overflow-hidden border-b border-border bg-surface">
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/creative-asset/${brief.id}/${thumb}.png`}
                  alt={brief.copy.headline ?? brief.id}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-mono text-caption text-muted">not rendered</span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <Mono className="text-t3">{tpl?.label ?? brief.template}</Mono>
                <QaBadge qa={brief.qa} />
              </div>
              <p className="line-clamp-2 text-body text-t1">
                {brief.copy.headline ?? brief.copy.calm ?? brief.angle}
              </p>
              <p className="mt-auto font-mono text-caption text-dim">
                {formats.length}/4 formats
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
