import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

// Studio/CLI config. scripts/render-video.mjs applies the same webpack
// override when bundling programmatically.
Config.overrideWebpackConfig((config) => enableTailwind(config));
Config.setVideoImageFormat("jpeg");
Config.setEntryPoint("remotion/index.ts");
