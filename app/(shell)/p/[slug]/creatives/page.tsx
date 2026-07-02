import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { Hallway } from "@/components/creatives/hallway";
import { StarterPrompts } from "@/components/creatives/starter-prompts";

export const dynamic = "force-dynamic";

export default async function CreativesPage({
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
          {product.name} · creatives
        </p>
        <h1 className="mt-1 text-heading-3 leading-heading-3 text-t1">
          The hallway
        </h1>
        <p className="mt-2 max-w-2xl text-body text-t3">
          Every {product.name} creative, newest first. Click into one to review
          its formats and download.
        </p>
      </header>

      <div className="mt-6">
        <StarterPrompts product={slug} />
      </div>

      <div className="mt-6">
        <Hallway product={slug} />
      </div>
    </div>
  );
}
