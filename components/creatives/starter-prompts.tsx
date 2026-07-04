import { listPrompts, fillPrompt } from "@/lib/prompts";
import { CardLabel, Mono } from "@/components/site/kit";
import { CopyButton } from "@/components/creatives/copy-button";

// Framework prompts from prompts/*.md, interpolated to the active product.
// Collapsed by default — a base to copy into a generation session, not UI.
export async function StarterPrompts({ product }: { product: string }) {
  const prompts = await listPrompts();
  if (prompts.length === 0) return null;

  return (
    <details className="rounded-xl border border-border bg-card shadow-elevation-1">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 [&::-webkit-details-marker]:hidden">
        <CardLabel>Starter prompts</CardLabel>
        <Mono>{prompts.length}</Mono>
      </summary>
      <div className="flex flex-col gap-5 border-t border-border p-5">
        {prompts.map((p) => {
          const text = fillPrompt(p.body, product);
          return (
            <div key={p.key} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-body font-medium text-t1">{p.title}</p>
                <CopyButton text={text} />
              </div>
              <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-caption leading-relaxed whitespace-pre-wrap text-t2">
                {text}
              </pre>
            </div>
          );
        })}
      </div>
    </details>
  );
}
