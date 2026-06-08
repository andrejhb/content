"use client";

import type { ReactNode } from "react";
import { Button } from "@hububb/design-system/button";
import { Input } from "@hububb/design-system/input";
import { Textarea } from "@hububb/design-system/textarea";
import { Checkbox } from "@hububb/design-system/checkbox";
import { Radio, RadioGroup } from "@hububb/design-system/radio";
import { Chip } from "@hububb/design-system/chip";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@hububb/design-system/tabs";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@hububb/design-system/tooltip";
import { Spinner } from "@hububb/design-system/spinner";
import {
  Sparkle,
  ArrowRight,
  Plus,
  MagnifyingGlass,
} from "@phosphor-icons/react/dist/ssr";

function Demo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-elevation-1">
      <p className="mb-4 text-caption font-medium tracking-wide text-t3 uppercase">
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export function ComponentsGallery() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Demo label="Button · variants">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="tertiary">Tertiary</Button>
        <Button variant="primary" color="destructive">
          Destructive
        </Button>
      </Demo>

      <Demo label="Button · sizes, icons, states">
        <Button size="sm">Small</Button>
        <Button size="md" leftIcon={<Sparkle />}>
          With icon
        </Button>
        <Button size="lg" rightIcon={<ArrowRight />}>
          Continue
        </Button>
        <Button loading>Saving</Button>
        <Button disabled>Disabled</Button>
      </Demo>

      <Demo label="Input">
        <div className="flex w-full flex-col gap-3">
          <Input label="Email" placeholder="you@hububb.com" prefixIcon={<MagnifyingGlass />} />
          <Input label="Listing name" defaultValue="Shoreditch loft" />
        </div>
      </Demo>

      <Demo label="Textarea">
        <div className="w-full">
          <Textarea placeholder="Notes for this stay…" rows={3} />
        </div>
      </Demo>

      <Demo label="Checkbox">
        <div className="flex flex-col gap-2">
          <Checkbox defaultChecked>Sync calendar</Checkbox>
          <Checkbox>Auto-message guests</Checkbox>
          <Checkbox disabled>Unavailable</Checkbox>
        </div>
      </Demo>

      <Demo label="Radio group">
        <RadioGroup defaultValue="standard" label="Cleaning plan" orientation="vertical">
          <Radio value="standard">Standard turnover</Radio>
          <Radio value="deep">Deep clean</Radio>
          <Radio value="none">No cleaning</Radio>
        </RadioGroup>
      </Demo>

      <Demo label="Chip">
        <Chip selected>Airbnb</Chip>
        <Chip icon={<Sparkle />}>Featured</Chip>
        <Chip counter={3}>Channels</Chip>
        <Chip>
          <span className="inline-flex items-center gap-1">
            <Plus /> Add
          </span>
        </Chip>
      </Demo>

      <Demo label="Tooltip + Spinner">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary">Proof</Button>
          </TooltipTrigger>
          <TooltipContent>tested on hundreds of real London properties</TooltipContent>
        </Tooltip>
        <Spinner />
      </Demo>

      <div className="lg:col-span-2">
        <Demo label="Tabs">
          <div className="w-full">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="voice">Voice</TabsTrigger>
                <TabsTrigger value="proof">Proof</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <p className="pt-3 text-body text-t2">
                  The end-to-end Host OS for flexible stays.
                </p>
              </TabsContent>
              <TabsContent value="voice">
                <p className="pt-3 text-body text-t2">
                  Plain, operational, restrained. Sentence case, no exclamation marks.
                </p>
              </TabsContent>
              <TabsContent value="proof">
                <p className="pt-3 text-body text-t2">
                  Tested on hundreds of real London properties.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </Demo>
      </div>
    </div>
  );
}
