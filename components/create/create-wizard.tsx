"use client";

import { useEffect, useReducer } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Product } from "@/lib/products";
import type { PersonaDoc, PersonaSummary } from "@/lib/personas";
import {
  type ContentType,
  contentType,
  assemblePrompt,
  personaBrief,
} from "@/lib/create";
import { templatesFor, templateById } from "@/lib/templates";
import { stepVariants } from "@/lib/motion";
import { CreateStepper } from "./create-stepper";
import { StepProduct } from "./step-product";
import { StepPersona } from "./step-persona";
import { StepType } from "./step-type";
import { StepTemplate } from "./step-template";
import { StepPrompt } from "./step-prompt";

// The wizard steps are derived, not fixed: the template step only exists for
// content types that have templates (everything except the Higgsfield "motion"
// type, which is generative and template-less).
type StepKey = "product" | "persona" | "type" | "template" | "prompt";
const STEP_LABEL: Record<StepKey, string> = {
  product: "Product",
  persona: "Persona",
  type: "Type",
  template: "Template",
  prompt: "Prompt",
};
function stepKeys(ct: ContentType | null): StepKey[] {
  const hasTemplate = !!ct && ct !== "motion";
  return hasTemplate
    ? ["product", "persona", "type", "template", "prompt"]
    : ["product", "persona", "type", "prompt"];
}

type State = {
  step: number; // 1-based index into stepKeys(contentType)
  dir: number; // step transition direction
  product: string | null;
  personas: PersonaSummary[];
  personaId: string | null;
  personaDoc: PersonaDoc | null; // full doc for the selected persona (the prompt brief)
  contentType: ContentType | null;
  template: string | null; // chosen template id, or null = let the engine decide
  description: string;
  imagery: string[];
};

type Action =
  | { type: "product"; slug: string }
  | { type: "personas"; personas: PersonaSummary[] }
  | { type: "persona"; id: string }
  | { type: "personaCreated"; persona: PersonaSummary }
  | { type: "personaDeleted"; id: string }
  | { type: "personaDoc"; doc: PersonaDoc | null }
  | { type: "contentType"; value: ContentType }
  | { type: "template"; id: string | null }
  | { type: "description"; value: string }
  | { type: "imagery"; paths: string[] }
  | { type: "removeImagery"; path: string }
  | { type: "goto"; step: number };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "product":
      return {
        ...s,
        product: a.slug,
        personaId: null,
        personas: [],
        personaDoc: null,
        template: null,
        step: 2,
        dir: 1,
      };
    case "personas":
      return { ...s, personas: a.personas };
    case "persona":
      return { ...s, personaId: a.id, personaDoc: null, step: 3, dir: 1 };
    case "personaCreated":
      return {
        ...s,
        personas: [...s.personas, a.persona],
        personaId: a.persona.id,
        personaDoc: null,
        step: 3,
        dir: 1,
      };
    case "personaDeleted":
      return {
        ...s,
        personas: s.personas.filter((p) => p.id !== a.id),
        personaId: s.personaId === a.id ? null : s.personaId,
        personaDoc: s.personaId === a.id ? null : s.personaDoc,
      };
    case "personaDoc":
      return { ...s, personaDoc: a.doc };
    case "contentType":
      // Reset the template so no stale composition id leaks into a static prompt
      // (or vice versa). Step 4 lands on the template step for types that have
      // one, or straight on the prompt for "motion" (only 4 steps).
      return { ...s, contentType: a.value, template: null, step: 4, dir: 1 };
    case "template":
      return { ...s, template: a.id, step: 5, dir: 1 };
    case "description":
      return { ...s, description: a.value };
    case "imagery":
      return { ...s, imagery: [...s.imagery, ...a.paths] };
    case "removeImagery":
      return { ...s, imagery: s.imagery.filter((p) => p !== a.path) };
    case "goto":
      return { ...s, dir: a.step > s.step ? 1 : -1, step: a.step };
  }
}

// Turn a saved persona doc (from the create API) into the summary shape the orbit uses.
function toSummary(doc: PersonaDoc): PersonaSummary {
  return {
    id: doc.id,
    name: doc.profile?.name ?? doc.id,
    headline: doc.profile?.headline,
    location: doc.profile?.location,
    avatar: doc.profile?.avatar ?? null,
    archetype: doc.profile?.archetype,
  };
}

