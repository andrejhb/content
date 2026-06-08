import type { ReactNode } from "react";

// Small presentational helpers shared across the brand hub. They only compose
// design-system Tailwind utilities — no new colour/spacing/font values.

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-5 shadow-elevation-1 ${className}`}
    >
      {children}
    </div>
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
