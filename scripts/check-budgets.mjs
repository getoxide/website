// `pnpm check:budgets`: the per-page ceilings (docs/spec/budgets.md, Per-page
// ceilings; Enforcement in CI). Reads every page of the PAGES registry from
// the static export in `out/`, sums what it references and fails when a page
// exceeds the ceilings of its budget class.
import { gzipSync } from "node:zlib";
import { jsReferences } from "./measure-js.mjs";

/** Bytes per kB, as the budgets count them (135,192 bytes = 135.2 kB). */
const KB = 1000;

/** Ceilings per budget class, in bytes (Per-page ceilings table). */
export const CEILINGS = {
  showcase: { js: 185_200 },
  reading: { js: 155_200 },
};

const kb = (bytes) => `${(bytes / KB).toFixed(1)} kB`;

/**
 * @param {{ path: string, budgetClass: keyof typeof CEILINGS, html: string }[]} pages
 * @param {(src: string) => Buffer} read reads an exported file by its URL path
 * @returns {string[]} one line per exceeded ceiling, empty when all fit
 */
export function checkBudgets(pages, read) {
  const violations = [];
  for (const { path, budgetClass, html } of pages) {
    const ceilings = CEILINGS[budgetClass];
    const js = jsReferences(html).reduce(
      (sum, src) => sum + gzipSync(read(src)).length,
      0,
    );
    if (js > ceilings.js) {
      violations.push(`${path}: JS ${kb(js)} > ${kb(ceilings.js)} (gzip)`);
    }
  }
  return violations;
}
