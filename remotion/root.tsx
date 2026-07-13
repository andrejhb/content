import { Composition } from "remotion";
import "../app/globals.css";
import type { Brief } from "../lib/creatives";
import { VIDEO_FORMAT_MAP } from "../lib/formats";
import { AnimatedStatement } from "./compositions/animated-statement";
import { AnimatedFeatureCard } from "./compositions/animated-feature-card";
import { LogoSting } from "./compositions/logo-sting";
import { HostieAd } from "./compositions/hostie-ad";
import { PhoneMockupUi } from "./compositions/phone-mockup-ui";
import { PhoneShowcase } from "./compositions/phone-showcase";
import { AnimatedSpotlight } from "./compositions/animated-spotlight";
import { LaunchHelloMotion } from "./compositions/launch-hello";
import { LaunchStatement } from "./compositions/launch-statement";
import { LaunchSpotlight } from "./compositions/launch-spotlight";
import { LaunchProducts } from "./compositions/launch-products";
import { LaunchForm } from "./compositions/launch-form";
import { LaunchCover } from "./compositions/launch-cover";

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

function metadata({ props }: { props: VideoInputProps }) {
  const f = VIDEO_FORMAT_MAP[props.format] ?? VIDEO_FORMAT_MAP["1x1"];
  const fps = props.fps ?? FPS;
  return {
    width: f.w,
    height: f.h,
    fps,
    durationInFrames: Math.round((props.durationSec ?? 8) * fps),
  };
}

const defaultProps: VideoInputProps = {
  brief: SAMPLE_BRIEF,
  format: "1x1",
  baseUrl: "http://localhost:3000",
};

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="animated-statement"
        component={AnimatedStatement}
        durationInFrames={8 * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={defaultProps}
        calculateMetadata={metadata}
      />
      <Composition
        id="animated-feature-card"
        component={AnimatedFeatureCard}
        durationInFrames={8 * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={defaultProps}
        calculateMetadata={metadata}
      />
      <Composition
        id="logo-sting"
        component={LogoSting}
        durationInFrames={4 * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{ ...defaultProps, durationSec: 4 }}
        calculateMetadata={metadata}
      />
      <Composition
        id="hostie-ad"
        component={HostieAd}
        durationInFrames={10 * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{ ...defaultProps, durationSec: 10 }}
        calculateMetadata={metadata}
      />
      <Composition
        id="phone-mockup-ui"
        component={PhoneMockupUi}
        durationInFrames={8 * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={defaultProps}
        calculateMetadata={metadata}
      />
      <Composition
        id="phone-showcase"
        component={PhoneShowcase}
        durationInFrames={8 * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={defaultProps}
        calculateMetadata={metadata}
      />
      <Composition
        id="animated-spotlight"
        component={AnimatedSpotlight}
        durationInFrames={7 * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{ ...defaultProps, durationSec: 7 }}
        calculateMetadata={metadata}
      />
      <Composition
        id="launch-hello"
        component={LaunchHelloMotion}
        durationInFrames={8 * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={defaultProps}
        calculateMetadata={metadata}
      />
      <Composition
        id="launch-statement"
        component={LaunchStatement}
        durationInFrames={6 * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={defaultProps}
        calculateMetadata={metadata}
      />
      <Composition
        id="launch-spotlight"
        component={LaunchSpotlight}
        durationInFrames={6 * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={defaultProps}
        calculateMetadata={metadata}
      />
      <Composition
        id="launch-products"
        component={LaunchProducts}
        durationInFrames={7 * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={defaultProps}
        calculateMetadata={metadata}
      />
      <Composition
        id="launch-form"
        component={LaunchForm}
        durationInFrames={5 * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{ ...defaultProps, durationSec: 5 }}
        calculateMetadata={metadata}
      />
      <Composition
        id="launch-cover"
        component={LaunchCover}
        durationInFrames={4 * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{ ...defaultProps, durationSec: 4 }}
        calculateMetadata={metadata}
      />
    </>
  );
}
