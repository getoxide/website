// The pages of the static export, driven by the PAGES registry, for the
// quality gates that run after `pnpm build` (Budgets, Enforcement in CI). A
// page added to the registry is checked by every gate without touching them.
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

/** The static export of this checkout. */
export const OUT_DIR = fileURLToPath(new URL("../out", import.meta.url));

/** The file of a registry path in the export (`/404` is `404.html`). */
export function htmlFileOf(path) {
  return path === "/" ? "index.html" : `${path.slice(1)}.html`;
}

/**
 * Every registry page with its exported HTML.
 * @param {string} outDir
 * @param {{ path: string, budgetClass: string }[]} registry
 */
export function exportedPages(outDir, registry) {
  return registry.map(({ path, budgetClass }) => {
    const file = join(outDir, htmlFileOf(path));
    if (!existsSync(file)) {
      throw new Error(
        `${path} has no ${relative(outDir, file)} in ${outDir}: run \`pnpm build\` first`,
      );
    }
    return { path, budgetClass, html: readFileSync(file, "utf8") };
  });
}

/** Reads an exported file by the URL path a page references it with. */
export function readerOf(outDir) {
  return (src) => readFileSync(join(outDir, new URL(src, "http://x").pathname));
}

/** The PAGES registry, read from its TypeScript source (Node strips types). */
export async function registry() {
  const { PAGES } = await import("../src/content/pages.ts");
  return Object.values(PAGES);
}
