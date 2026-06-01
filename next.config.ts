import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.notazip.com.br',
  },
  // Disable cache to ensure fresh builds
  generateBuildId: () => 'build-' + Date.now(),
};

export default nextConfig;
