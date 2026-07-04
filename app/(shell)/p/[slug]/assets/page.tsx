import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { Assets } from "@/components/brand-kit/assets";

export const dynamic = "force-dynamic";

export default async function AssetsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header>
        <p className="font-mono text-caption tracking-wide text-dim uppercase">
          {product.name} · assets
        </p>
        <h1 className="mt-1 text-heading-3 leading-heading-3 text-t1">
          Source assets
        </h1>
        <p className="mt-2 max-w-2xl text-body text-t3">
          The imagery creatives draw from. Product assets live in{" "}
          <span className="font-mono">products/{slug}/assets/</span>; parent-brand
          marks are shared. Drop files in and they appear here.
        </p>
      </header>

      <div className="mt-8">
        <Assets product={slug} />
      </div>
    </div>
  );
}
