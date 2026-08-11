import type { ReactNode } from "react";
import { RemocnUIProvider, type RemocnTheme } from "@/lib/remocn-ui";
import { interVars } from "../compositions/font";
import { SCENE, mono } from "./tokens";

// The theming seam between vendored remocn components (components/remocn/,
// kept pristine so `shadcn add @remocn/<name>` can refresh them) and the
// Hububb look. Shot components import remocn components and this wrapper from
// HERE, never from components/remocn directly, so every use is themed.
//
// Two mechanisms:
// 1. remocn type components resolve their font through --font-geist-sans;
//    MotionTheme points that variable at Inter (the app face).
// 2. remocn-ui primitives (message-bubble, …) read a RemocnTheme context;
//    MotionTheme maps the Hububb mono scale onto it.

function monoTheme(dark: boolean): Partial<RemocnTheme> {
  const s = dark ? SCENE.dark : SCENE.light;
  return {
    background: s.ground,
    foreground: s.ink,
    card: s.raised,
    cardForeground: s.ink,
    primary: s.ink,
    primaryForeground: s.ground,
    secondary: dark ? mono(18) : mono(3),
    secondaryForeground: s.ink,
    muted: dark ? mono(18) : mono(3),
    mutedForeground: s.muted,
    accent: dark ? mono(18) : mono(3),
    accentForeground: s.ink,
    border: dark ? mono(17) : mono(4),
    input: dark ? mono(17) : mono(4),
    ring: s.muted,
  };
}

export function MotionTheme({
  dark,
  children,
}: {
  dark: boolean;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        ...interVars,
        fontFamily: "var(--font-inter)",
        ["--font-geist-sans" as string]: "var(--font-inter)",
      }}
    >
      <RemocnUIProvider mode={dark ? "dark" : "light"} theme={monoTheme(dark)}>
        {children}
      </RemocnUIProvider>
    </div>
  );
}

// Re-exports: the animation tier used by the shot library.
export { SoftBlurIn } from "@/components/remocn/soft-blur-in";
export { MaskRevealUp } from "@/components/remocn/mask-reveal-up";
export { PerWordCrossfade } from "@/components/remocn/per-word-crossfade";
export { StaggeredFadeUp } from "@/components/remocn/staggered-fade-up";
export { MicroScaleFade } from "@/components/remocn/micro-scale-fade";
export { BlurOutUp } from "@/components/remocn/blur-out-up";
// (typewriter and the NumberWheel wrapper are full-frame components and do
// not compose inside shots; the chat shot types inline and the stat shot
// drives Odometer directly.)
export { Odometer } from "@/components/remocn/number-wheel";
export { StrikethroughReplace } from "@/components/remocn/strikethrough-replace";
export { LogoEnter, type Logo } from "@/components/remocn/logo-enter";
export { MessageBubble } from "@/components/remocn/message-bubble";
export { TypingIndicator } from "@/components/remocn/typing-indicator";
// Transition presentations for TransitionSeries.
export { zoomBlur } from "@/components/remocn/zoom-blur";
export { pushThrough } from "@/components/remocn/push-through";
