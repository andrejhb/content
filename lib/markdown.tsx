import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Renders markdown from product-marketing.md, styled entirely with design-system
// tokens (Tailwind utilities backed by @theme). No hardcoded styling values.
const components: Components = {
  h3: ({ node, ...p }) => (
    <h3 className="mt-7 mb-2 text-heading-5 leading-heading-5 text-t1" {...p} />
  ),
  h4: ({ node, ...p }) => (
    <h4 className="mt-5 mb-2 text-heading-6 leading-heading-6 text-t1" {...p} />
  ),
  p: ({ node, ...p }) => (
    <p className="my-3 text-body leading-body text-t2" {...p} />
  ),
  strong: ({ node, ...p }) => (
    <strong className="font-semibold text-t1" {...p} />
  ),
  em: ({ node, ...p }) => <em className="text-t3 italic" {...p} />,
  ul: ({ node, ...p }) => (
    <ul
      className="my-3 flex list-disc flex-col gap-1.5 pl-5 text-body text-t2 marker:text-dim"
      {...p}
    />
  ),
  ol: ({ node, ...p }) => (
    <ol
      className="my-3 flex list-decimal flex-col gap-1.5 pl-5 text-body text-t2 marker:text-dim"
      {...p}
    />
  ),
  li: ({ node, ...p }) => <li className="pl-1 leading-body" {...p} />,
  a: ({ node, ...p }) => (
    <a
      className="text-t1 underline decoration-border underline-offset-2 transition-colors hover:decoration-t1"
      {...p}
    />
  ),
  code: ({ node, ...p }) => (
    <code
      className="rounded-sm bg-subtle px-1.5 py-0.5 font-mono text-code text-t1"
      {...p}
    />
  ),
  blockquote: ({ node, ...p }) => (
    <blockquote
      className="my-4 rounded-r-sm border-l-2 border-border bg-surface py-2 pr-3 pl-4 text-body text-t3 italic"
      {...p}
    />
  ),
  hr: () => <hr className="my-6 border-border" />,
  table: ({ node, ...p }) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-left" {...p} />
    </div>
  ),
  thead: ({ node, ...p }) => <thead className="bg-surface" {...p} />,
  th: ({ node, ...p }) => (
    <th
      className="border-b border-border px-3 py-2 align-bottom text-caption font-semibold tracking-wide text-t3 uppercase"
      {...p}
    />
  ),
  td: ({ node, ...p }) => (
    <td
      className="border-b border-subtle px-3 py-2 align-top text-body text-t2"
      {...p}
    />
  ),
};

export function Markdown({ children }: { children: string }) {
  return (
    <div className="max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
