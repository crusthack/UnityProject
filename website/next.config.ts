import type { NextConfig } from "next";

// website/next.config.ts
const nextConfig = {
  output: 'export', // 이 줄이 있어야 website/out 폴더가 생깁니다!
  distDir: 'out',   // (선택사항) 빌드 결과물 이름을 명시적으로 지정
};

export default nextConfig;
