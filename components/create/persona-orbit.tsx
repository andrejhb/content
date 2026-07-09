"use client";

import { motion, useReducedMotion } from "motion/react";
import { Plus, Info } from "@phosphor-icons/react";
import type { PersonaSummary } from "@/lib/personas";
import { PersonaAvatar } from "@/components/persona/avatar";

// Floating circular persona photos. Click a face to pick it; hover reveals a
// "details" chip that opens the overview modal. A "+" tile adds a new persona.
export function PersonaOrbit({
  personas,
  selectedId,
  onSelect,
  onDetails,
  onAdd,
  creating,
}: {
  personas: PersonaSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDetails: (id: string) => void;
  onAdd: () => void;
  creating: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-10 py-4">
      {personas.map((p, i) => (
        <motion.div
          key={p.id}
          className="group relative flex flex-col items-center gap-3"
          animate={reduce ? undefined : { y: [0, i % 2 ? -6 : 6, 0] }}
          transition={
            reduce
              ? undefined
              : {
                  duration: 4 + (i % 3),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }
          }
        >
          <button
            type="button"
            onClick={() => onSelect(p.id)}
            aria-label={`Use ${p.name}`}
            className={`relative cursor-pointer rounded-full transition-transform hover:scale-105 ${
              selectedId === p.id ? "ring-2 ring-foreground" : ""
            }`}
          >
            <PersonaAvatar name={p.name} src={p.avatar} size={88} />
          </button>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-body font-medium text-t1">{p.name}</span>
            {p.archetype || p.headline ? (
              <span className="max-w-36 truncate text-caption text-t3">
                {p.archetype ?? p.headline}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => onDetails(p.id)}
              className="mt-1 inline-flex cursor-pointer items-center gap-1 rounded-full bg-subtle px-2 py-0.5 text-caption text-t3 opacity-0 transition-opacity hover:bg-subtle-hover group-hover:opacity-100 focus-visible:opacity-100"
            >
              <Info className="size-3" /> details
            </button>
          </div>
        </motion.div>
      ))}

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onAdd}
          disabled={creating}
          aria-label="Add a new persona"
          className="flex size-[88px] cursor-pointer items-center justify-center rounded-full bg-surface text-dim transition-colors hover:bg-subtle disabled:opacity-50"
        >
          <Plus className="size-7" />
        </button>
        <span className="text-caption text-t3">
          {creating ? "adding…" : "New persona"}
        </span>
      </div>
    </div>
  );
}
