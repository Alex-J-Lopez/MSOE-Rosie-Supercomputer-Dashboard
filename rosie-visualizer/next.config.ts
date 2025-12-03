import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Configured for GitHub Pages deployment at https://alex-j-lopez.github.io/MSOE-Rosie-Supercomputer-Dashboard/
  basePath: '/MSOE-Rosie-Supercomputer-Dashboard',
  assetPrefix: '/MSOE-Rosie-Supercomputer-Dashboard',
};

export default nextConfig;
