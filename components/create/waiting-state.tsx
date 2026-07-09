"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@phosphor-icons/react";
import { useNewCreative } from "./use-new-creative";
import { useSound } from "@/components/site/sound";

// After the prompt is handed to Claude Code, watch for the rendered creative and
// jump to it when it lands. Opt-in (the user confirms they ran it) so the poll
// only runs when it should.
export function WaitingState({ product }: { product: string }) {
  const router = useRouter();
  const { play } = useSound();
  const [watching, setWatching] = useState(false);
  const { status, foundId } = useNewCreative(product, watching);

  useEffect(() => {
    if (status === "found" && foundId) {
      play("success");
      const t = setTimeout(() => router.push(`/creative/${foundId}`), 900);
      return () => clearTimeout(t);
    }
  }, [status, foundId, play, router]);

  if (status === "found")
    return (
      <p className="text-caption font-medium text-success">
        Your creative is ready. Opening…
      </p>
    );

  if (status === "timeout")
    return (
      <p className="text-caption text-t3">
        Still waiting. It will appear in the{" "}
        <a
          href={`/p/${product}/creatives`}
          className="underline underline-offset-2"
        >
          gallery
        </a>{" "}
        once rendered.
      </p>
    );

  if (watching)
    return (
      <p className="inline-flex items-center gap-2 text-caption text-t3">
        <Spinner className="size-4 animate-spin" /> Watching for your new
        creative…
      </p>
    );

  return (
    <button
      type="button"
      onClick={() => setWatching(true)}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-subtle px-3 py-1.5 text-caption font-medium text-t2 transition-colors hover:bg-subtle-hover"
    >
      I ran it, watch for the result
    </button>
  );
}
