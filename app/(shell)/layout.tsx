import { listProducts } from "@/lib/products";
import { Sidebar } from "@/components/site/sidebar";

// Shell for every browsing surface: sidebar + content. The /render route lives
// OUTSIDE this group on purpose — it must stay chrome-free for Playwright.
export default async function ShellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const products = await listProducts();
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <Sidebar products={products} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
