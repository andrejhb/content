import { listProducts } from "@/lib/products";
import { Assets } from "@/components/brand-kit/assets";
import { ProductChips } from "@/components/site/product-chips";

export const dynamic = "force-dynamic";

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const sp = await searchParams;
  const products = await listProducts();
  const active =
    products.find((p) => p.slug === sp.product)?.slug ??
    products[0]?.slug ??
    "host";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 lg:py-12">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-caption tracking-wide text-dim uppercase">
            Source assets
          </p>
          <h1 className="text-heading-2 leading-heading-2 tracking-tight text-t1">
            Assets
          </h1>
        </div>
        <ProductChips
          products={products}
          active={active}
          basePath="/assets"
          includeAll={false}
        />
      </header>
      <Assets product={active} />
    </div>
  );
}
