"use client";

import { useRef, useState } from "react";
import { UploadSimple, Spinner, X } from "@phosphor-icons/react";
import { useSound } from "@/components/site/sound";

// Drag/click to upload images or videos into the product's assets folder. On
// success the returned served paths are handed up so they land in the prompt.
export function AssetDrop({
  product,
  imagery,
  onImagery,
  onRemove,
}: {
  product: string;
  imagery: string[];
  onImagery: (paths: string[]) => void;
  onRemove: (path: string) => void;
}) {
  const { play } = useSound();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(list: FileList | File[]) {
    const files = Array.from(list);
    if (files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      for (const f of files) fd.append("files", f);
      const r = await fetch(`/api/products/${product}/assets`, {
        method: "POST",
        body: fd,
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error ?? "Upload failed");
        return;
      }
      onImagery(
        (d.files ?? []).map((f: { path: string }) => f.path),
      );
      play("press");
    } catch {
      setError("Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-caption font-medium tracking-wide text-t3 uppercase">
        Imagery (optional)
      </label>
      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void upload(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl px-6 py-8 text-center transition-colors ${
          dragOver ? "bg-subtle-hover" : "bg-subtle hover:bg-subtle-hover"
        }`}
      >
        {busy ? (
          <Spinner className="size-5 animate-spin text-t2" />
        ) : (
          <UploadSimple className="size-5 text-t2" />
        )}
        <p className="text-caption text-t2">
          {busy ? "Uploading…" : "Drop images or videos here, or click to choose"}
        </p>
        <p className="text-caption text-dim">
          Copied into products/{product}/assets and referenced in the prompt.
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void upload(e.target.files);
          }}
        />
      </div>
      {error ? <p className="text-caption text-danger">{error}</p> : null}
      {imagery.length ? (
        <div className="flex flex-wrap gap-2">
          {imagery.map((p) => {
            const isVid = /\.(mp4|webm|mov)$/i.test(p);
            return (
              <div
                key={p}
                className="group relative size-16 overflow-hidden rounded-xl bg-subtle"
              >
                {isVid ? (
                  <video
                    src={p}
                    muted
                    loop
                    playsInline
                    className="size-full object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p} alt="" className="size-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => onRemove(p)}
                  aria-label="Remove asset"
                  className="absolute top-1 right-1 inline-flex size-5 items-center justify-center rounded-full bg-background/80 text-t1 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="size-3" />
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
