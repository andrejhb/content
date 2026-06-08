import { readdir } from "node:fs/promises";
import path from "node:path";
import { ImageSquare } from "@phosphor-icons/react/dist/ssr";
import { Card, CardLabel, Mono } from "@/components/site/kit";

const GROUPS = [
  { key: "logos", label: "Logos", hint: "SVG / PNG logo lockups and the symbol" },
  { key: "photos", label: "Photos", hint: "Lifestyle photography for image cards" },
  { key: "screens", label: "Product screens", hint: "Real app screenshots for showcase creatives" },
  { key: "graphics", label: "Graphics", hint: "Background textures, patterns, shapes" },
];

const IMG = /\.(svg|png|jpe?g|webp|avif|gif)$/i;

async function listImages(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(path.join(process.cwd(), "brand", dir));
    return entries.filter((f) => IMG.test(f)).sort();
  } catch {
    return [];
  }
}

function Tile({ group, file }: { group: string; file: string }) {
  const src = `/brand-asset/${group}/${file}`;
  const isLogo = group === "logos";
  return (
    <figure className="flex flex-col gap-2">
      <div className="flex h-24 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={file}
          className={
            isLogo
              ? "site-logo max-h-full max-w-full object-contain"
              : "h-full w-full object-cover"
          }
        />
      </div>
      <Mono className="truncate">{file}</Mono>
    </figure>
  );
}

export async function Assets() {
  const groups = await Promise.all(
    GROUPS.map(async (g) => ({ ...g, files: await listImages(g.key) })),
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {groups.map((g) => (
        <Card key={g.key}>
          <div className="flex items-baseline justify-between">
            <CardLabel>{g.label}</CardLabel>
            <Mono>{g.files.length || "0"}</Mono>
          </div>

          {g.files.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {g.files.map((f) => (
                <Tile key={f} group={g.key} file={f} />
              ))}
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface px-4 py-8 text-center">
              <ImageSquare className="size-6 text-dim" />
              <p className="text-caption text-t3">{g.hint}</p>
              <Mono>brand/{g.key}/</Mono>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
