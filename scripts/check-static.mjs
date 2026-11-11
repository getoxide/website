// Static-only guard (ADR-0002). Runs after `next build` and fails if the site
// stops being fully prerendered, gains server-side code, or an exported page
// is missing from `out/`.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_EXT = /\.(?:[cm]?[jt]sx?)$/;
const NOT_FOUND = "/_not-found";
// Next-internal pages that are prerendered but never written to `out/`.
const NOT_EXPORTED = new Set(["/_global-error"]);

function htmlFileFor(route) {
  if (route === "/") return "index.html";
  if (route === NOT_FOUND) return "404.html";
  return `${route.slice(1)}.html`;
}

/**
 * Pure check over build manifests, the list of source files and, when given,
 * the files of the static export (paths relative to `out/`).
 * Returns a list of human-readable violations (empty when the site is static).
 */
export function findViolations({
  appPaths,
  prerendered,
  dynamicRoutes,
  middleware,
  functions,
  serverActions,
  sourceFiles,
  exported,
}) {
  const violations = [];
  const prerenderedSet = new Set(prerendered);
  const exportedSet = exported ? new Set(exported) : null;

  for (const key of Object.keys(appPaths)) {
    const isPage = key.endsWith("/page");
    const route = key.replace(/\/(?:page|route)$/, "") || "/";
    if (!prerenderedSet.has(route)) {
      violations.push(`route ${route} is not prerendered as static`);
    }
    if (
      exportedSet &&
      isPage &&
      !NOT_EXPORTED.has(route) &&
      !exportedSet.has(htmlFileFor(route))
    ) {
      violations.push(
        `page ${route} has no ${htmlFileFor(route)} in the static export`,
      );
    }
  }
  for (const route of dynamicRoutes) {
    violations.push(`dynamic route ${route} is not allowed`);
  }
  if (Object.keys(middleware).length > 0 || Object.keys(functions).length > 0) {
    violations.push("proxy/middleware output found in the build");
  }
  const actions = Object.keys(serverActions.node).length;
  const edgeActions = Object.keys(serverActions.edge).length;
  if (actions + edgeActions > 0) {
    violations.push("server action found in the build");
  }
  for (const file of sourceFiles) {
    const name = file.split("/").pop() ?? "";
    if (/^route\.[cm]?[jt]sx?$/.test(name)) {
      violations.push(`route handler ${file} is not allowed`);
    }
    if (/^(?:proxy|middleware)\.[cm]?[jt]sx?$/.test(name)) {
      violations.push(`proxy/middleware ${file} is not allowed`);
    }
  }
  return violations;
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(path));
    else out.push(path);
  }
  return out;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function readJsonOr(path, fallback) {
  return existsSync(path) ? readJson(path) : fallback;
}

function main() {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const next = join(root, ".next");
  const outDir = join(root, "out");
  const routes = readJson(join(next, "routes-manifest.json"));
  const sourceFiles = walk(join(root, "src")).map((f) => relative(root, f));
  const violations = findViolations({
    appPaths: readJson(join(next, "server/app-paths-manifest.json")),
    prerendered: Object.keys(
      readJson(join(next, "prerender-manifest.json")).routes,
    ),
    dynamicRoutes: routes.dynamicRoutes.map((r) => r.page ?? String(r)),
    middleware: readJsonOr(join(next, "server/middleware-manifest.json"), {
      middleware: {},
    }).middleware,
    functions: readJsonOr(join(next, "server/functions-config-manifest.json"), {
      functions: {},
    }).functions,
    serverActions: readJsonOr(
      join(next, "server/server-reference-manifest.json"),
      { node: {}, edge: {} },
    ),
    sourceFiles,
    exported: existsSync(outDir)
      ? walk(outDir).map((f) => relative(outDir, f))
      : [],
  });

  for (const file of sourceFiles.filter((f) => SOURCE_EXT.test(f))) {
    const head = readFileSync(join(root, file), "utf8").slice(0, 400);
    if (/^\s*(?:\/\/.*\n|\/\*[\s\S]*?\*\/\s*)*["']use server["']/.test(head)) {
      violations.push(`server action directive in ${file}`);
    }
  }

  if (violations.length > 0) {
    console.error("Static-only guard failed (ADR-0002):");
    for (const v of violations) console.error(`  - ${v}`);
    process.exit(1);
  }
  console.log(
    "Static-only guard passed: every route is prerendered and exported.",
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