export function CreateWizard({
  products,
  promptBodies,
  oneLiners,
  initialProduct,
}: {
  products: Product[];
  promptBodies: Record<string, string>;
  oneLiners: Record<string, string>;
  initialProduct: string | null;
}) {
  const reduce = useReducedMotion();
  const [state, dispatch] = useReducer(reducer, {
    step: initialProduct ? 2 : 1,
    dir: 1,
    product: initialProduct,
    personas: [],
    personaId: null,
    personaDoc: null,
    contentType: null,
    template: null,
    description: "",
    imagery: [],
  });

  // Load persona summaries whenever the chosen product changes.
  useEffect(() => {
    if (!state.product) return;
    let live = true;
    fetch(`/api/products/${state.product}/persona`)
      .then((r) => (r.ok ? r.json() : { personas: [] }))
      .then((d) => {
        if (live) dispatch({ type: "personas", personas: d.personas ?? [] });
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [state.product]);

  // Load the full persona doc for the selected persona, for the prompt's brief.
  useEffect(() => {
    if (!state.product || !state.personaId) return;
    let live = true;
    fetch(`/api/products/${state.product}/persona/${state.personaId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (live) dispatch({ type: "personaDoc", doc: d });
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [state.product, state.personaId]);

  const keys = stepKeys(state.contentType);
  const current = keys[state.step - 1];
  const stepLabels = keys.map((k) => STEP_LABEL[k]);

  const persona = state.personas.find((p) => p.id === state.personaId) ?? null;
  const spec = state.contentType ? contentType(state.contentType) : null;
  const visibleTemplates =
    state.contentType && state.product
      ? templatesFor(state.contentType, state.product)
      : [];
  const templateEntry = templateById(visibleTemplates, state.template);
  const brief = state.personaDoc ? personaBrief(state.personaDoc) : undefined;

  const prompt =
    state.product && spec
      ? assemblePrompt(promptBodies[spec.promptKey] ?? "", {
          product: state.product,
          contentType: spec.key,
          personaArchetype: persona?.archetype ?? persona?.name,
          personaId: state.personaId ?? undefined,
          productOneLiner: oneLiners[state.product],
          personaBrief: brief,
          template: templateEntry,
          description: state.description,
          imagery: state.imagery.join(", ") || undefined,
        })
      : "";

  let body: React.ReactNode = null;
  if (current === "product")
    body = (
      <StepProduct
        products={products}
        onSelect={(slug) => dispatch({ type: "product", slug })}
      />
    );
  else if (current === "persona" && state.product)
    body = (
      <StepPersona
        product={state.product}
        personas={state.personas}
        selectedId={state.personaId}
        onSelect={(id) => dispatch({ type: "persona", id })}
        onCreated={(doc) => dispatch({ type: "personaCreated", persona: toSummary(doc) })}
        onDeleted={(id) => dispatch({ type: "personaDeleted", id })}
      />
    );
  else if (current === "type")
    body = (
      <StepType
        selected={state.contentType}
        onSelect={(value) => dispatch({ type: "contentType", value })}
      />
    );
  else if (current === "template" && state.contentType && state.product)
    body = (
      <StepTemplate
        contentType={state.contentType}
        product={state.product}
        selected={state.template}
        onSelect={(id) => dispatch({ type: "template", id })}
      />
    );
  else if (current === "prompt" && spec && state.product)
    body = (
      <StepPrompt
        product={state.product}
        spec={spec}
        prompt={prompt}
        description={state.description}
        onDescription={(value) => dispatch({ type: "description", value })}
        imagery={state.imagery}
        onImagery={(paths) => dispatch({ type: "imagery", paths })}
        onRemoveImagery={(p) => dispatch({ type: "removeImagery", path: p })}
      />
    );

  return (
    <div className="flex flex-col gap-8">
      <CreateStepper
        steps={stepLabels}
        current={state.step}
        onGoto={(n) => n < state.step && dispatch({ type: "goto", step: n })}
      />
      <div className="relative">
        {reduce ? (
          <div key={state.step}>{body}</div>
        ) : (
          <AnimatePresence mode="wait" custom={state.dir}>
            <motion.div
              key={state.step}
              custom={state.dir}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {body}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
