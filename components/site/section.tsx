import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <header className="border-b border-border pb-4">
        {eyebrow ? (
          <p className="font-mono text-caption tracking-wide text-dim uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-heading-3 leading-heading-3 text-t1">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-body leading-body text-t3">
            {description}
          </p>
        ) : null}
      </header>
      <div className="mt-6">{children}</div>
    </section>
  );
}
