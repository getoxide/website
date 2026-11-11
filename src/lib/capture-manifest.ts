import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { CaptureManifest } from "./captures";

/**
 * The manifest `scripts/build-captures.mjs` writes next to the variants. It
 * exists at build time only (the output is not committed): `pnpm build` and
 * `pnpm dev` run the pipeline first.
 */
export function loadCaptureManifest(): CaptureManifest {
  const file = join(process.cwd(), "public", "captures", "manifest.json");
  if (!existsSync(file)) {
    throw new Error(
      "public/captures/manifest.json is missing: run `pnpm build:captures` (pnpm build and pnpm dev do)",
    );
  }
  return JSON.parse(readFileSync(file, "utf8")) as CaptureManifest;
}
