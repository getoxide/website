// `pnpm check:budgets`: the per-page ceilings (docs/spec/budgets.md, Per-page
// ceilings; Enforcement in CI). Reads every page of the PAGES registry from
// the static export in `out/`, sums what it references and fails when a page
// exceeds the ceilings of its budget class.
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import {
  OUT_DIR,
  exportedPages,
  readerOf,
  registry,
} from "./exported-pages.mjs";
import { jsReferences } from "./measure-js.mjs";

/** Bytes per kB, as the budgets count them (135,192 bytes = 135.2 kB). */
const KB = 1000;

/** Ceilings per budget class, in bytes (Per-page ceilings table). */
export const CEILINGS = {
  showcase: {
    js: 185_200,
    css: 25_000,
    html: 50_000,
    fonts: 120_000,
    preloadedFonts: 75_000,
    initialImages: 300_000,
    total: 1_000_000,
  },
  reading: {
    js: 155_200,
    css: 15_000,
    html: 50_000,
    fonts: 120_000,
    preloadedFonts: 75_000,
    initialImages: 100_000,
    total: 400_000,
  },
};

/** Per-loop ceiling of a video file (Product captures, Video loops). */
export const VIDEO_CEILING = 1_500_000;

/** What each ceiling measures, in report order. */
const MEASURES = [
  ["js", "JS", "gzip"],
  ["css", "CSS", "gzip"],
  ["html", "HTML", "gzip, inline RSC payload included"],
  ["fonts", "fonts", "file size, preloaded or declared in the page's CSS"],
  ["preloadedFonts", "preloaded fonts", "file size"],
  ["initialImages", "initial images", "file size, not lazy"],
  ["total", "page total", "excluding video"],
];

