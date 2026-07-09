import Link from "next/link";
import { listProducts } from "@/lib/products";
import { listPersonas } from "@/lib/personas";
import { PersonaAvatar } from "@/components/persona/avatar";
import { ProductChips } from "@/components/site/product-chips";

export const dynamic = "force-dynamic";

export default async function PersonasPage({
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
  const personas = await listPersonas(active);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10 lg:py-12">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-caption tracking-wide text-dim uppercase">
            Who we speak to
          </p>
          <h1 className="text-heading-2 leading-heading-2 tracking-tight text-t1">
            Personas
          </h1>
        </div>
        <ProductChips
          products={products}
          active={active}
          basePath="/personas"
          includeAll={false}
        />
      </header>
      {personas.length === 0 ? (
        <p className="text-body text-t3">No personas for this product yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {personas.map((p) => (
            <Link
              key={p.id}
              href={`/p/${active}/persona?persona=${p.id}`}
              title={p.headline ?? p.name}
              className="flex flex-col items-center gap-3 rounded-2xl bg-surface p-6 text-center transition-transform duration-200 hover:scale-[1.03]"
            >
              <PersonaAvatar name={p.name} src={p.avatar} size={72} />
              <div className="flex flex-col gap-0.5">
                <span className="text-body font-medium text-t1">{p.name}</span>
                {p.archetype ? (
                  <span className="text-caption text-t3">{p.archetype}</span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
