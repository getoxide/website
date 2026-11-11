import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { checkBudgets } from "./check-budgets.mjs";

/** Incompressible bytes: their gzip size is about their file size. */
const noise = (bytes) => randomBytes(bytes);

/** A `read` over an in-memory export; a missing file throws like fs does. */
function exportOf(files) {
  return (src) => {
    const path = new URL(src, "http://x").pathname;
    if (!(path in files)) throw new Error(`ENOENT ${path}`);
    return Buffer.from(files[path]);
  };
}

const page = (path, budgetClass, head = "", body = "") => ({
  path,
  budgetClass,
  html: `<!DOCTYPE html><html><head>${head}</head><body><main>${body}</main></body></html>`,
});

describe("checkBudgets: JS", () => {
  const head = `<script src="/_next/static/chunks/app.js" async=""></script>`;

  it("passes a page whose JS fits its class's ceiling", () => {
    const read = exportOf({ "/_next/static/chunks/app.js": noise(150_000) });
    expect(checkBudgets([page("/faq", "reading", head)], read)).toEqual([]);
  });

  it("fails a reading page over 155.2 kB of gzip JS, naming page and asset kind", () => {
    const read = exportOf({ "/_next/static/chunks/app.js": noise(160_000) });
    const violations = checkBudgets([page("/faq", "reading", head)], read);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatch(/^\/faq: JS 16\d\.\d kB > 155\.2 kB/);
  });

  it("holds a showcase page to the showcase ceiling, 185.2 kB", () => {
    const read = exportOf({ "/_next/static/chunks/app.js": noise(160_000) });
    expect(checkBudgets([page("/", "showcase", head)], read)).toEqual([]);
  });
});

describe("checkBudgets: CSS and HTML", () => {
  const css = `<link rel="stylesheet" href="/_next/static/chunks/a.css"/>`;

  it("fails a reading page over 15 kB of gzip CSS", () => {
    const read = exportOf({ "/_next/static/chunks/a.css": noise(16_000) });
    expect(checkBudgets([page("/faq", "reading", css)], read)).toEqual([
      expect.stringMatching(/^\/faq: CSS 16\.\d kB > 15\.0 kB/),
    ]);
  });

  it("holds a showcase page to 25 kB of CSS", () => {
    const read = exportOf({ "/_next/static/chunks/a.css": noise(16_000) });
    expect(checkBudgets([page("/", "showcase", css)], read)).toEqual([]);
  });

  it("fails a page whose gzip HTML, inline RSC payload included, exceeds 50 kB", () => {
    const payload = `<script>self.__next_f.push([1,"${noise(60_000).toString("base64")}"])</script>`;
    expect(
      checkBudgets([page("/changelog", "reading", "", payload)], exportOf({})),
    ).toEqual([
      expect.stringMatching(/^\/changelog: HTML \d+\.\d kB > 50\.0 kB/),
    ]);
  });
});

describe("checkBudgets: fonts", () => {
  const head = `<link rel="preload" href="/_next/static/media/a.woff2" as="font" crossorigin="" type="font/woff2"/>
<link rel="stylesheet" href="/_next/static/chunks/fonts.css"/>`;
  // The stylesheet declares the preloaded face and one more, relative to itself.
  const css = `@font-face{src:url(../media/a.woff2)}@font-face{src:url("../media/b.woff2") format("woff2")}`;

  it("passes fonts within 120 kB, of which at most 75 kB preloaded", () => {
    const read = exportOf({
      "/_next/static/chunks/fonts.css": css,
      "/_next/static/media/a.woff2": noise(70_000),
      "/_next/static/media/b.woff2": noise(40_000),
    });
    expect(checkBudgets([page("/faq", "reading", head)], read)).toEqual([]);
  });

  it("fails a page whose preloaded fonts exceed 75 kB at file size", () => {
    const read = exportOf({
      "/_next/static/chunks/fonts.css": css,
      "/_next/static/media/a.woff2": noise(80_000),
      "/_next/static/media/b.woff2": noise(10_000),
    });
    expect(checkBudgets([page("/faq", "reading", head)], read)).toEqual([
      expect.stringMatching(/^\/faq: preloaded fonts 80\.0 kB > 75\.0 kB/),
    ]);
  });

  it("fails a page whose fonts, preloaded or declared in its CSS, exceed 120 kB", () => {
    const read = exportOf({
      "/_next/static/chunks/fonts.css": css,
      "/_next/static/media/a.woff2": noise(70_000),
      "/_next/static/media/b.woff2": noise(60_000),
    });
    expect(checkBudgets([page("/", "showcase", head)], read)).toEqual([
      expect.stringMatching(/^\/: fonts 130\.0 kB > 120\.0 kB/),
    ]);
  });
});
