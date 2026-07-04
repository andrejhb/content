import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { getPersonas } from "@/lib/personas";
import { Personas } from "@/components/persona/personas";

export const dynamic = "force-dynamic";

export default async function PersonaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ persona?: string }>;
}) {
  const { slug } = await params;
  const { persona: activeId } = await searchParams;
  const product = await getProduct(slug);
  if (!product) notFound();

  const personas = await getPersonas(slug);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-8">
        <p className="font-mono text-caption tracking-wide text-dim uppercase">
          {product.name} · personas
        </p>
        <h1 className="mt-1 text-heading-3 leading-heading-3 text-t1">
          Personas
        </h1>
        <p className="mt-2 max-w-2xl text-body text-t3">
          The real humans this product speaks to — the benchmark generation draws
          on. Switch between them, edit the profile and sections inline, and add
          as many as you need.
        </p>
      </header>

      <Personas slug={slug} personas={personas} initialId={activeId} />
    </div>
  );
}
