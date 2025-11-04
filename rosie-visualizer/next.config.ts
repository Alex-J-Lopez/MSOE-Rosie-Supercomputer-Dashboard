import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // If deploying to a subpath (e.g., https://username.github.io/repo-name/),
  // uncomment and set basePath and assetPrefix:
  // basePath: '/MSOE-Rosie-Supercomputer-Dashboard-Project',
  // assetPrefix: '/MSOE-Rosie-Supercomputer-Dashboard-Project',
};

export default nextConfig;
