import type { QaResult } from "@/lib/creatives";

export function QaBadge({ qa }: { qa?: QaResult }) {
  if (!qa) {
    return (
      <span className="inline-flex items-center rounded-full bg-subtle px-2 py-0.5 font-mono text-caption text-muted">
        no QA
      </span>
    );
  }
  return (
    <span
      className={
        qa.passed
          ? "inline-flex items-center rounded-full bg-success-bg-subtle px-2 py-0.5 font-mono text-caption text-success"
          : "inline-flex items-center rounded-full bg-danger-bg-subtle px-2 py-0.5 font-mono text-caption text-danger"
      }
    >
      {qa.passed ? "QA passed" : "QA failed"}
    </span>
  );
}
