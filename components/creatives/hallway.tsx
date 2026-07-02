import Link from "next/link";
import { listCreatives, renderedMedia } from "@/lib/creatives";
import { TEMPLATES } from "@/components/templates/registry";
import { QaBadge } from "@/components/creatives/qa-badge";
import { Mono } from "@/components/site/kit";

export async function Hallway({
  product,
  query,
}: {
  product?: string;
  query?: string;
}) {
  let creatives = await listCreatives(product);

  if (query) {
    const q = query.toLowerCase();
    creatives = creatives.filter((b) =>
      [
        b.id,
        b.angle,
        b.template,
        b.copy.headline,
        b.copy.subhead,
        b.copy.eyebrow,
        b.copy.calm,
        ...(b.copy.problems ?? []),
      ]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(q)),
    );
  }

  if (creatives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
        <p className="text-body text-t2">
          {query ? "Nothing matches that search." : "No creatives yet."}
        </p>
        <p className="max-w-md text-caption text-t3">
          {query ? (
            "Try a different word, or clear the search."
          ) : (
            <>
              Run <span className="font-mono text-t2">hububb-creative</span> with
              an angle and they will appear here, newest first.
            </>
          )}
        </p>
      </div>
    );
  }

  const withRenders = await Promise.all(
    creatives.map(async (b) => ({ brief: b, media: await renderedMedia(b.id) })),
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {withRenders.map(({ brief, media }) => {
        // Thumbnail is always a PNG: the actual render for images, the poster
        // frame for videos.
        const thumb =
          media.find((m) => m.format === "1x1")?.format ?? media[0]?.format;
        const isVideo = brief.kind === "video";
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
                <div className="flex items-center gap-2">
                  <Mono className="text-t3">{tpl?.label ?? brief.template}</Mono>
                  {isVideo ? (
                    <Mono className="rounded-full border border-border px-1.5 text-t3">
                      video
                    </Mono>
                  ) : null}
                </div>
                <QaBadge qa={brief.qa} />
              </div>
              <p className="line-clamp-2 text-body text-t1">
                {brief.copy.headline ?? brief.copy.calm ?? brief.angle}
              </p>
              <p className="mt-auto font-mono text-caption text-dim">
                {media.length}/{brief.formats.length} formats
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
