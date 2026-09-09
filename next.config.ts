import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Self-hosted, no Sharp installed, and covers are served from a custom
    // route (not the public/ folder) — skip the built-in optimizer.
    unoptimized: true,
  },
};

export default nextConfig;
