import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { exportedPages, htmlFileOf, readerOf } from "./exported-pages.mjs";

describe("htmlFileOf", () => {
  it("maps a registry path to its file in the static export", () => {
    expect(htmlFileOf("/")).toBe("index.html");
    expect(htmlFileOf("/404")).toBe("404.html");
    expect(htmlFileOf("/faq")).toBe("faq.html");
    expect(htmlFileOf("/docs/quick-start")).toBe("docs/quick-start.html");
  });
});

describe("exportedPages", () => {
  function exportWith(files) {
    const dir = mkdtempSync(join(tmpdir(), "oxide-out-"));
    for (const [name, content] of Object.entries(files)) {
      mkdirSync(join(dir, name, ".."), { recursive: true });
      writeFileSync(join(dir, name), content);
    }
    return dir;
  }

  const registry = [
    { path: "/", budgetClass: "showcase" },
    { path: "/docs/concepts", budgetClass: "reading" },
  ];

  it("reads every registry page from the export with its budget class", () => {
    const out = exportWith({
      "index.html": "<p>home</p>",
      "docs/concepts.html": "<p>concepts</p>",
    });
    expect(exportedPages(out, registry)).toEqual([
      { path: "/", budgetClass: "showcase", html: "<p>home</p>" },
      {
        path: "/docs/concepts",
        budgetClass: "reading",
        html: "<p>concepts</p>",
      },
    ]);
  });

  it("fails loudly when a registry page is missing from the export", () => {
    const out = exportWith({ "index.html": "<p>home</p>" });
    expect(() => exportedPages(out, registry)).toThrow(
      /\/docs\/concepts has no docs\/concepts\.html in .*: run `pnpm build` first/,
    );
  });

  it("reads an exported asset by its URL path, query string dropped", () => {
    const out = exportWith({ "_next/static/a.js": "js" });
    expect(readerOf(out)("/_next/static/a.js?v=1").toString()).toBe("js");
  });
});
