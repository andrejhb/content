import { Sidebar } from "@/components/site/sidebar";

// Shell for every browsing surface: a quiet left rail + content. The /render
// route lives OUTSIDE this group on purpose so it stays chrome-free for Playwright.
export default function ShellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <Sidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
