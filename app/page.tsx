import { redirect } from "next/navigation";
import { listProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

// The engine opens on the first product's creatives space.
export default async function Home() {
  const products = await listProducts();
  redirect(`/p/${products[0]?.slug ?? "host"}/creatives`);
}
