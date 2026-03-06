import type { NextConfig } from "next";

// website/next.config.ts
const nextConfig = {
  output: 'export',
  // 리포지토리 이름을 basePath로 설정합니다. (앞에 / 필수)
  basePath: '/UnityProject', 
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
