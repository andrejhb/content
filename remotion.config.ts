import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

// Studio/CLI config. scripts/render-video.mjs applies the same webpack
// override when bundling programmatically. The "@" alias mirrors the tsconfig
// paths entry: vendored remocn components import "@/components/remocn/…" and
// "@/lib/utils", which webpack cannot resolve without it.
Config.overrideWebpackConfig((config) => {
  const c = enableTailwind(config);
  return {
    ...c,
    resolve: { ...c.resolve, alias: { ...(c.resolve?.alias ?? {}), "@": process.cwd() } },
  };
});
Config.setVideoImageFormat("jpeg");
Config.setEntryPoint("remotion/index.ts");
