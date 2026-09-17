import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Для GitHub Pages раскомментируйте строку ниже перед npm run build
  // output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
