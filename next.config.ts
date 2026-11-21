import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Product/brand/category images are served by the Route API's CDN.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "ecommerce.routemisr.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
