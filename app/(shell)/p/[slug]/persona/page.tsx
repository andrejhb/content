import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { getPersona } from "@/lib/personas";
import { PersonaAnatomy } from "@/components/persona/anatomy";

export const dynamic = "force-dynamic";

export default async function PersonaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const persona = await getPersona(slug);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header>
        <p className="font-mono text-caption tracking-wide text-dim uppercase">
          {product.name} · persona
        </p>
        <h1 className="mt-1 text-heading-3 leading-heading-3 text-t1">
          Persona anatomy
        </h1>
        <p className="mt-2 max-w-2xl text-body text-t3">
          Who this product speaks to — the benchmark generation draws on. Edit
          inline, add sections freely; the schema is fluid.
        </p>
      </header>

      <div className="mt-8">
        {!persona ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
            <p className="text-body text-t2">No persona yet.</p>
            <p className="max-w-md text-caption text-t3">
              Add <span className="font-mono">products/{slug}/persona.json</span>{" "}
              or run the persona-refine skill to draft one.
            </p>
          </div>
        ) : (
          <PersonaAnatomy slug={slug} persona={persona} />
        )}
      </div>
    </div>
  );
}
