// `pnpm measure:js [page.html ...]`: gzip size of the external JS an exported
// page loads, counted as the budgets count it (docs/spec/budgets.md, Per-page
// ceilings: gzip, every script requested up to `load`). Inline scripts are
// HTML (the RSC payload) and are not counted here. Defaults to the home.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

/** External scripts an HTML page loads or preloads, in order, once each. */
export function jsReferences(html) {
  const refs = [];
  for (const [tag] of html.matchAll(/<(?:script|link)\b[^>]*>/gi)) {
    // `nomodule` polyfills never load in a browser that runs modules.
    const isScript = /^<script/i.test(tag) && !/\bnomodule\b/i.test(tag);
    const isScriptPreload =
      /\brel="(?:preload|modulepreload)"/i.test(tag) &&
      (/\bas="script"/i.test(tag) || /rel="modulepreload"/i.test(tag));
    const url = tag.match(isScript ? /\bsrc="([^"]+)"/i : /\bhref="([^"]+)"/i);
    if (url && (isScript || isScriptPreload) && !refs.includes(url[1])) {
      refs.push(url[1]);
    }
  }
  return refs;
}

/**
 * @param {string} html
 * @param {(src: string) => Buffer} read reads a script by its URL path
 */
export function measureJs(html, read) {
  const files = jsReferences(html).map((src) => ({
    src,
    gzipBytes: gzipSync(read(src)).length,
  }));
  return {
    files,
    gzipBytes: files.reduce((sum, f) => sum + f.gzipBytes, 0),
  };
}

function main() {
  const out = fileURLToPath(new URL("../out", import.meta.url));
  const pages = process.argv.slice(2);
  for (const page of pages.length ? pages : ["index.html"]) {
    const html = readFileSync(join(out, page), "utf8");
    const result = measureJs(html, (src) =>
      readFileSync(join(out, new URL(src, "http://x").pathname)),
    );
    for (const f of result.files) {
      console.log(
        `${(f.gzipBytes / 1000).toFixed(1).padStart(7)} kB  ${f.src}`,
      );
    }
    console.log(
      `${(result.gzipBytes / 1000).toFixed(1).padStart(7)} kB  total JS (gzip) for ${page}`,
    );
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
