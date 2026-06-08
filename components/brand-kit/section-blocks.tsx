import type { BrandSection } from "@/lib/brand";
import { Markdown } from "@/lib/markdown";

// Renders a list of product-marketing.md sections as titled blocks. Used for
// Brand core and Brand voice — content is derived from the file, never typed.
export function SectionBlocks({ sections }: { sections: BrandSection[] }) {
  return (
    <div className="flex flex-col gap-px overflow-hidden rounded-xl border border-border bg-border">
      {sections.map((s) => (
        <article key={s.slug} id={`brand-${s.slug}`} className="scroll-mt-24 bg-card p-5 sm:p-6">
          <h3 className="text-heading-4 leading-heading-4 text-t1">{s.title}</h3>
          <div className="mt-2">
            <Markdown>{s.body}</Markdown>
          </div>
        </article>
      ))}
    </div>
  );
}
