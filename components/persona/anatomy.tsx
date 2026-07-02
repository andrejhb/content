"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, PencilSimple, Plus, Sparkle, X } from "@phosphor-icons/react";
import type { PersonaDoc, PersonaSection } from "@/lib/personas";

// Persona Anatomy: fluid sectioned editor. Renders by kind (text, list,
// table) with a generic read-only fallback for unknown kinds — new sections
// and kinds need no code. Edits PUT the whole doc; the server stamps
// updatedAt and writes products/<slug>/persona.json.

const CORE_HINTS: Record<string, string> = {
  audience: "Who is this product for? Ask the engine to draft it from the marketing context.",
  jtbd: "What do they hire the product to do? The persona-refine skill can propose these.",
  pains: "What does the status quo cost them? Sharpen these with the persona-refine skill.",
  lifestyle: "How do they live and work around this product? Draft it with the engine.",
};

const BTN =
  "inline-flex h-8 items-center gap-1.5 rounded-sm border border-border bg-card px-3 font-mono text-caption text-t2 transition-colors hover:bg-subtle-hover disabled:opacity-50";

function slugifyKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function SectionBody({ section }: { section: PersonaSection }) {
  if (section.kind === "text" && typeof section.content === "string") {
    return <p className="text-body leading-body text-t2">{section.content}</p>;
  }
  if (section.kind === "list" && Array.isArray(section.content)) {
    return (
      <ul className="flex flex-col gap-2">
        {section.content.map((item, i) => (
          <li key={i} className="flex gap-2 text-body leading-body text-t2">
            <span className="text-dim">·</span>
            {item}
          </li>
        ))}
      </ul>
    );
  }
  if (section.kind === "table" && section.columns && section.rows) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-caption">
          <thead>
            <tr className="border-b border-border">
              {section.columns.map((col) => (
                <th key={col} className="py-2 pr-4 font-medium text-t3">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, i) => (
              <tr key={i} className="border-b border-border align-top last:border-0">
                {row.map((cell, j) => (
                  <td key={j} className="py-2 pr-4 text-t2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <pre className="overflow-x-auto rounded-lg bg-surface p-3 font-mono text-caption text-t2">
      {JSON.stringify(section.content ?? section, null, 2)}
    </pre>
  );
}

function SectionEditor({
  section,
  onSave,
  onCancel,
}: {
  section: PersonaSection;
  onSave: (next: PersonaSection) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(
    section.kind === "list" && Array.isArray(section.content)
      ? section.content.join("\n")
      : typeof section.content === "string"
        ? section.content
        : "",
  );
  const [rows, setRows] = useState<string[][]>(section.rows ?? []);

  const commit = () => {
    if (section.kind === "list") {
      onSave({
        ...section,
        content: text
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
      });
    } else if (section.kind === "table") {
      onSave({ ...section, rows });
    } else {
      onSave({ ...section, content: text });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {section.kind === "table" && section.columns ? (
        <div className="flex flex-col gap-3">
          {rows.map((row, i) => (
            <div key={i} className="flex flex-col gap-1.5 rounded-lg border border-border p-3">
              {section.columns!.map((col, j) => (
                <label key={j} className="flex flex-col gap-1">
                  <span className="font-mono text-caption text-dim">{col}</span>
                  <textarea
                    className="min-h-[2.25rem] w-full resize-y rounded-sm border border-border bg-surface p-2 text-caption text-t1"
                    value={row[j] ?? ""}
                    onChange={(e) => {
                      const next = rows.map((r) => [...r]);
                      next[i][j] = e.target.value;
                      setRows(next);
                    }}
                  />
                </label>
              ))}
              <button
                type="button"
                className="self-end font-mono text-caption text-dim hover:text-t1"
                onClick={() => setRows(rows.filter((_, k) => k !== i))}
              >
                remove row
              </button>
            </div>
          ))}
          <button
            type="button"
            className={BTN}
            onClick={() => setRows([...rows, section.columns!.map(() => "")])}
          >
            <Plus className="size-3.5" /> row
          </button>
        </div>
      ) : (
        <textarea
          className="min-h-36 w-full resize-y rounded-lg border border-border bg-surface p-3 text-body leading-body text-t1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={section.kind === "list" ? "One item per line" : undefined}
        />
      )}
      <div className="flex items-center gap-2">
        <button type="button" className={BTN} onClick={commit}>
          <Check className="size-3.5" /> save
        </button>
        <button type="button" className={BTN} onClick={onCancel}>
          <X className="size-3.5" /> cancel
        </button>
      </div>
    </div>
  );
}

export function PersonaAnatomy({
  slug,
  persona,
}: {
  slug: string;
  persona: PersonaDoc;
}) {
  const router = useRouter();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newKind, setNewKind] = useState<"text" | "list">("text");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const put = async (sections: PersonaSection[]) => {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/products/${slug}/persona`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version: persona.version, sections }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Save failed — the file may be read-only or the payload invalid.");
      return false;
    }
    router.refresh();
    return true;
  };

  const saveSection = async (next: PersonaSection) => {
    const sections = persona.sections.map((s) => (s.key === next.key ? next : s));
    if (await put(sections)) setEditingKey(null);
  };

  const addSection = async () => {
    const title = newTitle.trim();
    if (!title) return;
    const key = slugifyKey(title);
    if (persona.sections.some((s) => s.key === key)) {
      setError(`A "${key}" section already exists.`);
      return;
    }
    const section: PersonaSection =
      newKind === "list"
        ? { key, title, kind: "list", content: [] }
        : { key, title, kind: "text", content: "" };
    if (await put([...persona.sections, section])) {
      setAdding(false);
      setNewTitle("");
      setEditingKey(key);
    }
  };

  const missingCore = Object.keys(CORE_HINTS).filter((key) => {
    const s = persona.sections.find((x) => x.key === key);
    if (!s) return true;
    return Array.isArray(s.content) ? s.content.length === 0 : !s.content;
  });

  return (
    <div className="flex flex-col gap-4">
      {missingCore.length > 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-card px-5 py-4">
          <Sparkle className="mt-0.5 size-4 shrink-0 text-dim" />
          <div className="text-caption text-t3">
            <p className="text-t2">
              Gaps: {missingCore.map((k) => CORE_HINTS[k] && k).filter(Boolean).join(", ")}.
            </p>
            <p className="mt-1">
              Run the <span className="font-mono text-t2">persona-refine</span> skill
              with this product to draft and sharpen them, or edit directly below.
            </p>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-border bg-card px-4 py-2 text-caption text-t2">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {persona.sections.map((s) => (
          <div
            key={s.key}
            className={`rounded-xl border border-border bg-card p-5 shadow-elevation-1 ${
              s.kind === "table" ? "lg:col-span-2" : ""
            }`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-caption leading-caption font-medium tracking-wide text-t3 uppercase">
                {s.title}
              </p>
              {editingKey !== s.key ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-mono text-caption text-dim transition-colors hover:text-t1"
                  onClick={() => setEditingKey(s.key)}
                >
                  <PencilSimple className="size-3.5" /> edit
                </button>
              ) : null}
            </div>
            <div className="mt-3">
              {editingKey === s.key ? (
                <SectionEditor
                  section={s}
                  onSave={saveSection}
                  onCancel={() => setEditingKey(null)}
                />
              ) : (
                <SectionBody section={s} />
              )}
            </div>
          </div>
        ))}
      </div>

      <div>
        {adding ? (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-4">
            <input
              className="h-8 rounded-sm border border-border bg-surface px-2.5 text-caption text-t1"
              placeholder="Section title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <select
              className="h-8 rounded-sm border border-border bg-surface px-2 text-caption text-t1"
              value={newKind}
              onChange={(e) => setNewKind(e.target.value as "text" | "list")}
            >
              <option value="text">text</option>
              <option value="list">list</option>
            </select>
            <button type="button" className={BTN} onClick={addSection} disabled={saving}>
              <Check className="size-3.5" /> add
            </button>
            <button type="button" className={BTN} onClick={() => setAdding(false)}>
              <X className="size-3.5" /> cancel
            </button>
          </div>
        ) : (
          <button type="button" className={BTN} onClick={() => setAdding(true)}>
            <Plus className="size-3.5" /> add section
          </button>
        )}
      </div>

      <p className="font-mono text-caption text-dim">
        products/{slug}/persona.json · updated {persona.updatedAt.slice(0, 10)}
      </p>
    </div>
  );
}
