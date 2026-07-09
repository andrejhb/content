import { tokens, spacingScale } from "@/lib/tokens";
import { Card, CardLabel, Mono } from "@/components/site/kit";

function tokenEntries(node: unknown): [string, string][] {
  if (!node || typeof node !== "object") return [];
  return Object.entries(node as Record<string, unknown>)
    .filter(([k]) => !k.startsWith("$"))
    .map(([k, v]) => [k, String((v as { $value?: unknown })?.$value ?? "")]);
}

const RADIUS_CLASS: Record<string, string> = {
  none: "rounded-none",
  xs: "rounded-xs",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
  "4xl": "rounded-4xl",
  full: "rounded-full",
};

const ELEVATION_CLASS = [
  "shadow-elevation-1",
  "shadow-elevation-2",
  "shadow-elevation-3",
  "shadow-elevation-4",
  "shadow-elevation-5",
];

export function Foundations() {
  const t = tokens as unknown as Record<string, unknown>;
  const radii = tokenEntries(t.radius);
  const motion = (t.motion ?? {}) as Record<string, unknown>;
  const durations = tokenEntries(motion.duration);
  const easings = tokenEntries(motion.easing);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Radius */}
      <Card>
        <CardLabel>Radius</CardLabel>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {radii.map(([name, value]) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <div
                className={`size-14 bg-subtle ${RADIUS_CLASS[name] ?? "rounded-none"}`}
              />
              <div className="text-center">
                <Mono className="text-t2">{name}</Mono>
                <p className="text-caption text-dim">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Elevation */}
      <Card>
        <CardLabel>Elevation</CardLabel>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {ELEVATION_CLASS.map((cls, i) => (
            <div key={cls} className="flex flex-col items-center gap-2">
              <div className={`size-14 rounded-2xl bg-card ${cls}`} />
              <Mono className="text-t2">elevation-{i + 1}</Mono>
            </div>
          ))}
        </div>
      </Card>

      {/* Spacing */}
      <Card>
        <CardLabel>Spacing · 4px base</CardLabel>
        <div className="mt-4 flex flex-col gap-1.5">
          {spacingScale.slice(0, 16).map((s) => (
            <div key={s.step} className="flex items-center gap-3">
              <Mono className="w-6 shrink-0 text-right text-t2">{s.step}</Mono>
              <div
                className="h-3 rounded-xs bg-foreground"
                style={{ width: Math.min(s.px, 320) }}
              />
              <span className="text-caption text-dim">{s.px}px</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Motion */}
      <Card>
        <CardLabel>Motion</CardLabel>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <p className="text-caption text-t3">Duration</p>
            {durations.map(([name, value]) => (
              <div key={name} className="flex items-center justify-between gap-2">
                <Mono className="text-t2">{name}</Mono>
                <span className="text-caption text-dim">{value}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-caption text-t3">Easing</p>
            {easings.map(([name, value]) => (
              <div key={name} className="flex flex-col">
                <Mono className="text-t2">{name}</Mono>
                <span className="truncate text-caption text-dim">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
