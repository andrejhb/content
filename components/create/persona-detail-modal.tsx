"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { X } from "@phosphor-icons/react";
import type { PersonaDoc, PersonaSection } from "@/lib/personas";
import { PersonaAvatar } from "@/components/persona/avatar";

function renderSection(s: PersonaSection) {
  if (s.kind === "list" && Array.isArray(s.content))
    return (
      <ul className="flex list-disc flex-col gap-1 pl-4">
        {s.content.map((c, i) => (
          <li key={i} className="text-body leading-body text-t2">
            {c}
          </li>
        ))}
      </ul>
    );
  if (typeof s.content === "string")
    return <p className="text-body leading-body text-t2">{s.content}</p>;
  return null;
}

// Overview modal for a persona: profile + sections (read), with a link into the
// full editor and a "Use this persona" action. Minimal but accessible (Escape +
// backdrop close, dialog role).
export function PersonaDetailModal({
  product,
  personaId,
  onClose,
  onUse,
  onDeleted,
}: {
  product: string;
  personaId: string;
  onClose: () => void;
  onUse: (id: string) => void;
  onDeleted: (id: string) => void;
}) {
  const [doc, setDoc] = useState<PersonaDoc | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function del() {
    if (!confirming) {
      setConfirming(true); // first click arms the confirm, second click deletes
      return;
    }
    setDeleting(true);
    try {
      const r = await fetch(`/api/products/${product}/persona/${personaId}`, {
        method: "DELETE",
      });
      if (r.ok) onDeleted(personaId);
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    let live = true;
    fetch(`/api/products/${product}/persona/${personaId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (live) setDoc(d);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [product, personaId]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

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
        aria-label="Persona details"
        className="relative z-10 flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-card shadow-elevation-3"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 inline-flex size-8 cursor-pointer items-center justify-center rounded-xl bg-subtle text-t2 transition-colors hover:bg-subtle-hover"
        >
          <X className="size-4" />
        </button>

        <div className="overflow-y-auto p-6">
          {!doc || !doc.profile ? (
            <p className="text-caption text-dim">Loading…</p>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <PersonaAvatar
                  name={doc.profile.name}
                  src={doc.profile.avatar}
                  size={64}
                />
                <div className="flex min-w-0 flex-col">
                  <span className="text-heading-3 leading-heading-3 text-t1">
                    {doc.profile.name}
                  </span>
                  {doc.profile.headline ? (
                    <span className="text-body text-t3">
                      {doc.profile.headline}
                    </span>
                  ) : null}
                  {doc.profile.location ? (
                    <span className="text-caption text-dim">
                      {doc.profile.location}
                    </span>
                  ) : null}
                </div>
              </div>
              {doc.profile.bio ? (
                <p className="text-body leading-body text-t2">
                  {doc.profile.bio}
                </p>
              ) : null}
              {doc.sections?.length ? (
                <div className="flex flex-col gap-4">
                  {doc.sections.map((s) => (
                    <div key={s.key} className="flex flex-col gap-1.5">
                      <span className="text-caption font-medium tracking-wide text-t3 uppercase">
                        {s.title}
                      </span>
                      {renderSection(s)}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 bg-surface px-6 py-4">
          <button
            type="button"
            onClick={del}
            disabled={deleting}
            className={`cursor-pointer text-caption transition-colors ${
              confirming ? "font-medium text-danger" : "text-t3 hover:text-danger"
            }`}
          >
            {deleting ? "Deleting…" : confirming ? "Confirm delete?" : "Delete"}
          </button>
          <div className="flex items-center gap-3">
            <Link
              href={`/p/${product}/persona?persona=${personaId}`}
              className="text-caption text-t3 underline-offset-2 hover:underline"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => onUse(personaId)}
              className="inline-flex h-9 cursor-pointer items-center rounded-xl bg-foreground px-4 text-body font-medium text-background transition-colors hover:bg-action-hover"
            >
              Use this persona
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
