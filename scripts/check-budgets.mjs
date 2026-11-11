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
  showcase: { js: 185_200, css: 25_000, html: 50_000 },
  reading: { js: 155_200, css: 15_000, html: 50_000 },
};

/** What each ceiling measures, in report order. */
const MEASURES = [
  ["js", "JS", "gzip"],
  ["css", "CSS", "gzip"],
  ["html", "HTML", "gzip, inline RSC payload included"],
];

const kb = (bytes) => `${(bytes / KB).toFixed(1)} kB`;

/** Every `<link>` tag of the page with its attributes, in order. */
function links(html) {
  return [...html.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => ({
    rel: tag.match(/\brel="([^"]*)"/i)?.[1].toLowerCase() ?? "",
    as: tag.match(/\bas="([^"]*)"/i)?.[1].toLowerCase() ?? "",
    href: tag.match(/\bhref="([^"]*)"/i)?.[1] ?? "",
  }));
}

const unique = (list) => [...new Set(list)];

/** Stylesheets the page loads or preloads, once each. */
function cssReferences(html) {
  return unique(
    links(html)
      .filter(
        (l) =>
          l.href &&
          (l.rel.split(/\s+/).includes("stylesheet") ||
            (l.rel === "preload" && l.as === "style")),
      )
      .map((l) => l.href),
  );
}

/** Sizes of one exported page, in bytes, as the budgets count them. */
export function measurePage(html, read) {
  const gzip = (src) => gzipSync(read(src)).length;
  const sum = (list, size) => list.reduce((total, x) => total + size(x), 0);
  return {
    js: sum(jsReferences(html), gzip),
    css: sum(cssReferences(html), gzip),
    html: gzipSync(html).length,
  };
}

/**
 * @param {{ path: string, budgetClass: keyof typeof CEILINGS, html: string }[]} pages
 * @param {(src: string) => Buffer} read reads an exported file by its URL path
 * @returns {string[]} one line per exceeded ceiling, empty when all fit
 */
export function checkBudgets(pages, read) {
  const violations = [];
  for (const { path, budgetClass, html } of pages) {
    const ceilings = CEILINGS[budgetClass];
    const sizes = measurePage(html, read);
    for (const [key, label, how] of MEASURES) {
      if (sizes[key] > ceilings[key]) {
        violations.push(
          `${path}: ${label} ${kb(sizes[key])} > ${kb(ceilings[key])} (${how}, ${budgetClass})`,
        );
      }
    }
  }
  return violations;
}
