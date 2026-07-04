"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  MapPin,
  PencilSimple,
  Plus,
  Sparkle,
  Trash,
  Warning,
  X,
} from "@phosphor-icons/react";
import type {
  PersonaDoc,
  PersonaFact,
  PersonaProfile,
  PersonaPrompt,
  PersonaSection,
} from "@/lib/personas";
import { PersonaAvatar } from "@/components/persona/avatar";
import { CopyButton } from "@/components/creatives/copy-button";
import { BTN, SectionsEditor } from "@/components/persona/anatomy";

// Single-page persona switcher: a tab per persona plus "add", the selected
// persona's profile header (cover, avatar, name, headline, location, bio,
// fact chips), and its sections body below. Selection is mirrored to
// ?persona=<id> for deep-linking. Every edit PUTs the whole doc to
// /api/products/<slug>/persona/<id>; local state updates from the response.

const INPUT =
  "h-8 w-full rounded-sm border border-border bg-surface px-2.5 text-caption text-t1";

function FactsEditor({
  facts,
  onChange,
}: {
  facts: PersonaFact[];
  onChange: (next: PersonaFact[]) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {facts.map((f, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            className={`${INPUT} max-w-40`}
            placeholder="Label"
            value={f.label}
            onChange={(e) => {
              const next = facts.map((x) => ({ ...x }));
              next[i].label = e.target.value;
              onChange(next);
            }}
          />
          <input
            className={INPUT}
            placeholder="Value"
            value={f.value}
            onChange={(e) => {
              const next = facts.map((x) => ({ ...x }));
              next[i].value = e.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            className="shrink-0 cursor-pointer font-mono text-caption text-dim hover:text-t1"
            onClick={() => onChange(facts.filter((_, k) => k !== i))}
            aria-label="Remove fact"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        className={`${BTN} self-start`}
        onClick={() => onChange([...facts, { label: "", value: "" }])}
      >
        <Plus className="size-3.5" /> fact
      </button>
    </div>
  );
}

function ProfileHeader({
  profile,
  fallbackName,
  onSave,
  onDelete,
  saving,
}: {
  profile: PersonaProfile | undefined;
  fallbackName: string;
  onSave: (next: PersonaProfile) => Promise<boolean>;
  onDelete: () => void;
  saving: boolean;
}) {
  const p: PersonaProfile = profile ?? { name: fallbackName };
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<PersonaProfile>(p);

  const startEdit = () => {
    setDraft({ ...p, facts: p.facts ? p.facts.map((f) => ({ ...f })) : [] });
    setEditing(true);
  };

  const commit = async () => {
    const clean: PersonaProfile = {
      ...draft,
      name: draft.name.trim() || fallbackName,
      facts: (draft.facts ?? []).filter((f) => f.label.trim() || f.value.trim()),
    };
    if (await onSave(clean)) setEditing(false);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-elevation-1">
      <div
        className={`h-24 w-full bg-cover bg-center ${
          p.cover ? "" : "bg-subtle bg-gradient-to-br from-subtle to-card"
        }`}
        style={p.cover ? { backgroundImage: `url(${p.cover})` } : undefined}
      />
      <div className="px-6 pb-6">
        <div className="-mt-10 flex items-end justify-between gap-4">
          <PersonaAvatar
            name={p.name}
            src={p.avatar}
            size={80}
            className="ring-4 ring-card"
          />
          {!editing ? (
            <div className="flex items-center gap-2">
              <button type="button" className={BTN} onClick={startEdit}>
                <PencilSimple className="size-3.5" /> edit profile
              </button>
              <button
                type="button"
                className={BTN}
                onClick={onDelete}
                aria-label="Delete persona"
              >
                <Trash className="size-3.5" /> delete
              </button>
            </div>
          ) : null}
        </div>

        {!editing ? (
          <div className="mt-3">
            <h2 className="text-heading-3 leading-heading-3 text-t1">{p.name}</h2>
            {p.headline ? (
              <p className="mt-0.5 text-body text-t3">{p.headline}</p>
            ) : null}
            {p.location ? (
              <p className="mt-1 inline-flex items-center gap-1 text-caption text-dim">
                <MapPin className="size-3.5" /> {p.location}
              </p>
            ) : null}
            {p.bio ? (
              <p className="mt-3 max-w-2xl text-body leading-body text-t2">{p.bio}</p>
            ) : null}
            {p.facts && p.facts.length > 0 ? (
              <dl className="mt-5 max-w-xl divide-y divide-border rounded-lg border border-border">
                {p.facts.map((f, i) => (
                  <div key={i} className="flex gap-4 px-4 py-2.5">
                    <dt className="w-28 shrink-0 text-caption tracking-wide text-dim uppercase">
                      {f.label}
                    </dt>
                    <dd className="text-caption text-t2">{f.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-mono text-caption text-dim">Name</span>
              <input
                className={INPUT}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-caption text-dim">Headline</span>
              <input
                className={INPUT}
                value={draft.headline ?? ""}
                onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-caption text-dim">Location</span>
              <input
                className={INPUT}
                value={draft.location ?? ""}
                onChange={(e) => setDraft({ ...draft, location: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-caption text-dim">Avatar asset path</span>
              <input
                className={INPUT}
                placeholder="/asset/host/personas/marcus.png"
                value={draft.avatar ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, avatar: e.target.value || null })
                }
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-caption text-dim">Bio</span>
              <textarea
                className="min-h-24 w-full resize-y rounded-lg border border-border bg-surface p-3 text-body leading-body text-t1"
                value={draft.bio ?? ""}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
              />
            </label>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-caption text-dim">Quick facts</span>
              <FactsEditor
                facts={draft.facts ?? []}
                onChange={(facts) => setDraft({ ...draft, facts })}
              />
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className={BTN} onClick={commit} disabled={saving}>
                <Check className="size-3.5" /> save
              </button>
              <button type="button" className={BTN} onClick={() => setEditing(false)}>
                <X className="size-3.5" /> cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Starter prompts: ready-to-run hububb-creative invocations generated from this
// persona's data by the persona-prompts skill. Read-only here; the app can't run
// Claude Code, so regeneration happens from the skill. Shows a staleness note
// when the persona was edited after the prompts were generated.
function PersonaPrompts({
  slug,
  persona,
}: {
  slug: string;
  persona: PersonaDoc;
}) {
  const prompts = persona.prompts ?? [];
  const generatedAt = persona.promptsUpdatedAt;
  const stale =
    prompts.length > 0 &&
    !!generatedAt &&
    persona.updatedAt > generatedAt;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-caption leading-caption font-medium tracking-wide text-t3 uppercase">
          Starter prompts
        </p>
        {generatedAt ? (
          <span className="font-mono text-caption text-dim">
            generated {generatedAt.slice(0, 10)}
          </span>
        ) : null}
      </div>

      {stale ? (
        <p className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border bg-card px-4 py-2 text-caption text-t3">
          <Warning className="size-3.5 shrink-0 text-dim" />
          Persona edited since these were generated — rerun the{" "}
          <span className="font-mono text-t2">persona-prompts</span> skill to refresh.
        </p>
      ) : null}

      {prompts.length === 0 ? (
        <div className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-border bg-card px-5 py-6">
          <p className="inline-flex items-center gap-2 text-body text-t2">
            <Sparkle className="size-4 text-dim" /> No starter prompts yet.
          </p>
          <p className="max-w-md text-caption text-t3">
            Run the <span className="font-mono text-t2">persona-prompts</span> skill for{" "}
            <span className="font-mono">
              {slug} {persona.id}
            </span>{" "}
            to draft angles from this persona&rsquo;s pains and jobs. Each becomes a
            ready-to-run creative prompt.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {prompts.map((p, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-5 shadow-elevation-1"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-body font-medium text-t1">{p.title}</p>
                <CopyButton text={p.body} />
              </div>
              <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-caption leading-relaxed whitespace-pre-wrap text-t2">
                {p.body}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Personas({
  slug,
  personas,
  initialId,
}: {
  slug: string;
  personas: PersonaDoc[];
  initialId?: string;
}) {
  const router = useRouter();
  const [docs, setDocs] = useState<PersonaDoc[]>(personas);
  const [activeId, setActiveId] = useState<string>(
    initialId && personas.some((d) => d.id === initialId)
      ? initialId
      : (personas[0]?.id ?? ""),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const active = useMemo(
    () => docs.find((d) => d.id === activeId) ?? docs[0],
    [docs, activeId],
  );

  const select = (id: string) => {
    setActiveId(id);
    router.replace(`/p/${slug}/persona?persona=${id}`, { scroll: false });
  };

  // Persist profile/sections for a persona id; reflect the saved doc locally.
  // Prompts are skill-generated and the UI never edits them — but it round-trips
  // them so an inline profile/section edit never clobbers them server-side.
  const save = async (
    id: string,
    patch: { profile?: PersonaProfile; sections: PersonaSection[]; version?: number },
  ): Promise<boolean> => {
    const current = docs.find((d) => d.id === id);
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/products/${slug}/persona/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        version: patch.version ?? 2,
        profile: patch.profile,
        sections: patch.sections,
        prompts: current?.prompts,
        promptsUpdatedAt: current?.promptsUpdatedAt,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Save failed — the file may be read-only or the payload invalid.");
      return false;
    }
    const saved = (await res.json()) as PersonaDoc;
    setDocs((prev) => prev.map((d) => (d.id === id ? saved : d)));
    return true;
  };

  const saveProfile = (profile: PersonaProfile) =>
    save(active.id, { profile, sections: active.sections });

  const saveSections = (sections: PersonaSection[]) =>
    save(active.id, { profile: active.profile, sections });

  const addPersona = async () => {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/products/${slug}/persona`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New persona" }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Could not create the persona.");
      return;
    }
    const created = (await res.json()) as PersonaDoc;
    setDocs((prev) => [...prev, created]);
    select(created.id);
  };

  const deletePersona = async () => {
    if (!active) return;
    if (!confirm(`Delete persona "${active.profile?.name ?? active.id}"?`)) return;
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/products/${slug}/persona/${active.id}`, {
      method: "DELETE",
    });
    setSaving(false);
    if (!res.ok) {
      setError("Could not delete the persona.");
      return;
    }
    const remaining = docs.filter((d) => d.id !== active.id);
    setDocs(remaining);
    if (remaining.length > 0) select(remaining[0].id);
    else router.replace(`/p/${slug}/persona`, { scroll: false });
  };

  if (!active) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
        <p className="text-body text-t2">No personas yet.</p>
        <p className="max-w-md text-caption text-t3">
          Add one below, or run the persona-refine skill to draft one from the
          marketing context.
        </p>
        <button type="button" className={BTN} onClick={addPersona} disabled={saving}>
          <Plus className="size-3.5" /> add persona
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Switcher */}
      <div className="flex flex-wrap items-center gap-2">
        {docs.map((d) => {
          const name = d.profile?.name ?? d.id;
          const on = d.id === active.id;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => select(d.id)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-caption transition-colors ${
                on
                  ? "border-border bg-subtle text-t1"
                  : "border-transparent text-t3 hover:bg-subtle-hover"
              }`}
            >
              <PersonaAvatar name={name} src={d.profile?.avatar} size={20} />
              {name}
            </button>
          );
        })}
        <button
          type="button"
          className={`${BTN} rounded-full`}
          onClick={addPersona}
          disabled={saving}
        >
          <Plus className="size-3.5" /> add persona
        </button>
      </div>

      {error ? (
        <p className="rounded-lg border border-border bg-card px-4 py-2 text-caption text-t2">
          {error}
        </p>
      ) : null}

      <ProfileHeader
        key={active.id}
        profile={active.profile}
        fallbackName={active.id}
        onSave={saveProfile}
        onDelete={deletePersona}
        saving={saving}
      />

      <SectionsEditor key={`${active.id}-sections`} sections={active.sections} onSave={saveSections} />

      <PersonaPrompts key={`${active.id}-prompts`} slug={slug} persona={active} />

      <p className="font-mono text-caption text-dim">
        products/{slug}/personas/{active.id}.json · updated{" "}
        {active.updatedAt.slice(0, 10)}
      </p>
    </div>
  );
}
