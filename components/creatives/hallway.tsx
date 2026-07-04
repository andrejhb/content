import Link from "next/link";
import { listCreatives, renderedMedia } from "@/lib/creatives";
import { listPersonas, type PersonaSummary } from "@/lib/personas";
import { TEMPLATES } from "@/components/templates/registry";
import { QaBadge } from "@/components/creatives/qa-badge";
import { PersonaTag } from "@/components/persona/tag";
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

  // Resolve persona summaries for every product present, keyed by product:id.
  const products = [...new Set(creatives.map((b) => b.product))];
  const personaByKey = new Map<string, PersonaSummary>();
  await Promise.all(
    products.map(async (p) => {
      for (const s of await listPersonas(p)) personaByKey.set(`${p}:${s.id}`, s);
    }),
  );

  // Group by creation date, newest first (creatives already arrive sorted desc).
  // A divider row separates each date.
  type Row = (typeof withRenders)[number];
  const groups: { key: string; rows: Row[] }[] = [];
  for (const row of withRenders) {
    const key = dateKey(row.brief.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.rows.push(row);
    else groups.push({ key, rows: [row] });
  }

  const card = ({ brief, media }: Row) => {
    // Thumbnail is always a PNG: the actual render for images, the poster
    // frame for videos.
    const thumb =
      media.find((m) => m.format === "1x1")?.format ?? media[0]?.format;
    const isVideo = brief.kind === "video";
    const tpl = TEMPLATES[brief.template];
    const persona = brief.persona
      ? personaByKey.get(`${brief.product}:${brief.persona}`)
      : undefined;
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
            {brief.copy.headline ?? brief.angle}
          </p>
          <div className="mt-auto flex items-center justify-between gap-2">
            {persona ? (
              <PersonaTag name={persona.name} avatar={persona.avatar} title={persona.headline} />
            ) : (
              <span />
            )}
            <p className="shrink-0 font-mono text-caption text-dim">
              {media.length}/{brief.formats.length} formats
            </p>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      {groups.map((g) => (
        <section key={g.key} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h2 className="font-mono text-caption tracking-wide text-t3 uppercase">
              {formatDate(g.key)}
            </h2>
            <span className="font-mono text-caption text-dim">{g.rows.length}</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.rows.map(card)}
          </div>
        </section>
      ))}
    </div>
  );
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// The YYYY-MM-DD portion of an ISO timestamp, used as a stable group key.
// Parsed from the string (not via Date) so the day never shifts by timezone.
function dateKey(iso?: string): string {
  return (iso ?? "").slice(0, 10);
}

function formatDate(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  if (!y || !m || !d) return "Undated";
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
