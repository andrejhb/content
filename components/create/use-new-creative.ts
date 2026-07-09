"use client";

import { useEffect, useRef, useState } from "react";

export type WatchStatus = "idle" | "watching" | "found" | "timeout";

type Meta = { id: string; updatedAtMs: number };

// After the user runs the prompt in Claude Code, watch for the new creative to
// land on disk. Snapshots a baseline of ids, then polls and reports the first id
// not in the baseline (newest by mtime). ID-diff, not a timestamp, because
// createdAt is date-only. Pauses when the tab is hidden; gives up after 10 min.
export function useNewCreative(product: string | null, enabled: boolean) {
  const [status, setStatus] = useState<WatchStatus>("idle");
  const [foundId, setFoundId] = useState<string | null>(null);
  const baseline = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!enabled || !product) return;
    let live = true;
    let timer: ReturnType<typeof setInterval> | null = null;
    const startedAt = Date.now();

    async function fetchList(): Promise<Meta[]> {
      try {
        const r = await fetch(`/api/creatives/recent?product=${product}`, {
          cache: "no-store",
        });
        if (!r.ok) return [];
        const d = await r.json();
        return (d.creatives ?? []) as Meta[];
      } catch {
        return [];
      }
    }

    (async () => {
      const initial = await fetchList();
      if (!live) return;
      baseline.current = new Set(initial.map((c) => c.id));
      setStatus("watching");
      timer = setInterval(async () => {
        if (typeof document !== "undefined" && document.hidden) return;
        if (Date.now() - startedAt > 10 * 60 * 1000) {
          setStatus("timeout");
          if (timer) clearInterval(timer);
          return;
        }
        const list = await fetchList();
        if (!live || !baseline.current) return;
        const fresh = list.filter((c) => !baseline.current!.has(c.id));
        if (fresh.length > 0) {
          fresh.sort((a, b) => b.updatedAtMs - a.updatedAtMs);
          setFoundId(fresh[0].id);
          setStatus("found");
          if (timer) clearInterval(timer);
        }
      }, 2500);
    })();

    return () => {
      live = false;
      if (timer) clearInterval(timer);
    };
  }, [product, enabled]);

  return { status, foundId };
}
