// Showcase pages keep their client runtime, but it must never race the first
// paint of the LCP element. Lighthouse's simulated LCP (Lantern) treats every
// main-thread node that finishes before the observed LCP as render-blocking;
// on the home the framework chunk evaluates in the same few milliseconds as
// the H1's first paint, so about one run in three the whole hydration long
// task was simulated ahead of LCP (2.9 s instead of 0.9 s). It was a coin
// flip, not a slow page: the H1 is static text and paints before hydration.
//
// After the export this step removes the Next script tags from the parser-
// blocking document and re-inserts them in order on `load`, once the LCP
// paint is behind us. Content still never waits for JavaScript (ADR-0001),
// the inline RSC payload and `data-reveal` script stay untouched, and the
// runtime is a few hundred milliseconds later than before, not absent.
// Reading pages were already stripped of their runtime entirely.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  exportedPages,
  htmlFileOf,
  OUT_DIR,
  registry,
} from "./exported-pages.mjs";
import {
  attrOf,
  isNextScriptResource,
  stripsClientScripts,
  TAG,
} from "./strip-reading-js.mjs";

const NEXT_SRC = "/_next/";
const NO_MODULE = /\bno[Mm]odule\b/;

/**
 * True while a page still parses a Next client script with the document. The
 * `noModule` legacy chunk is ignored by modern browsers, so it does not count.
 */
export const parsesClientRuntime = (html) =>
  /<script\b(?![^>]*\bno[Mm]odule\b)[^>]*\bsrc="\/_next\//.test(html);

/**
 * The inline bootstrap that re-inserts the collected script sources on
 * `load`, in order. `async = false` on a dynamically inserted script makes it
 * execute in insertion order, like `defer`, so the runtime boots exactly
 * once and in Next's order.
 * @param {string[]} sources
 * @returns {string}
 */
export function loader(sources) {
  return `<script>(function(){var s=${JSON.stringify(sources)};function go(){for(var i=0;i<s.length;i++){var e=document.createElement("script");e.async=false;e.src=s[i];document.body.appendChild(e)}}if(document.readyState==="complete")go();else addEventListener("load",go,{once:true})})();</script>`;
}

/**
 * Moves the Next scripts out of the parsing document and re-inserts them on
 * `load`, in order. The `noModule` legacy chunk stays where it is: modern
 * browsers ignore it, so it never costs a byte, and leaving it does not put a
 * render-blocking node before the first paint.
 * @param {string} html
 * @returns {string}
 */
export function deferClientScripts(html) {
  /** @type {string[]} */
  const sources = [];
  const moved = html.replace(TAG, (tag) => {
    if (/^<script/i.test(tag)) {
      const src = attrOf(tag, "src");
      if (!src?.startsWith(NEXT_SRC) || NO_MODULE.test(tag)) return tag;
      sources.push(src);
      return "";
    }
    return isNextScriptResource(tag) ? "" : tag;
  });
  if (sources.length === 0) return html;
  return moved.replace("</body>", `${loader(sources)}</body>`);
}

async function main() {
  const pages = exportedPages(OUT_DIR, await registry()).filter(
    (page) => !stripsClientScripts(page),
  );
  let deferred = 0;
  for (const page of pages) {
    const html = deferClientScripts(page.html);
    if (parsesClientRuntime(html)) {
      throw new Error(`${page.path}: a Next client script still parses inline`);
    }
    if (!/<script>\(function\(\)\{var s=\[/.test(html)) {
      throw new Error(`${page.path}: the hydration loader is missing`);
    }
    if (html !== page.html) {
      writeFileSync(join(OUT_DIR, htmlFileOf(page.path)), html);
      deferred++;
    }
  }
  console.log(
    `Hydration deferred until load: ${deferred} of ${pages.length} showcase pages.`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