const FONT = /\.(?:woff2?|ttf|otf|eot)(?:[?#]|$)/i;

const kb = (bytes) => `${(bytes / KB).toFixed(1)} kB`;
const unique = (list) => [...new Set(list)];
/** The URL path of a reference, query and hash dropped. */
const pathOf = (src, base = "http://x/") => new URL(src, base).pathname;

/** The value of an attribute in one tag, or `null`. */
const attr = (tag, name) =>
  tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i"))?.[1] ?? null;

/** Every `<link>` tag of the page with its attributes, in order. */
function links(html) {
  return [...html.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => ({
    rel: (attr(tag, "rel") ?? "").toLowerCase(),
    as: (attr(tag, "as") ?? "").toLowerCase(),
    href: attr(tag, "href") ?? "",
  }));
}

/** Stylesheets the page loads or preloads, once each. */
function cssReferences(html) {
  return unique(
    links(html)
      .filter(
        (l) =>
          l.href &&
          (l.rel.split(/\s+/).includes("stylesheet") ||
            (l.rel === "preload" && l.as === "style")),
      )
      .map((l) => l.href),
  );
}

/** Fonts the page preloads, once each. */
function preloadedFontReferences(html) {
  return unique(
    links(html)
      .filter((l) => l.href && l.rel === "preload" && l.as === "font")
      .map((l) => pathOf(l.href)),
  );
}

/** URL paths of every `url(...)` in a stylesheet, resolved against it. */
function cssUrls(css, cssHref) {
  const base = new URL(cssHref, "http://x/");
  return [...css.matchAll(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi)]
    .map((m) => m[2])
    .filter((u) => !u.startsWith("data:"))
    .map((u) => pathOf(u, base));
}

/** The URLs of a `srcset`, descriptors dropped. */
const srcsetUrls = (srcset) =>
  (srcset ?? "")
    .split(",")
    .map((c) => c.trim().split(/\s+/)[0])
    .filter(Boolean);

/**
 * Images the page shows, each as the candidate URLs one of them is picked
 * from. In a `<picture>` the browser takes its first `<source>` it supports;
 * the first one is the preferred format, so that is the one counted.
 */
function imageReferences(html) {
  const images = [];
  const pictures = /<picture\b[^>]*>([\s\S]*?)<\/picture>/gi;
  for (const [, inner] of html.matchAll(pictures)) {
    const img = inner.match(/<img\b[^>]*>/i)?.[0] ?? "";
    const source = inner.match(/<source\b[^>]*>/i)?.[0];
    const candidates = source
      ? srcsetUrls(attr(source, "srcset"))
      : [...srcsetUrls(attr(img, "srcset")), attr(img, "src")];
    images.push({ candidates, lazy: attr(img, "loading") === "lazy" });
  }
  for (const [tag] of html.replace(pictures, "").matchAll(/<img\b[^>]*>/gi)) {
    images.push({
      candidates: [...srcsetUrls(attr(tag, "srcset")), attr(tag, "src")],
      lazy: attr(tag, "loading") === "lazy",
    });
  }
  for (const [tag] of html.matchAll(/<video\b[^>]*>/gi)) {
    if (attr(tag, "poster")) {
      images.push({ candidates: [attr(tag, "poster")], lazy: false });
    }
  }
  for (const l of links(html)) {
    if (l.rel === "preload" && l.as === "image" && l.href) {
      images.push({ candidates: [l.href], lazy: false });
    }
  }
  return images.map(({ candidates, lazy }) => ({
    candidates: candidates
      .filter((c) => c && !c.startsWith("data:"))
      .map((c) => pathOf(c)),
    lazy,
  }));
}

/** Video files the page references, once each. */
function videoReferences(html) {
  const videos = [];
  for (const [, inner] of html.matchAll(
    /<video\b[^>]*>([\s\S]*?)<\/video>/gi,
  )) {
    for (const [tag] of inner.matchAll(/<source\b[^>]*>/gi)) {
      if (attr(tag, "src")) videos.push(pathOf(attr(tag, "src")));
    }
  }
  for (const [tag] of html.matchAll(/<video\b[^>]*>/gi)) {
    if (attr(tag, "src")) videos.push(pathOf(attr(tag, "src")));
  }
  return unique(videos);
}

/** Sizes of one exported page, in bytes, as the budgets count them. */
export function measurePage(html, read) {
  const gzip = (src) => gzipSync(read(src)).length;
  const file = (src) => read(src).length;
  const sum = (list, size) => list.reduce((total, x) => total + size(x), 0);

  const stylesheets = cssReferences(html);
  const fromCss = stylesheets.flatMap((href) =>
    cssUrls(read(href).toString("utf8"), href),
  );
  const preloadedFonts = preloadedFontReferences(html);
  const fonts = unique([
    ...preloadedFonts,
    ...fromCss.filter((u) => FONT.test(u)),
  ]);

  // An image counts once, at its largest candidate, initial if any use of it
  // is not lazy. Images a stylesheet references load with it: initial.
  const images = new Map();
  const addImage = (path, lazy) =>
    images.set(path, (images.get(path) ?? true) && lazy);
  for (const { candidates, lazy } of imageReferences(html)) {
    if (candidates.length === 0) continue;
    const largest = candidates.reduce((a, b) => (file(b) > file(a) ? b : a));
    addImage(largest, lazy);
  }
  for (const u of fromCss.filter((u) => !FONT.test(u))) addImage(u, false);
  const allImages = [...images.keys()];
  const initialImages = allImages.filter((p) => !images.get(p));

  const sizes = {
    js: sum(jsReferences(html), gzip),
    css: sum(stylesheets, gzip),
    html: gzipSync(html).length,
    fonts: sum(fonts, file),
    preloadedFonts: sum(preloadedFonts, file),
    initialImages: sum(initialImages, file),
  };
  sizes.total =
    sizes.js + sizes.css + sizes.html + sizes.fonts + sum(allImages, file);
  sizes.videos = videoReferences(html).map((src) => ({
    src,
    bytes: file(src),
  }));
  return sizes;
}

/**
 * @param {{ path: string, budgetClass: keyof typeof CEILINGS, html: string }[]} pages
 * @param {(src: string) => Buffer} read reads an exported file by its URL path
 * @returns {string[]} one line per exceeded ceiling, empty when all fit
 */
export function checkBudgets(pages, read) {
  const violations = [];
  for (const { path, budgetClass, html } of pages) {
    const ceilings = CEILINGS[budgetClass];
    const sizes = measurePage(html, read);
    for (const [key, label, how] of MEASURES) {
      if (sizes[key] > ceilings[key]) {
        violations.push(
          `${path}: ${label} ${kb(sizes[key])} > ${kb(ceilings[key])} (${how}, ${budgetClass})`,
        );
      }
    }
    for (const { src, bytes } of sizes.videos) {
      if (bytes > VIDEO_CEILING) {
        violations.push(
          `${path}: video ${src} ${kb(bytes)} > ${kb(VIDEO_CEILING)} (file size, per loop)`,
        );
      }
    }
  }
  return violations;
}

async function main() {
  const pages = exportedPages(OUT_DIR, await registry());
  const read = readerOf(OUT_DIR);
  for (const { path, budgetClass, html } of pages) {
    const s = measurePage(html, read);
    console.log(
      `${path} (${budgetClass}): JS ${kb(s.js)}, CSS ${kb(s.css)}, HTML ${kb(s.html)}, fonts ${kb(s.fonts)} (preloaded ${kb(s.preloadedFonts)}), initial images ${kb(s.initialImages)}, total ${kb(s.total)}`,
    );
  }
  const violations = checkBudgets(pages, read);
  if (violations.length > 0) {
    console.error(
      "\nBudgets failed (docs/spec/budgets.md, Per-page ceilings):",
    );
    for (const v of violations) console.error(`  - ${v}`);
    process.exit(1);
  }
  console.log(`\nBudgets passed: ${pages.length} pages within their ceilings.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
