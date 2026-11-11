import type { NextConfig } from "next";

// Fully static export (ADR-0002): CI tests the exported `out/` served locally.
// Next drops `redirects()` and `headers()` under export, so redirects and
// response headers live in `vercel.json`, never here.
const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
