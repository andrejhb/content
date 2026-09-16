import type React from "react";
import { Composition } from "remotion";
import "../app/globals.css";
import type { RemotionCompositionId } from "../lib/creative-schema";
import type { Brief } from "../lib/creatives";
import { VIDEO_FORMAT_MAP } from "../lib/formats";
import { AnimatedStatement } from "./compositions/animated-statement";
import { AnimatedFeatureCard } from "./compositions/animated-feature-card";
import { LogoSting } from "./compositions/logo-sting";
import { HostieAd } from "./compositions/hostie-ad";
import { PhoneMockupUi } from "./compositions/phone-mockup-ui";
import { PhoneShowcase } from "./compositions/phone-showcase";
import { AnimatedSpotlight } from "./compositions/animated-spotlight";
import { AnimatedStack } from "./compositions/animated-stack";
import { AnimatedChatThread } from "./compositions/animated-chat-thread";
import { LaunchHelloMotion } from "./compositions/launch-hello";
import { LaunchStatement } from "./compositions/launch-statement";
import { LaunchSpotlight } from "./compositions/launch-spotlight";
import { LaunchProducts } from "./compositions/launch-products";
import { LaunchForm } from "./compositions/launch-form";
import { LaunchCover } from "./compositions/launch-cover";
import { MotionFilm } from "./compositions/motion-film";
import { RemocnDemo } from "./compositions/remocn-demo";
import { PaperLayers } from "./compositions/paper-layers";

// Compositions are registered once; width/height/duration resolve per render
// from inputProps (format key + durationSec) via calculateMetadata.

export type VideoInputProps = {
  brief: Brief;
  format: string;
  baseUrl: string;
  durationSec?: number;
  fps?: number;
};

const FPS = 30;

const SAMPLE_BRIEF: Brief = {
  id: "sample",
  createdAt: "2026-07-02T00:00:00.000Z",
  product: "host",
  angle: "Sample angle for studio preview",
  brief: "Studio preview brief.",
  template: "statement",
  formats: ["1x1"],
  brandMark: true,
  image: "/asset/host/mockups/phone-overview-v2.png",
  variant: "light",
  copy: {
    eyebrow: "the calm layer",
    headline: "Run it like a pro, without running it all day.",
    subhead: "Everything a host needs, in one app.",
  },
};

// Studio-only sample film so motion-film previews without a brief render.
const SAMPLE_FILM_BRIEF: Brief = {
  ...SAMPLE_BRIEF,
  film: {
    beats: [
      { shot: "statement", durationSec: 2.5, line: "2:14 am", tail: "A guest has a question" },
      { shot: "stat", durationSec: 3, stat: { value: 90, suffix: "%", label: "of the day-to-day, handled" } },
      { shot: "wordmark", durationSec: 2.5, line: "Hosting that runs itself" },
    ],
  },
};

// Studio-only sample thread so the chat composition previews without a brief.
const SAMPLE_CHAT_BRIEF: Brief = {
  ...SAMPLE_BRIEF,
  template: "chat-thread",
  chatStyle: "whatsapp",
  copy: {
    contact: "Sam",
    headline: "One platform to manage messaging, cleaners, pricing and repairs.",
    cta: "List your unit",
    thread: [
      { from: "day", text: "TODAY" },
      { from: "in", text: "how are you running three flats now" },
      { from: "out", text: "i stopped doing the admin", time: "21:34" },
    ],
  },
};

function metadata({ props }: { props: VideoInputProps }) {
  const f = VIDEO_FORMAT_MAP[props.format] ?? VIDEO_FORMAT_MAP["1x1"];
  const fps = props.fps ?? FPS;
  // A motion-film's beats own its duration; other compositions take durationSec.
  const beats = props.brief.film?.beats;
  const seconds = beats?.length
    ? beats.reduce((sum, b) => sum + b.durationSec, 0)
    : (props.durationSec ?? 8);
  return {
    width: f.w,
    height: f.h,
    fps,
    durationInFrames: Math.round(seconds * fps),
  };
}

const defaultProps: VideoInputProps = {
  brief: SAMPLE_BRIEF,
  format: "1x1",
  baseUrl: "http://localhost:3000",
};

// The registry, typed over the canonical id list from lib/creative-schema.ts:
// a missing or extra entry is a compile error, and validateBrief checks briefs
// against the same list, so registration cannot drift.
// `seconds` is the studio default duration; `propSeconds` additionally sets
// defaultProps.durationSec for compositions whose look depends on it.
const REGISTRY: Record<
  RemotionCompositionId,
  {
    component: React.ComponentType<VideoInputProps>;
    seconds: number;
    propSeconds?: number;
    brief?: Brief;
  }
> = {
  "animated-statement": { component: AnimatedStatement, seconds: 8 },
  "animated-feature-card": { component: AnimatedFeatureCard, seconds: 8 },
  "logo-sting": { component: LogoSting, seconds: 4, propSeconds: 4 },
  "hostie-ad": { component: HostieAd, seconds: 10, propSeconds: 10 },
  "phone-mockup-ui": { component: PhoneMockupUi, seconds: 8 },
  "phone-showcase": { component: PhoneShowcase, seconds: 8 },
  "animated-spotlight": { component: AnimatedSpotlight, seconds: 8, propSeconds: 8 },
  "animated-stack": { component: AnimatedStack, seconds: 7, propSeconds: 7 },
  "animated-chat-thread": { component: AnimatedChatThread, seconds: 11, propSeconds: 11, brief: SAMPLE_CHAT_BRIEF },
  "launch-hello": { component: LaunchHelloMotion, seconds: 8 },
  "launch-statement": { component: LaunchStatement, seconds: 6 },
  "launch-spotlight": { component: LaunchSpotlight, seconds: 6 },
  "launch-products": { component: LaunchProducts, seconds: 7 },
  "launch-form": { component: LaunchForm, seconds: 5, propSeconds: 5 },
  "launch-cover": { component: LaunchCover, seconds: 4, propSeconds: 4 },
  "motion-film": { component: MotionFilm, seconds: 8, brief: SAMPLE_FILM_BRIEF },
  "remocn-demo": { component: RemocnDemo, seconds: 9, propSeconds: 9 },
  "paper-layers": { component: PaperLayers, seconds: 10, propSeconds: 10 },
};

export function RemotionRoot() {
  return (
    <>
      {(Object.keys(REGISTRY) as RemotionCompositionId[]).map((id) => {
        const entry = REGISTRY[id];
        return (
          <Composition
            key={id}
            id={id}
            component={entry.component}
            durationInFrames={entry.seconds * FPS}
            fps={FPS}
            width={1080}
            height={1080}
            defaultProps={{
              ...defaultProps,
              ...(entry.brief ? { brief: entry.brief } : {}),
              ...(entry.propSeconds ? { durationSec: entry.propSeconds } : {}),
            }}
            calculateMetadata={metadata}
          />
        );
      })}
    </>
  );
}
