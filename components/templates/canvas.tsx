import type { CSSProperties, ReactNode } from "react";

// Fixed-size creative canvas. The render route mounts this at exact pixels and
// Playwright screenshots the [data-canvas] element; the detail screen scales it
// down. Templates use the design system's FIXED mono scale (bg-mono-*, text-mono-*)
// rather than the theme-flipping semantic tokens, so the PNG matches the preview
// regardless of the viewer's light/dark setting.
export function CreativeCanvas({
  w,
  h,
  children,
  className = "",
  style,
}: {
  w: number;
  h: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      data-canvas
      style={{ width: w, height: h, ...style }}
      className={`relative overflow-hidden font-sans ${className}`}
    >
      {children}
    </div>
  );
}

// Small quiet pill for an allowlisted proof claim (copy.proof). Sized by the
// caller so it tracks each template's own type scale.
export function ProofChip({
  text,
  fontSize,
  invert = false,
}: {
  text: string;
  fontSize: number;
  invert?: boolean;
}) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border font-mono ${
        invert ? "border-mono-16 text-mono-5" : "border-mono-5 text-mono-11"
      }`}
      style={{
        fontSize,
        letterSpacing: "0.01em",
        paddingLeft: Math.round(fontSize * 1.1),
        paddingRight: Math.round(fontSize * 1.1),
        paddingTop: Math.round(fontSize * 0.5),
        paddingBottom: Math.round(fontSize * 0.5),
      }}
    >
      {text}
    </span>
  );
}

export function BrandMark({
  height,
  invert = false,
  variant = "wordmark",
}: {
  height: number;
  invert?: boolean;
  variant?: "wordmark" | "symbol";
}) {
  const src =
    variant === "symbol"
      ? "/asset/shared/logos/hububb-symbol.svg"
      : "/asset/shared/logos/hububb-wordmark.svg";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Hububb"
      style={{
        height,
        width: "auto",
        filter: invert ? "brightness(0) invert(1)" : undefined,
      }}
    />
  );
}
