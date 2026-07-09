import { listProducts } from "@/lib/products";
import { listPrompts } from "@/lib/prompts";
import { getSections } from "@/lib/brand";
import { extractOneLiner } from "@/lib/create";
import { CreateWizard } from "@/components/create/create-wizard";

export const dynamic = "force-dynamic";

// The guided Create flow: product -> persona -> content type -> a prefilled
// prompt to hand to Claude Code. A prompt builder, not a generator: the app
// cannot run Claude Code, so it assembles the prompt and (Stage 2 auto-populate)
// watches for the rendered result.
export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const sp = await searchParams;
  const products = await listProducts();
  const prompts = await listPrompts();
  const promptBodies: Record<string, string> = {};
  for (const p of prompts) promptBodies[p.key] = p.body;
  const initialProduct =
    products.find((p) => p.slug === sp.product)?.slug ?? null;

  // One-line pitch per product, pulled from each product-marketing.md, to inline
  // in the generated prompt (the engine reads the full doc for the rest).
  const oneLiners: Record<string, string> = {};
  await Promise.all(
    products.map(async (p) => {
      const [overview] = await getSections(p.slug, ["Product Overview"]);
      const ol = overview ? extractOneLiner(overview.body) : "";
      if (ol) oneLiners[p.slug] = ol;
    }),
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <CreateWizard
        products={products}
        promptBodies={promptBodies}
        oneLiners={oneLiners}
        initialProduct={initialProduct}
      />
    </div>
  );
}
