import type {
  ReactNode,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

// Small presentational helpers shared across the app. They only compose
// design-system Tailwind utilities, no new colour/spacing/font values.
// Separation is by fill and spacing (background -> surface -> card), not borders:
// in light mode `card` is white like the page, so a border was the only thing
// separating it; `surface` separates on its own.

export function Card({
  children,
  className = "",
  tone = "quiet",
  elevated = false,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  // quiet: bg-surface, sits on the page background. raised: bg-card, sits on a surface field.
  tone?: "quiet" | "raised";
  elevated?: boolean;
  interactive?: boolean;
}) {
  const fill = tone === "raised" ? "bg-card" : "bg-surface";
  const lift = elevated ? "shadow-elevation-1" : "";
  const hover = interactive
    ? "cursor-pointer transition-colors hover:bg-subtle"
    : "";
  return (
    <div className={`rounded-2xl p-5 ${fill} ${lift} ${hover} ${className}`}>
      {children}
    </div>
  );
}

// Fill-based input, borderless. Focus deepens the fill instead of drawing a ring.
export function Field({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-8 w-full rounded-xl bg-subtle px-2.5 text-caption text-t1 outline-none transition-colors placeholder:text-dim focus:bg-subtle-hover ${className}`}
      {...props}
    />
  );
}

export function TextArea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-xl bg-subtle px-2.5 py-2 text-caption leading-body text-t1 outline-none transition-colors placeholder:text-dim focus:bg-subtle-hover ${className}`}
      {...props}
    />
  );
}

// Borderless status/label pill. Pass a fill/text class to recolour (e.g. QA states).
export function Pill({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-subtle px-2.5 py-0.5 text-caption text-t2 ${className}`}
    >
      {children}
    </span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-caption tracking-wide text-dim uppercase">
      {children}
    </p>
  );
}

export function Mono({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`font-mono text-caption text-muted ${className}`}>
      {children}
    </span>
  );
}

export function CardLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-caption leading-caption font-medium tracking-wide text-t3 uppercase ${className}`}
    >
      {children}
    </p>
  );
}
