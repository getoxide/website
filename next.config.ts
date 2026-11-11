import type { NextConfig } from "next";

// Fully static export (ADR-0002): CI tests the exported `out/` served locally.
// Next drops `redirects()` and `headers()` under export, so redirects and
// response headers live in `vercel.json`, never here.
// `SITE_DIST_DIR` moves the export (and Next's build files) elsewhere: only
// `scripts/build-fixtures.mjs` sets it, for the per-Release-state test exports.
const nextConfig: NextConfig = {
  output: "export",
  ...(process.env.SITE_DIST_DIR ? { distDir: process.env.SITE_DIST_DIR } : {}),
};

export default nextConfig;
