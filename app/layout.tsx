import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@hububb/design-system/tooltip";
import "./globals.css";

// The design system's type system is built on Inter. Self-host it so the DS
// font tokens resolve and renders are deterministic (see globals.css).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hububb marketing engine",
  description:
    "Multi-product marketing engine for Hububb — brand hub, personas, and on-brand creative generation powered by @hububb/design-system.",
  // Preview surface: keep it out of search until it goes live.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full`}
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        {/* Light is the engine's palette; forcedTheme pins it regardless of the
            OS setting (the DS provider hardcodes defaultTheme="system"). */}
        <ThemeProvider attribute="class" forcedTheme="light" disableTransitionOnChange>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
