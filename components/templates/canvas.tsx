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
      ? "/asset/logos/hububb-symbol.svg"
      : "/asset/logos/hububb-wordmark.svg";
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
