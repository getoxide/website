import { describe, expect, it } from "vitest";
import {
  attrOf,
  clientComponentsOf,
  clientManifestPath,
  loadsClientRuntime,
  localClientModules,
  stripClientScripts,
  stripsClientScripts,
} from "./strip-reading-js.mjs";

const PAGE = `<!DOCTYPE html><html><head>
<link rel="preload" href="/_next/static/media/inter.woff2" as="font" crossorigin=""/>
<link rel="preload" as="script" fetchPriority="low" href="/_next/static/chunks/framework.js"/>
<link rel="modulepreload" href="/_next/static/chunks/page.js"/>
<link rel="stylesheet" href="/_next/static/chunks/app.css"/>
<script src="/_next/static/chunks/framework.js" async=""></script>
<script src="/_next/static/chunks/page.js" async=""></script>
<script src="/_next/static/chunks/legacy.js" noModule=""></script>
</head><body>
<main id="main"><h1>Changelog</h1></main>
<script>self.__next_f=self.__next_f||[];self.__next_f.push([1,"data"])</script>
<script type="application/ld+json">{"@type":"WebPage"}</script>
<script async="" src="https://gc.zgo.at/count.js" data-goatcounter="https://oxide.goatcounter.com/count"></script>
</body></html>`;

const manifest = (modules) =>
  `globalThis.__RSC_MANIFEST = globalThis.__RSC_MANIFEST || {};
globalThis.__RSC_MANIFEST["/faq/page"] = {"moduleLoading":{"prefix":""},"clientModules":{${modules
    .map(
      (m) =>
        `"${m}":{"id":1,"name":"*","chunks":["/_next/a.js"],"async":false}`,
    )
    .join(
      ",",
    )}},"ssrModuleMapping":{},"edgeSSRModuleMapping":{},"rscModuleMapping":{"[project]/src/app/faq/page.tsx":{"id":2,"chunks":[],"name":"*"}},"edgeRscModuleMapping":{},"entryJSFiles":{}};`;

describe("stripClientScripts", () => {
  it("drops the Next scripts and their script preloads", () => {
    const html = stripClientScripts(PAGE);
    expect(loadsClientRuntime(html)).toBe(false);
    expect(html).not.toContain('as="script"');
    expect(html).not.toContain('rel="modulepreload"');
    expect(html).not.toContain("framework.js");
    expect(html).not.toContain("page.js");
    expect(html).not.toContain("legacy.js");
  });

  it("keeps the stylesheet, fonts, inline scripts, JSON-LD and analytics", () => {
    const html = stripClientScripts(PAGE);
    expect(html).toContain('href="/_next/static/chunks/app.css"');
    expect(html).toContain("inter.woff2");
    expect(html).toContain("self.__next_f.push");
    expect(html).toContain('type="application/ld+json"');
    expect(html).toContain("data-goatcounter=");
    expect(html).toContain('<main id="main">');
  });

  it("is idempotent", () => {
    const once = stripClientScripts(PAGE);
    expect(stripClientScripts(once)).toBe(once);
  });
});

// Markup shapes Next has emitted across versions: attribute order is not
// fixed, and quoting is not guaranteed (Issue #29 fix pass, item 2c).
describe("markup shapes", () => {
  it("strips single-quoted, unquoted and reordered attributes", () => {
    const shapes = [
      `<script src='/_next/a.js'></script>`,
      `<script async src=/_next/a.js></script>`,
      `<script async="" src="/_next/a.js" crossorigin=""></script>`,
      `<script data-x="1" src="/_next/a.js" async=""></script>`,
    ];
    for (const tag of shapes) {
      const html = `<html><body>${tag}<p>Text</p></body></html>`;
      expect(loadsClientRuntime(html), tag).toBe(true);
      expect(stripClientScripts(html), tag).toBe(
        "<html><body><p>Text</p></body></html>",
      );
    }
  });

  it("strips modulepreload with the attributes in either order", () => {
    for (const link of [
      `<link rel="modulepreload" href="/_next/a.js"/>`,
      `<link href="/_next/a.js" rel="modulepreload">`,
      `<link href='/_next/a.js' rel=modulepreload>`,
      `<link rel="preload" as="script" href="/_next/a.js">`,
      `<link as="script" href="/_next/a.js" rel="preload">`,
    ]) {
      expect(stripClientScripts(`<head>${link}</head>`), link).toBe(
        "<head></head>",
      );
    }
  });

  it("leaves non-script resources alone", () => {
    const html = `<link rel="preload" href="/_next/font.woff2" as="font"><link rel="stylesheet" href="/_next/app.css">`;
    expect(stripClientScripts(html)).toBe(html);
  });

  it("reads an attribute regardless of quoting", () => {
    expect(attrOf(`<a href="/x" data-k='y'>`, "href")).toBe("/x");
    expect(attrOf(`<a href=/x>`, "href")).toBe("/x");
    expect(attrOf(`<a href>`, "href")).toBe(null);
  });
});

describe("stripsClientScripts", () => {
  it("strips reading pages and leaves showcase pages hydrated", () => {
    expect(stripsClientScripts({ budgetClass: "reading" })).toBe(true);
    expect(stripsClientScripts({ budgetClass: "showcase" })).toBe(false);
  });
});

// The non-circular guard: Next's compiled client reference manifest, not the
// strip's own output (Issue #29 fix pass, item 2a).
describe("localClientModules", () => {
  it("lists only the page's own client components, never Next internals", () => {
    const source = manifest([
      "[project]/node_modules/next/dist/esm/client/components/layout-router.js",
      "[project]/src/components/CopyButton.tsx",
    ]);
    expect(localClientModules(source)).toEqual([
      "src/components/CopyButton.tsx",
    ]);
  });

  it("passes a manifest with no local client component", () => {
    const source = manifest([
      "[project]/node_modules/next/dist/esm/client/components/layout-router.js",
    ]);
    expect(clientComponentsOf(source)).toEqual([]);
  });

  it("fails loudly when the manifest shape is unknown", () => {
    expect(() => localClientModules("globalThis.X = {};")).toThrow(
      /cannot verify/,
    );
  });

  it("maps a page path to Next's compiled manifest", () => {
    expect(clientManifestPath("/faq")).toMatch(
      /\.next\/server\/app\/faq\/page_client-reference-manifest\.js$/,
    );
    expect(clientManifestPath("/")).toMatch(
      /\.next\/server\/app\/page_client-reference-manifest\.js$/,
    );
    expect(clientManifestPath("/404")).toMatch(
      /\.next\/server\/app\/_not-found\/page_client-reference-manifest\.js$/,
    );
  });
});
