import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import {
  GOATCOUNTER_GZIP_BYTES,
  jsReferences,
  measureJs,
} from "./measure-js.mjs";

describe("GoatCounter's script", () => {
  const html = `<html><head><script async="" src="https://gc.zgo.at/count.js" data-goatcounter="https://x.goatcounter.com/count"></script><script src="/a.js" async=""></script></head></html>`;

  it("counts as a fixed allowance and is never read from out/", () => {
    const read = (src) => {
      if (src !== "/a.js") throw new Error(`read ${src}`);
      return Buffer.from("x");
    };
    expect(measureJs(html, read).gzipBytes).toBe(
      gzipSync("x").length + GOATCOUNTER_GZIP_BYTES,
    );
  });
});

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
