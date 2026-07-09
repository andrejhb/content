import { listProducts } from "@/lib/products";
import { Hallway } from "@/components/creatives/hallway";
import { ProductChips } from "@/components/site/product-chips";

export const dynamic = "force-dynamic";

// Every creative, one place, tagged by product and filterable by chip.
export default async function CreativesPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const products = await listProducts();
  const active = products.find((p) => p.slug === sp.product)?.slug;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:py-12">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-caption tracking-wide text-dim uppercase">
            The hallway
          </p>
          <h1 className="text-heading-2 leading-heading-2 tracking-tight text-t1">
            Creatives
          </h1>
        </div>
        <ProductChips products={products} active={active} basePath="/creatives" />
      </header>
      <div className="mt-8">
        <Hallway product={active} query={sp.q} />
      </div>
    </div>
  );
}
