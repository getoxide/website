// Reading pages have no client component: their HTML is complete and their
// only interactivity is native (`<details>`, anchors, the inline OS detection
// on `/download`). Hydrating them would ship the Next/React runtime for
// nothing and blow the reading TBT budget (docs/spec/budgets.md, Core Web
// Vitals), so after the export this step drops the framework's script tags,
// leaving the GoatCounter script, inline scripts and JSON-LD untouched.
//
// Showcase pages keep their hydration: they carry the shader, the reveal and
// the capture players.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  exportedPages,
  htmlFileOf,
  OUT_DIR,
  registry,
} from "./exported-pages.mjs";

const NEXT_SCRIPT = /<script\b[^>]*\bsrc="\/_next\/[^"]*"[^>]*>\s*<\/script>/g;
const NEXT_SCRIPT_PRELOAD =
  /<link\b[^>]*\brel="preload"[^>]*\bas="script"[^>]*\bhref="\/_next\/[^"]*"[^>]*>/g;
const NEXT_SCRIPT_PRELOAD_REVERSED =
  /<link\b[^>]*\bhref="\/_next\/[^"]*"[^>]*\bas="script"[^>]*>/g;

/** True while a page still asks the browser for Next's client runtime. */
export const loadsClientRuntime = (html) =>
  /<script\b[^>]*\bsrc="\/_next\//.test(html);

/**
 * Removes the Next client scripts and their preloads, and nothing else.
 * @param {string} html
 * @returns {string}
 */
export function stripClientScripts(html) {
  return html
    .replace(NEXT_SCRIPT, "")
    .replace(NEXT_SCRIPT_PRELOAD, "")
    .replace(NEXT_SCRIPT_PRELOAD_REVERSED, "");
}

/** Reading pages ship no client runtime; showcase pages keep it. */
export const stripsClientScripts = (page) => page.budgetClass === "reading";

async function main() {
  const pages = exportedPages(OUT_DIR, await registry());
  let stripped = 0;
  for (const page of pages.filter(stripsClientScripts)) {
    const html = stripClientScripts(page.html);
    if (loadsClientRuntime(html)) {
      throw new Error(`${page.path}: a Next client script survived the strip`);
    }
    if (!/data-goatcounter=/.test(html)) {
      throw new Error(`${page.path}: the GoatCounter script was removed`);
    }
    if (html !== page.html) {
      writeFileSync(join(OUT_DIR, htmlFileOf(page.path)), html);
      stripped++;
    }
  }
  console.log(
    `Reading pages ship no client runtime: ${stripped} of ${pages.filter(stripsClientScripts).length} stripped.`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
