// Showcase pages keep their client runtime, but it must never race the first
// paint of the LCP element. Lighthouse's simulated LCP (Lantern) treats every
// main-thread node that finishes before the observed LCP as render-blocking;
// on the home the framework chunk evaluates in the same few milliseconds as
// the H1's first paint, so about one run in three the whole hydration long
// task was simulated ahead of LCP (2.9 s instead of 0.9 s). It was a coin
// flip, not a slow page: the H1 is static text and paints before hydration.
//
// After the export this step removes the Next script tags from the parser-
// blocking document and re-inserts them in order after `load`, once the LCP
// paint is behind us (see `loader`). Content still never waits for JavaScript (ADR-0001),
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
/** The longest the runtime waits after `load` for the reveal to finish. */
export const MAX_WAIT = 2500;
const NO_MODULE = /\bno[Mm]odule\b/;

/**
 * True while a page still parses a Next client script with the document. The
 * `noModule` legacy chunk is ignored by modern browsers, so it does not count.
 */
export const parsesClientRuntime = (html) =>
  /<script\b(?![^>]*\bno[Mm]odule\b)[^>]*\bsrc="\/_next\//.test(html);

/**
 * The inline bootstrap that re-inserts the collected script sources once the
 * LCP paint is behind us, in order. `load` alone is not enough: on a fast
 * load it fires before the first frame, and the home H1 only becomes visible
 * as its word reveal runs, so the runtime raced the LCP paint and Lantern
 * simulated it ahead of LCP (2.1 s instead of 1.05 s, two runs in three on
 * CI). After `load` it waits for the page's finite animations (the headline
 * reveal; the mark's endless blink is left out), then for the next frame,
 * never longer than `MAX_WAIT` ms. `async = false` on a dynamically inserted
 * script makes it execute in insertion order, like `defer`, so the runtime
 * boots exactly once and in Next's order.
 * @param {string[]} sources
 * @returns {string}
 */
export function loader(sources) {
  return `<script>(function(){var s=${JSON.stringify(sources)},d=false;function go(){for(var i=0;i<s.length;i++){var e=document.createElement("script");e.async=false;e.src=s[i];document.body.appendChild(e)}}function paint(){if(d)return;d=true;requestAnimationFrame(function(){setTimeout(go,0)})}function after(){var a=document.getAnimations?document.getAnimations().filter(function(x){var t=x.effect&&x.effect.getTiming();return t&&t.iterations!==Infinity}):[];setTimeout(paint,${MAX_WAIT});Promise.all(a.map(function(x){return x.finished.catch(function(){})})).then(paint)}if(document.readyState==="complete")after();else addEventListener("load",after,{once:true})})();</script>`;
}

/**
 * Inlines React streaming Suspense templates (`<!--$?--><template id="B:N"></template><!--/$-->`
 * + `<div hidden id="S:N">...</div>` + `$RC("B:N","S:N")`) at build time so
 * statically exported pages render their full content with zero JavaScript and
 * zero layout shift (`CLS = 0`).
 * @param {string} html
 * @returns {string}
 */
export function inlineSuspenseTemplates(html) {
  let out = html;
  const startRe = /<div\b[^>]*\bhidden(?:="")?[^>]*\bid="S:(\d+)"[^>]*>/g;
  const replacements = [];

  for (let match; (match = startRe.exec(html)) !== null;) {
    const id = match[1];
    const openStart = match.index;
    const contentStart = openStart + match[0].length;
    const divRe = /<div\b|<\/div\s*>/gi;
    divRe.lastIndex = contentStart;
    let depth = 1;
    let closeStart = -1;
    let closeEnd = -1;
    for (let tag; (tag = divRe.exec(html)) !== null;) {
      if (tag[0].startsWith("</")) {
        depth--;
        if (depth === 0) {
          closeStart = tag.index;
          closeEnd = divRe.lastIndex;
          break;
        }
      } else {
        depth++;
      }
    }
    if (closeStart === -1) continue;
    const placeholder = `<!--$?--><template id="B:${id}"></template><!--/$-->`;
    if (!out.includes(placeholder)) continue;
    const content = html.slice(contentStart, closeStart);
    replacements.push({ id, openStart, closeEnd, placeholder, content });
  }

  if (replacements.length === 0) return html;

  for (const { placeholder, content } of replacements) {
    out = out.replace(placeholder, () => `<!--$-->${content}<!--/$-->`);
  }
  for (let i = replacements.length - 1; i >= 0; i--) {
    const { id, openStart, closeEnd } = replacements[i];
    const divBlock = html.slice(openStart, closeEnd);
    out = out.replace(divBlock, "");
    out = out.replace(new RegExp(`\\$RC\\("B:${id}","S:${id}"\\);?`, "g"), "");
  }

  out = out.replace(
    /<script>\s*(?:\$RC=function[\s\S]*?)?\s*<\/script>/g,
    (tag) => (tag.includes("$RC(") ? tag : ""),
  );
  return out;
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
  const inlined = inlineSuspenseTemplates(html);
  const moved = inlined.replace(TAG, (tag) => {
    if (/^<script/i.test(tag)) {
      const src = attrOf(tag, "src");
      if (!src?.startsWith(NEXT_SRC) || NO_MODULE.test(tag)) return tag;
      sources.push(src);
      return "";
    }
    return isNextScriptResource(tag) ? "" : tag;
  });
  if (sources.length === 0) return inlined;
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
    `Hydration deferred past the LCP paint: ${deferred} of ${pages.length} showcase pages.`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
