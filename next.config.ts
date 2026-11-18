import type { NextConfig } from "next";

// GitHub Pages serves the site from /<repo-name>/. The deploy workflow sets
// PAGES_BASE_PATH; locally it is empty so `npm run dev` works at "/".
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
