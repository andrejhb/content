import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { BrandKit } from "@/components/brand-kit/brand-kit";
import { SkillsList } from "@/components/skills/skills-list";

export const dynamic = "force-dynamic";

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <div>
      <BrandKit product={slug} />

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="font-mono text-caption tracking-wide text-dim uppercase">
            Skills
          </p>
          <h2 className="mt-1 text-heading-3 leading-heading-3 text-t1">
            Generation skills
          </h2>
          <p className="mt-2 max-w-2xl text-body text-t3">
            Every available skill — the installed marketing skills plus the
            engine&apos;s own — read live from the skills directory.
          </p>
          <div className="mt-6">
            <SkillsList />
          </div>
        </div>
      </section>
    </div>
  );
}
