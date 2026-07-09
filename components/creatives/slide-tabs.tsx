"use client";

import { useState } from "react";
import { DownloadSimple } from "@phosphor-icons/react";
import { VIDEO_FORMAT_MAP } from "@/lib/formats";

export type SlideView = {
  index: number; // 1-based
  label: string;
  media: { format: string; ext: "png" | "mp4" }[];
};

const BTN_SECONDARY =
  "inline-flex h-8 items-center gap-1.5 rounded-xl bg-subtle px-3 text-caption font-medium text-foreground transition-colors hover:bg-subtle-hover";

export function SlideTabs({ id, slides }: { id: string; slides: SlideView[] }) {
  const [active, setActive] = useState(slides[0]?.index ?? 1);
  const slide = slides.find((s) => s.index === active) ?? slides[0];
  if (!slide) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {slides.map((s) => {
          const on = s.index === active;
          return (
            <button
              key={s.index}
              type="button"
              onClick={() => setActive(s.index)}
              className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-caption transition-colors ${
                on
                  ? "bg-foreground text-background"
                  : "bg-subtle text-t2 hover:bg-subtle-hover"
              }`}
            >
              <span className="font-mono">Slide {s.index}</span>
              <span className={on ? "text-background/80" : "text-dim"}>{s.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {slide.media.map((m) => {
          const f = VIDEO_FORMAT_MAP[m.format];
          const base = `/creative-asset/${id}/s${slide.index}-${m.format}`;
          return (
            <div
              key={m.format}
              className="flex flex-col overflow-hidden rounded-2xl bg-surface"
            >
              <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-body font-semibold text-t1">{f?.label ?? m.format}</span>
                  <span className="font-mono text-caption text-dim">
                    {f ? `${f.w}×${f.h}` : ""}
                  </span>
                </div>
                <a className={BTN_SECONDARY} href={`${base}.${m.ext}`} download={`${id}-s${slide.index}-${m.format}.${m.ext}`}>
                  <DownloadSimple className="size-3.5" /> {m.ext.toUpperCase()}
                </a>
              </div>
              <div className="flex items-center justify-center bg-subtle p-4">
                {m.ext === "mp4" ? (
                  <video
                    src={`${base}.mp4`}
                    poster={`${base}.png`}
                    className="max-h-[460px] w-auto max-w-full rounded-xl"
                    controls
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${base}.png`}
                    alt={`Slide ${slide.index} ${m.format}`}
                    className="max-h-[460px] w-auto max-w-full rounded-xl"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
