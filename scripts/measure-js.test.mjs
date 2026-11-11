import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { jsReferences, measureJs } from "./measure-js.mjs";

const HTML = `<!DOCTYPE html><html><head>
<link rel="preload" as="script" fetchPriority="low" href="/_next/static/chunks/a.js"/>
<link rel="stylesheet" href="/_next/static/chunks/x.css"/>
<link rel="preload" href="/_next/static/media/f.woff2" as="font" type="font/woff2"/>
<script src="/_next/static/chunks/b.js" async=""></script>
<script src="/_next/static/chunks/a.js" async=""></script>
<script src="/_next/static/chunks/polyfills.js" noModule=""></script>
</head><body><script>self.__next_f.push([1,"inline"])</script></body></html>`;

describe("jsReferences", () => {
  it("lists every external script a modern browser loads or preloads, once", () => {
    // `nomodule` polyfills are skipped by every browser that runs modules.
    expect(jsReferences(HTML)).toEqual([
      "/_next/static/chunks/a.js",
      "/_next/static/chunks/b.js",
    ]);
  });
});

describe("measureJs", () => {
  it("sums the gzip size of each referenced script", () => {
    const a = "console.log('a');".repeat(50);
    const b = "console.log('b');";
    const files = {
      "/_next/static/chunks/a.js": a,
      "/_next/static/chunks/b.js": b,
    };
    const result = measureJs(HTML, (src) => Buffer.from(files[src]));
    expect(result.files.map((f) => f.src)).toEqual(Object.keys(files));
    expect(result.gzipBytes).toBe(gzipSync(a).length + gzipSync(b).length);
  });
});
