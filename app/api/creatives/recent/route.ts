import { listCreativesWithMeta } from "@/lib/creatives";

// Read-only feed of current creatives (+ mtime) for the Create wizard's watcher.
// Always fresh: force-dynamic + no-store, backed by a readdir.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const product = url.searchParams.get("product") || undefined;
  const creatives = await listCreativesWithMeta(product);
  return Response.json(
    { creatives },
    { headers: { "Cache-Control": "no-store" } },
  );
}
