import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { getCreative, renderedMedia } from "@/lib/creatives";
import { FORMATS, VIDEO_FORMATS } from "@/lib/formats";
import { TEMPLATES } from "@/components/templates/registry";
import { QaBadge } from "@/components/creatives/qa-badge";
import { Card, CardLabel, Mono } from "@/components/site/kit";

export const dynamic = "force-dynamic";

// Anchors styled with design-system tokens (the DS Button's asChild/Slot path
// is brittle, so we don't route downloads through it).
const BTN_PRIMARY =
  "inline-flex h-10 items-center gap-1.5 rounded-sm bg-foreground px-4 text-body font-medium text-background transition-colors hover:bg-action-hover";
const BTN_SECONDARY =
  "inline-flex h-8 items-center gap-1.5 rounded-sm border border-border bg-card px-3 text-caption font-medium text-foreground transition-colors hover:bg-subtle-hover";

export default async function CreativeDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brief = await getCreative(id);
  if (!brief) notFound();

  const rendered = await renderedMedia(id);
  const isVideo = brief.kind === "video";
  const formats = isVideo ? VIDEO_FORMATS : FORMATS;
  const tpl = TEMPLATES[brief.template];
  const c = brief.copy;

  const copyRows: [string, string | undefined][] = [
    ["Eyebrow", c.eyebrow],
    ["Headline", c.headline],
    ["Subhead", c.subhead],
    ["Problem label", c.problemLabel],
    ["Problems", c.problems?.join(" · ")],
    ["Calm label", c.calmLabel],
    ["Calm line", c.calm],
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href={`/p/${brief.product}/creatives`}
        className="inline-flex items-center gap-1.5 text-caption text-t3 transition-colors hover:text-t1"
      >
        <ArrowLeft className="size-4" /> Back to the hallway
      </Link>

      <header className="mt-5 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Mono className="text-t3">{tpl?.label ?? brief.template}</Mono>
          {isVideo ? (
            <Mono className="rounded-full border border-border px-2 py-0.5 text-t3">
              video · {brief.video?.track}
            </Mono>
          ) : null}
          <QaBadge qa={brief.qa} />
          <Mono className="text-dim">{rendered.length}/{brief.formats.length} rendered</Mono>
          {rendered.length > 0 ? (
            <a
              className={`ml-auto ${BTN_PRIMARY}`}
              href={`/api/creatives/${id}/zip`}
              download
            >
              <DownloadSimple className="size-4" /> Download all (zip)
            </a>
          ) : null}
        </div>
        <h1 className="mt-3 max-w-3xl text-heading-2 leading-heading-2 text-t1">
          {c.headline ?? c.calm ?? brief.angle}
        </h1>
      </header>

      {/* Context */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardLabel>Angle</CardLabel>
          <p className="mt-2 text-body leading-body text-t2">{brief.angle}</p>
          {brief.brief ? (
            <>
              <CardLabel className="mt-4">Brief</CardLabel>
              <p className="mt-2 text-body leading-body text-t3">{brief.brief}</p>
            </>
          ) : null}
        </Card>
        <Card>
          <CardLabel>Copy</CardLabel>
          <dl className="mt-3 flex flex-col gap-2">
            {copyRows
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="grid grid-cols-[110px_1fr] gap-3">
                  <dt className="font-mono text-caption text-dim">{k}</dt>
                  <dd className="text-caption text-t2">{v}</dd>
                </div>
              ))}
          </dl>
        </Card>
      </section>

      {/* Formats */}
      <section className="mt-8">
        <CardLabel>Formats</CardLabel>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {formats.map((f) => {
            const media = rendered.find((r) => r.format === f.key);
            return (
              <div
                key={f.key}
                className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-elevation-1"
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-body font-semibold text-t1">{f.label}</span>
                    <Mono>{f.w}×{f.h}</Mono>
                  </div>
                  {media ? (
                    <a
                      className={BTN_SECONDARY}
                      href={`/creative-asset/${id}/${f.key}.${media.ext}`}
                      download={`${id}-${f.key}.${media.ext}`}
                    >
                      <DownloadSimple className="size-3.5" /> {media.ext.toUpperCase()}
                    </a>
                  ) : (
                    <Mono className="text-dim">pending</Mono>
                  )}
                </div>
                <div className="flex items-center justify-center bg-surface p-4">
                  {media?.ext === "mp4" ? (
                    <video
                      src={`/creative-asset/${id}/${f.key}.mp4`}
                      className="max-h-[420px] w-auto max-w-full rounded-md border border-border"
                      controls
                      muted
                      loop
                      playsInline
                    />
                  ) : media ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/creative-asset/${id}/${f.key}.png`}
                      alt={`${brief.id} ${f.label}`}
                      className="max-h-[420px] w-auto max-w-full rounded-md border border-border"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center">
                      <span className="font-mono text-caption text-muted">not rendered yet</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
