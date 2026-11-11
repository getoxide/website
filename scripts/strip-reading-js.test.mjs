import { describe, expect, it } from "vitest";
import {
  loadsClientRuntime,
  stripClientScripts,
  stripsClientScripts,
} from "./strip-reading-js.mjs";

const PAGE = `<!DOCTYPE html><html><head>
<link rel="preload" href="/_next/static/media/inter.woff2" as="font" crossorigin=""/>
<link rel="preload" as="script" fetchPriority="low" href="/_next/static/chunks/framework.js"/>
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

describe("stripClientScripts", () => {
  it("drops the Next scripts and their script preloads", () => {
    const html = stripClientScripts(PAGE);
    expect(loadsClientRuntime(html)).toBe(false);
    expect(html).not.toContain('as="script"');
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

describe("stripsClientScripts", () => {
  it("strips reading pages and leaves showcase pages hydrated", () => {
    expect(stripsClientScripts({ budgetClass: "reading" })).toBe(true);
    expect(stripsClientScripts({ budgetClass: "showcase" })).toBe(false);
  });
});
