import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  divided = false,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  // Off by default: hierarchy + spacing separate the header. Opt in to a single
  // hairline only where a hard rule genuinely helps.
  divided?: boolean;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <header className={divided ? "border-b border-subtle pb-4" : "pb-1"}>
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
