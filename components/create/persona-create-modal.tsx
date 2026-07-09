"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { X } from "@phosphor-icons/react";
import type { PersonaDoc } from "@/lib/personas";
import { PersonaAvatar } from "@/components/persona/avatar";
import { Field } from "@/components/site/kit";
import { SHARED_AVATARS } from "@/lib/create";
import { useSound } from "@/components/site/sound";

// New-persona form: name, an optional headline, and an avatar pick. Creating does
// NOT auto-advance the wizard on its own; the caller decides (here it selects the
// new persona after it is made).
export function PersonaCreateModal({
  product,
  onClose,
  onCreated,
}: {
  product: string;
  onClose: () => void;
  onCreated: (doc: PersonaDoc) => void;
}) {
  const { play } = useSound();
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  async function create() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give the persona a name first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/products/${product}/persona`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          headline: headline.trim() || undefined,
        }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setError(d.error ?? "Could not create the persona.");
        return;
      }
      let doc = (await r.json()) as PersonaDoc;
      if (avatar && doc.profile) {
        const put = await fetch(`/api/products/${product}/persona/${doc.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...doc, profile: { ...doc.profile, avatar } }),
        });
        if (put.ok) doc = (await put.json()) as PersonaDoc;
      }
      play("advance");
      onCreated(doc);
    } catch {
      setError("Could not create the persona.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="New persona"
        className="relative z-10 flex w-full max-w-lg flex-col gap-5 overflow-hidden rounded-2xl bg-card p-6 shadow-elevation-3"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-heading-3 leading-heading-3 text-t1">New persona</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-xl bg-subtle text-t2 transition-colors hover:bg-subtle-hover"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-caption font-medium tracking-wide text-t3 uppercase">
              Name
            </span>
            <Field
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Claire Bennett"
              autoFocus
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-caption font-medium tracking-wide text-t3 uppercase">
              Headline (optional)
            </span>
            <Field
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. The scaling operator, 6 units"
            />
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-caption font-medium tracking-wide text-t3 uppercase">
            Avatar
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAvatar(null)}
              aria-label="No avatar"
              className={`rounded-full transition-transform hover:scale-105 ${
                !avatar ? "ring-2 ring-foreground" : ""
              }`}
            >
              <PersonaAvatar name={name || "New"} src={null} size={44} />
            </button>
            {SHARED_AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                aria-label="Pick avatar"
                className={`rounded-full transition-transform hover:scale-105 ${
                  avatar === a ? "ring-2 ring-foreground" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a}
                  alt=""
                  className="size-11 rounded-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {error ? <p className="text-caption text-danger">{error}</p> : null}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-caption text-t3 transition-colors hover:text-t1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={create}
            disabled={busy || !name.trim()}
            className="inline-flex h-9 cursor-pointer items-center rounded-xl bg-foreground px-4 text-body font-medium text-background transition-colors hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create persona"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
