import { loadFont } from "@remotion/google-fonts/Inter";

// The design-system token chain resolves --font-sans → var(--font-inter).
// In the app next/font provides --font-inter; in Remotion we load the same
// face from Google Fonts and hand its family to the composition wrapper.
const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const interVars = {
  "--font-inter": fontFamily,
} as React.CSSProperties;
