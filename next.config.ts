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
};

export default nextConfig;
