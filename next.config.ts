import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.notazip.com.br',
    NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID: process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID || '',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  },
  // Disable cache to ensure fresh builds
  generateBuildId: () => 'build-' + Date.now(),
  // Set turbopack root to current directory to avoid lockfile conflicts
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;