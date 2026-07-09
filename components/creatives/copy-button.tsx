"use client";

import { useState } from "react";
import { Check, CopySimple } from "@phosphor-icons/react";
import { playSound } from "@/lib/sound";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        playSound("press");
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-subtle px-3 font-mono text-caption text-t2 transition-colors hover:bg-subtle-hover"
    >
      {copied ? <Check className="size-3.5" /> : <CopySimple className="size-3.5" />}
      {copied ? "copied" : "copy"}
    </button>
  );
}
