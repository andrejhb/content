import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @hububb/design-system ships raw .tsx/.ts source (ESM), so Next must
  // transpile it rather than expect prebuilt JS.
  transpilePackages: ["@hububb/design-system"],

  // Hide the dev-mode indicator so it never lands in a rendered creative.
  devIndicators: false,

  // Dev-preview gating. Mirrors hububb-presentations/_headers so this surface
  // stays out of search while it's a preview, before it goes live.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
