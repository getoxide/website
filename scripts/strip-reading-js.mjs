// Reading pages have no client component: their HTML is complete and their
// only interactivity is native (`<details>`, anchors, the inline OS detection
// on `/download`, the inline copy controls on code blocks). Hydrating them
// would ship the Next/React runtime for nothing and blow the reading TBT
// budget (docs/spec/budgets.md, Core Web Vitals), so after the export this
// step drops the framework's script tags, leaving the GoatCounter script,
// inline scripts and JSON-LD untouched.
//
// The guard is not "did the strip work": that would pass by construction. It
// reads Next's own `page_client-reference-manifest.js` for every reading page
// and fails when the compiled page pulls in any local client component. That
// is the module Next would hydrate, so a page that gains one (a fenced block
// in synced Markdown, say) fails the build instead of silently shipping dead
// controls.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import {
  exportedPages,
  htmlFileOf,
  OUT_DIR,
  registry,
} from "./exported-pages.mjs";

/** A `<script>…</script>` pair or a `<link>` start tag, whatever the quoting. */
export const TAG = /<script\b[^>]*>[\s\S]*?<\/script>|<link\b[^>]*>/gi;

const ATTRIBUTE = (name) =>
  new RegExp(
    String.raw`\b${name}\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))`,
    "i",
  );

/**
 * The value of an attribute on a tag string, or `null`. Single, double and
 * unquoted values all count (Next quotes today; the guard does not rely on
 * it).
 * @param {string} tag
 * @param {string} name
 */
export function attrOf(tag, name) {
  const match = tag.match(ATTRIBUTE(name));
  return match ? (match[1] ?? match[2] ?? match[3]) : null;
}

const isNextScript = (tag) =>
  attrOf(tag, "src")?.startsWith("/_next/") ?? false;

export const isNextScriptResource = (tag) => {
  const rel = attrOf(tag, "rel")?.toLowerCase();
  const href = attrOf(tag, "href");
  if (!href?.startsWith("/_next/")) return false;
  // `modulepreload` is the modern script preload; `preload as="script"` is
  // what older Next output used. Both must go with the scripts.
  return (
    rel === "modulepreload" ||
    (rel === "preload" && attrOf(tag, "as")?.toLowerCase() === "script")
  );
};

/** True while a page still asks the browser for Next's client runtime. */
export const loadsClientRuntime = (html) =>
  [...html.matchAll(/<script\b[^>]*>/g)].some(([tag]) => isNextScript(tag));

/**
 * Removes the Next client scripts and their preloads, and nothing else.
 * @param {string} html
 * @returns {string}
 */
export function stripClientScripts(html) {
  return html.replace(TAG, (tag) =>
    /^<script/i.test(tag)
      ? isNextScript(tag)
        ? ""
        : tag
      : isNextScriptResource(tag)
        ? ""
        : tag,
  );
}

/** Reading pages ship no client runtime; showcase pages keep it. */
export const stripsClientScripts = (page) => page.budgetClass === "reading";

/**
 * Where Next writes the compiled client reference manifest of a page. The
 * 404 is `_not-found` in the build output.
 * @param {string} path
 */
export function clientManifestPath(path) {
  const route = path === "/" ? "" : path === "/404" ? "/_not-found" : path;
  return fileURLToPath(
    new URL(
      `../.next/server/app${route}/page_client-reference-manifest.js`,
      import.meta.url,
    ),
  );
}

/**
 * The local (`src/`, not `node_modules`) modules a page's compiled client
 * reference manifest lists. These are the modules hydration would boot.
 * `clientModules` only: the manifest's `rscModuleMapping` and friends also
 * name server modules, which are not client components.
 * @param {string} source the manifest file's contents
 * @returns {string[]}
 */
export function localClientModules(source) {
  const sandbox = {};
  try {
    runInNewContext(source, sandbox, { timeout: 1000 });
  } catch {
    throw new Error(
      "the page client reference manifest could not be read: the guard cannot verify the page",
    );
  }
  const manifests = Object.values(sandbox.__RSC_MANIFEST ?? {});
  if (manifests.length === 0) {
    throw new Error(
      "the page client reference manifest has no entries: the guard cannot verify the page",
    );
  }
  const local = [];
  for (const entry of manifests) {
    if (
      !entry ||
      typeof entry.clientModules !== "object" ||
      !entry.clientModules
    ) {
      throw new Error(
        "the page client reference manifest has no clientModules: the guard cannot verify the page",
      );
    }
    for (const name of Object.keys(entry.clientModules)) {
      if (name.includes("[project]/src/")) {
        local.push(name.replace("[project]/", ""));
      }
    }
  }
  return [...new Set(local)];
}

/**
 * Fails when a reading page pulls in a local client component. Pure: takes the
 * manifest source and returns the offending modules (empty when clean).
 * @param {string} source
 * @returns {string[]}
 */
export function clientComponentsOf(source) {
  return localClientModules(source);
}

async function main() {
  const pages = exportedPages(OUT_DIR, await registry());
  const reading = pages.filter(stripsClientScripts);
  const offences = [];
  for (const page of reading) {
    const manifest = readFileSync(clientManifestPath(page.path), "utf8");
    for (const name of clientComponentsOf(manifest)) {
      offences.push(`${page.path} renders the client component ${name}`);
    }
  }
  if (offences.length > 0) {
    console.error(
      "Reading pages must ship no client runtime (docs/spec/budgets.md):",
    );
    for (const offence of offences) console.error(`  - ${offence}`);
    console.error(
      "Replace the client component with static markup plus an inline script, or move the page to the showcase class.",
    );
    process.exit(1);
  }

  let stripped = 0;
  for (const page of reading) {
    const html = stripClientScripts(page.html);
    if (loadsClientRuntime(html)) {
      throw new Error(`${page.path}: a Next client script survived the strip`);
    }
    if (!/data-goatcounter=/.test(html)) {
      throw new Error(`${page.path}: the GoatCounter script was removed`);
    }
    if (html !== page.html) {
      writeFileSync(join(OUT_DIR, htmlFileOf(page.path)), html);
      stripped++;
    }
  }
  console.log(
    `Reading pages ship no client runtime: ${stripped} of ${reading.length} stripped, no client components in any page manifest.`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
