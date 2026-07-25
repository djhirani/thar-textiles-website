import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  poweredByHeader: false,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
