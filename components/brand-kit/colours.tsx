import { colorFamilies, lightTheme } from "@/lib/tokens";
import { Card, CardLabel, Mono } from "@/components/site/kit";

// Colour families + the semantic layer, rendered live from the token catalog.
// Swatch fills are the token hex values themselves (data, not hardcoded styling).

function ScaleStrip({ scale }: { scale: { step: number; hex: string }[] }) {
  return (
    <div className="flex h-10 overflow-hidden rounded-md border border-border">
      {scale.map((s) => (
        <div key={s.step} className="flex-1" style={{ backgroundColor: s.hex }} title={`${s.step} · ${s.hex}`} />
      ))}
    </div>
  );
}

const SEMANTIC_GROUPS: { key: keyof typeof lightTheme; label: string }[] = [
  { key: "action", label: "Action" },
  { key: "surface", label: "Surface" },
  { key: "text", label: "Text" },
  { key: "border", label: "Border" },
  { key: "feedback", label: "Feedback" },
  { key: "nav", label: "Nav" },
];

function SwatchRow({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="size-5 shrink-0 rounded-md border border-border"
        style={{ backgroundColor: hex }}
      />
      <span className="truncate text-caption text-t2">{name}</span>
      <Mono className="ml-auto shrink-0">{hex}</Mono>
    </div>
  );
}

export function Colours() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {colorFamilies.map((fam) => (
          <Card key={fam.name}>
            <div className="flex items-baseline justify-between">
              <h3 className="text-body-lg font-semibold text-t1">{fam.name}</h3>
              <Mono>{fam.scale.length} steps</Mono>
            </div>
            <div className="mt-3">
              <ScaleStrip scale={fam.scale} />
            </div>
            {fam.semantic.length > 0 ? (
              <div className="mt-4 flex flex-col gap-1.5">
                {fam.semantic.slice(0, 5).map((sem) => (
                  <SwatchRow key={sem.token} name={sem.token} hex={sem.hex} />
                ))}
              </div>
            ) : null}
          </Card>
        ))}
      </div>

      <div>
        <CardLabel className="mb-3">Semantic layer · what components consume (light)</CardLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SEMANTIC_GROUPS.map(({ key, label }) => {
            const group = lightTheme[key];
            return (
              <Card key={key}>
                <CardLabel>{label}</CardLabel>
                <div className="mt-3 flex flex-col gap-1.5">
                  {Object.entries(group).map(([name, hex]) => (
                    <SwatchRow key={name} name={name} hex={hex} />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
