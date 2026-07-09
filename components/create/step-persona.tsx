"use client";

import { useState } from "react";
import type { PersonaDoc, PersonaSummary } from "@/lib/personas";
import { useSound } from "@/components/site/sound";
import { StepHeading } from "./create-stepper";
import { PersonaOrbit } from "./persona-orbit";
import { PersonaDetailModal } from "./persona-detail-modal";
import { PersonaCreateModal } from "./persona-create-modal";

export function StepPersona({
  product,
  personas,
  selectedId,
  onSelect,
  onCreated,
  onDeleted,
}: {
  product: string;
  personas: PersonaSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreated: (doc: PersonaDoc) => void;
  onDeleted: (id: string) => void;
}) {
  const { play } = useSound();
  const [showCreate, setShowCreate] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <StepHeading
        title="Who is it for?"
        subtitle="Pick the persona this creative speaks to, or add a new one."
      />
      {personas.length === 0 ? (
        <p className="text-center text-body text-t3">
          No personas here yet. Add one to get started.
        </p>
      ) : null}
      <PersonaOrbit
        personas={personas}
        selectedId={selectedId}
        onSelect={(id) => {
          play("advance");
          onSelect(id);
        }}
        onDetails={(id) => setDetailId(id)}
        onAdd={() => setShowCreate(true)}
        creating={false}
      />
      {showCreate ? (
        <PersonaCreateModal
          product={product}
          onClose={() => setShowCreate(false)}
          onCreated={(doc) => {
            setShowCreate(false);
            onCreated(doc);
          }}
        />
      ) : null}
      {detailId ? (
        <PersonaDetailModal
          product={product}
          personaId={detailId}
          onClose={() => setDetailId(null)}
          onUse={(id) => {
            setDetailId(null);
            play("advance");
            onSelect(id);
          }}
          onDeleted={(id) => {
            setDetailId(null);
            onDeleted(id);
          }}
        />
      ) : null}
    </div>
  );
}
