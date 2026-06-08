import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ThemeProvider from "@hububb/design-system/theme-provider";
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
  title: "Hububb content engine",
  description:
    "Brand hub and on-brand creative engine for Hububb Host — powered by @hububb/design-system.",
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
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
