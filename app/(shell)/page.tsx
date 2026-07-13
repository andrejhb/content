import Link from "next/link";
import { listCreatives, creativeThumb } from "@/lib/creatives";
import { CreateButton } from "@/components/create/create-button";

export const dynamic = "force-dynamic";

// The front door: one clear action, front and centre, with a narrow strip of
// recent work below. Everything else is quiet.
export default async function Home() {
  const creatives = (await listCreatives()).slice(0, 8);
  const recent = await Promise.all(
    creatives.map(async (b) => ({
      id: b.id,
      headline: b.copy.headline ?? b.angle,
      thumb: await creativeThumb(b),
    })),
  );

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-16 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700">
      <div className="flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-body text-dim">Hububb Marketing Engine</p>
          <h1 className="max-w-xl text-heading-1 leading-heading-1 font-normal tracking-tight text-t2">
            What are we making?
          </h1>
        </div>
        <CreateButton variant="hero" />
      </div>

      {recent.length ? (
        <section className="mt-24 flex w-full max-w-3xl flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-caption tracking-wide text-dim uppercase">
              Recent
            </span>
            <Link
              href="/creatives"
              className="text-caption text-t3 transition-colors hover:text-t1"
            >
              All creatives
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {recent.map((r) => (
              <Link
                key={r.id}
                href={`/creative/${r.id}`}
                title={r.headline}
                className="overflow-hidden rounded-2xl bg-surface transition-transform duration-200 ease-out hover:scale-105"
              >
                <div className="flex aspect-square items-center justify-center overflow-hidden bg-subtle">
                  {r.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.thumb}
                      alt={r.headline}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="p-2 text-center font-mono text-caption text-muted">
                      not rendered
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
