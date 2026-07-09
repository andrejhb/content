import { typeRoles } from "@/lib/tokens";
import { Mono } from "@/components/site/kit";

// Literal class maps so Tailwind's source scanner generates these utilities
// (dynamic `text-${name}` strings would never be detected).
const TYPE_CLASS: Record<string, string> = {
  "display-1": "text-display-1 leading-display-1",
  "display-2": "text-display-2 leading-display-2",
  "heading-1": "text-heading-1 leading-heading-1",
  "heading-2": "text-heading-2 leading-heading-2",
  "heading-3": "text-heading-3 leading-heading-3",
  "heading-4": "text-heading-4 leading-heading-4",
  "heading-5": "text-heading-5 leading-heading-5",
  "heading-6": "text-heading-6 leading-heading-6",
  "body-lg": "text-body-lg leading-body-lg",
  body: "text-body leading-body",
  caption: "text-caption leading-caption",
  code: "text-code leading-code font-mono",
};

const WEIGHT_CLASS: Record<number, string> = {
  400: "font-normal",
  500: "font-medium",
  600: "font-semibold",
  700: "font-bold",
};

const SAMPLE = "Built for the hard part";

function pxRange(min: number, max: number): string {
  const lo = Math.round(min);
  const hi = Math.round(max);
  return lo === hi ? `${lo}px` : `${lo}–${hi}px`;
}

export function Typography() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-surface divide-y divide-subtle">
      {typeRoles.map((role) => (
        <div
          key={role.name}
          className="grid grid-cols-1 gap-3 px-5 py-5 sm:grid-cols-[180px_1fr] sm:items-center"
        >
          <div className="flex flex-col gap-1">
            <Mono className="text-t2">text-{role.name}</Mono>
            <p className="text-caption text-dim">
              {role.weight} · {pxRange(role.appMin, role.appMax)} · lh {role.lineHeight} · {role.family}
            </p>
          </div>
          <div
            className={`min-w-0 overflow-hidden text-t1 ${TYPE_CLASS[role.name] ?? "text-body"} ${WEIGHT_CLASS[role.weight] ?? "font-normal"}`}
          >
            <span className="line-clamp-2 break-words">{SAMPLE}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
