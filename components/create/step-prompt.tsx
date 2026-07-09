"use client";

import type { ContentTypeSpec } from "@/lib/create";
import { TextArea } from "@/components/site/kit";
import { CopyButton } from "@/components/creatives/copy-button";
import { StepHeading } from "./create-stepper";
import { AssetDrop } from "./asset-drop";
import { WaitingState } from "./waiting-state";

export function StepPrompt({
  product,
  spec,
  prompt,
  description,
  onDescription,
  imagery,
  onImagery,
  onRemoveImagery,
}: {
  product: string;
  spec: ContentTypeSpec;
  prompt: string;
  description: string;
  onDescription: (v: string) => void;
  imagery: string[];
  onImagery: (paths: string[]) => void;
  onRemoveImagery: (path: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <StepHeading
        title="Describe it, then hand it to Claude Code"
        subtitle={`A ${spec.label.toLowerCase()} creative for ${product}. Write the idea; the rest is prefilled from your choices.`}
      />

      <div className="flex flex-col gap-2">
        <label className="text-caption font-medium tracking-wide text-t3 uppercase">
          Describe your content
        </label>
        <TextArea
          rows={4}
          value={description}
          onChange={(e) => onDescription(e.target.value)}
          placeholder="The single idea this creative should land. A moment, a feeling, one line…"
        />
      </div>

      <AssetDrop
        product={product}
        imagery={imagery}
        onImagery={onImagery}
        onRemove={onRemoveImagery}
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-caption font-medium tracking-wide text-t3 uppercase">
            Your prompt
          </label>
          <CopyButton text={prompt} />
        </div>
        <pre className="max-h-80 overflow-auto rounded-2xl bg-subtle p-4 text-caption leading-body whitespace-pre-wrap text-t2">
          {prompt}
        </pre>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-surface p-4 text-caption leading-body text-t3">
        <p>
          <span className="font-medium text-t2">Next:</span> paste this into Claude
          Code in plan mode. When it finishes rendering, this screen jumps to your
          new creative.
        </p>
        <WaitingState product={product} />
      </div>
    </div>
  );
}
