import type { NextConfig } from "next";

// website/next.config.ts
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
