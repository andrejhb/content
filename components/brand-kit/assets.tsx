import { Card, CardLabel, Mono } from "@/components/site/kit";
import { listProductAssets, listSharedAssets } from "@/lib/assets";

// Display metadata for known groups; unknown folders still render with
// a title-cased label so new groups need no code.
const GROUP_META: Record<string, { label: string; hint: string }> = {
  logos: { label: "Logos", hint: "Hububb symbol + wordmark" },
  mockups: { label: "Phone mockups", hint: "Phone-in-scene marketing shots" },
  screens: { label: "Product screens", hint: "Real app screenshots" },
  channels: { label: "Channels & tools", hint: "Channel, PMS, and messaging logos" },
  photos: { label: "Photos", hint: "Lifestyle photography for image cards" },
  graphics: { label: "Graphics", hint: "Background textures, patterns, shapes" },
};

function labelFor(key: string): { label: string; hint: string } {
  return (
    GROUP_META[key] ?? {
      label: key.charAt(0).toUpperCase() + key.slice(1),
      hint: "Drop files in and they appear here.",
    }
  );
}

function Tile({ scope, group, file }: { scope: string; group: string; file: string }) {
  const src = `/asset/${scope}/${group}/${file}`;
  const isVideo = /\.(mp4|webm|mov)$/i.test(file);
  return (
    <figure className="flex flex-col gap-2">
      <div className="flex h-24 items-center justify-center overflow-hidden rounded-2xl bg-subtle p-4">
        {isVideo ? (
          <video
            src={src}
            muted
            loop
            playsInline
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={file}
            className={
              group === "logos"
                ? "site-logo max-h-full max-w-full object-contain"
                : group === "photos"
                  ? "h-full w-full object-cover"
                  : "max-h-full max-w-full object-contain"
            }
          />
        )}
      </div>
      <Mono className="truncate">{file}</Mono>
    </figure>
  );
}

export async function Assets({ product }: { product: string }) {
  const [productGroups, sharedGroups] = await Promise.all([
    listProductAssets(product),
    listSharedAssets(),
  ]);

  // Only present groups that have an asset behind them. Empty groups are hidden
  // rather than shown as blank frames or placeholders.
  const groups = [
    ...productGroups.map((g) => ({ ...g, scope: product })),
    ...sharedGroups.map((g) => ({ ...g, scope: "shared" })),
  ].filter((g) => g.files.length > 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {groups.map((g) => {
        const meta = labelFor(g.key);
        return (
          <Card key={`${g.scope}/${g.key}`}>
            <div className="flex items-baseline justify-between">
              <CardLabel>
                {meta.label}
                {g.scope === "shared" ? " · shared" : ""}
              </CardLabel>
              <Mono>{g.files.length}</Mono>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {g.files.map((f) => (
                <Tile key={f} scope={g.scope} group={g.key} file={f} />
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
