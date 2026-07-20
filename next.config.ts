import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@notazip/crypto"],
  env: {
    NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID: process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID || '',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  },
  // Disable cache to ensure fresh builds
  generateBuildId: () => 'build-' + Date.now(),
  // Set turbopack root to current directory to avoid lockfile conflicts
  turbopack: {
    root: __dirname,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'libsodium-wrappers-sumo': require.resolve('libsodium-wrappers-sumo/dist/modules/libsodium-wrappers-sumo.js'),
    };
    return config;
  },
};

export default nextConfig;