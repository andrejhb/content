import { readdir } from "node:fs/promises";
import path from "node:path";
import { ImageSquare } from "@phosphor-icons/react/dist/ssr";
import { Card, CardLabel, Mono } from "@/components/site/kit";

const GROUPS = [
  { key: "logos", label: "Logos", hint: "SVG / PNG logo lockups and the symbol" },
  { key: "graphics", label: "Graphics", hint: "Background textures, patterns, shapes" },
  { key: "photos", label: "Photos", hint: "Lifestyle and product photography" },
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
            <ul className="mt-4 flex flex-col gap-1.5">
              {g.files.map((f) => (
                <li key={f} className="truncate text-caption text-t2">
                  {f}
                </li>
              ))}
            </ul>
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
