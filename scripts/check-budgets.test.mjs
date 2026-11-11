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

describe("checkBudgets: images and page total", () => {
  it("fails a reading page whose initial images exceed 100 kB", () => {
    const body = `<img src="/a.avif" alt="a"/><link rel="preload" as="image" href="/logo.svg"/>`;
    const read = exportOf({
      "/a.avif": noise(95_000),
      "/logo.svg": "x".repeat(10_000),
    });
    expect(checkBudgets([page("/faq", "reading", "", body)], read)).toEqual([
      expect.stringMatching(/^\/faq: initial images 105\.0 kB > 100\.0 kB/),
    ]);
  });

  it("counts the largest candidate of a srcset, and of a <picture> its first <source>", () => {
    const body = `<picture>
<source type="image/avif" srcset="/c-640.avif 640w, /c-1280.avif 1280w"/>
<img src="/c.png" srcset="/c-1280.webp 1280w" alt="capture" width="1280" height="800"/>
</picture>`;
    const read = exportOf({
      "/c-640.avif": noise(40_000),
      "/c-1280.avif": noise(120_000),
      "/c-1280.webp": noise(500_000),
      "/c.png": noise(900_000),
    });
    expect(checkBudgets([page("/faq", "reading", "", body)], read)).toEqual([
      expect.stringMatching(/^\/faq: initial images 120\.0 kB > 100\.0 kB/),
    ]);
  });

  it("leaves lazy images out of the initial images but counts them in the page total", () => {
    const body = `<img src="/a.avif" alt="a" loading="lazy"/><img src="/b.avif" alt="b" loading="lazy"/>`;
    const read = exportOf({
      "/a.avif": noise(200_000),
      "/b.avif": noise(210_000),
    });
    expect(checkBudgets([page("/faq", "reading", "", body)], read)).toEqual([
      expect.stringMatching(/^\/faq: page total 41\d\.\d kB > 400\.0 kB/),
    ]);
  });

  it("holds a showcase page to 300 kB of initial images and 1 MB in total", () => {
    const body = `<img src="/a.avif" alt="a"/><img src="/b.avif" alt="b" loading="lazy"/>`;
    const read = exportOf({
      "/a.avif": noise(290_000),
      "/b.avif": noise(650_000),
    });
    expect(checkBudgets([page("/", "showcase", "", body)], read)).toEqual([]);
  });
});

describe("checkBudgets: video loops", () => {
  const body = `<video preload="none" poster="/loop.avif" muted loop playsinline>
<source src="/loop-av1.mp4" type="video/mp4; codecs=av01.0.05M.08"/>
<source src="/loop-h264.mp4" type="video/mp4"/>
</video>`;

  it("keeps video out of the page total and counts the poster as an initial image", () => {
    const read = exportOf({
      "/loop.avif": noise(20_000),
      "/loop-av1.mp4": noise(900_000),
      "/loop-h264.mp4": noise(1_400_000),
    });
    expect(checkBudgets([page("/", "showcase", "", body)], read)).toEqual([]);
  });

  it("fails a loop over its own 1.5 MB ceiling", () => {
    const read = exportOf({
      "/loop.avif": noise(20_000),
      "/loop-av1.mp4": noise(900_000),
      "/loop-h264.mp4": noise(1_600_000),
    });
    expect(checkBudgets([page("/", "showcase", "", body)], read)).toEqual([
      "/: video /loop-h264.mp4 1600.0 kB > 1500.0 kB (file size, per loop)",
    ]);
  });
});
