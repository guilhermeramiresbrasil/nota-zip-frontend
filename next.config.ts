import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.notazip.com.br',
  },
  // Disable cache to ensure fresh builds
  generateBuildId: () => 'build-' + Date.now(),
  // Output environment variables to help debug
  webpack: (config: any) => {
    config.plugins.push(
      new (class {
        apply(compiler: any) {
          compiler.hooks.afterCompile.tap('EnvPlugin', (compilation: any) => {
            console.log('NEXT_PUBLIC_API_URL during build:', process.env.NEXT_PUBLIC_API_URL);
          });
        }
      })()
    );
    return config;
  },
};

export default nextConfig;
