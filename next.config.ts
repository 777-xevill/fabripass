import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  webpack(config, { webpack }) {
    const shim = path.resolve(process.cwd(), "app/cloudflare-workers-shim.ts");
    config.resolve.alias["cloudflare:workers"] = shim;
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^cloudflare:workers$/, shim),
    );
    return config;
  },
  async rewrites() {
    if (!process.env.VERCEL) return [];
    return [
      {
        source: "/workspace/:path*",
        destination:
          "https://loompass-garment-readiness.iratul825.chatgpt.site/workspace/:path*",
      },
      {
        source: "/signin-with-chatgpt",
        destination:
          "https://loompass-garment-readiness.iratul825.chatgpt.site/signin-with-chatgpt",
      },
      {
        source: "/passport/:path*",
        destination:
          "https://loompass-garment-readiness.iratul825.chatgpt.site/passport/:path*",
      },
    ];
  },
};

export default nextConfig;
