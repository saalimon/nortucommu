import type { NextConfig } from "next";

// GitHub Pages serves the site from /<repo-name>/. The deploy workflow sets
// PAGES_BASE_PATH; locally it is empty so `npm run dev` works at "/".
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  // `next dev` blocks its scripts/HMR for non-localhost hosts; allow ngrok
  // tunnels so the dev server can be tested on a phone.
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok-free.dev", "*.ngrok.app", "*.ngrok.dev", "*.ngrok.io"],
  // Lets client code build URLs for files in /public (e.g. sound effects).
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
