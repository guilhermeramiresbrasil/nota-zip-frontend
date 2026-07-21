import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@notazip/crypto"],
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID: process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID || '',
    NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID_PT: process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID_PT || '',
    NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID_EN: process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID_EN || '',
    NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID_ES: process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID_ES || '',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  },
  // Disable cache to ensure fresh builds
  generateBuildId: () => 'build-' + Date.now(),
  // Set turbopack root to current directory to avoid lockfile conflicts
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: '/:path*\\.(js|css|svg|png|jpg|jpeg|gif|webp|avif|ico|json|woff|woff2|ttf|otf)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
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