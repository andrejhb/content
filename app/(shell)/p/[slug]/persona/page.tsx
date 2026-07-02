import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { getPersona } from "@/lib/personas";
import { Card, CardLabel } from "@/components/site/kit";

export const dynamic = "force-dynamic";

// Read-only placeholder until the Persona Anatomy phase lands the editor.
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
          Who this product speaks to — the benchmark generation draws on.
        </p>
      </header>

      {!persona ? (
        <div className="mt-8 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <p className="text-body text-t2">No persona yet.</p>
          <p className="max-w-md text-caption text-t3">
            Add <span className="font-mono">products/{slug}/persona.json</span>{" "}
            or run the persona-refine skill to draft one.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {persona.sections.map((s) => (
            <Card key={s.key} className={s.kind === "table" ? "lg:col-span-2" : ""}>
              <CardLabel>{s.title}</CardLabel>
              <div className="mt-3">
                {s.kind === "text" && typeof s.content === "string" ? (
                  <p className="text-body leading-body text-t2">{s.content}</p>
                ) : s.kind === "list" && Array.isArray(s.content) ? (
                  <ul className="flex flex-col gap-2">
                    {s.content.map((item, i) => (
                      <li key={i} className="flex gap-2 text-body leading-body text-t2">
                        <span className="text-dim">·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : s.kind === "table" && s.columns && s.rows ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-caption">
                      <thead>
                        <tr className="border-b border-border">
                          {s.columns.map((col) => (
                            <th key={col} className="py-2 pr-4 font-medium text-t3">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {s.rows.map((row, i) => (
                          <tr key={i} className="border-b border-border last:border-0 align-top">
                            {row.map((cell, j) => (
                              <td key={j} className="py-2 pr-4 text-t2">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <pre className="overflow-x-auto rounded-lg bg-surface p-3 font-mono text-caption text-t2">
                    {JSON.stringify(s.content ?? s, null, 2)}
                  </pre>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
