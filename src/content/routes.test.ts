import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { PAGES } from "./pages";

const APP = fileURLToPath(new URL("../app", import.meta.url));

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

/** Every static route the App Router builds from `src/app`, as URL paths. */
function staticRoutes(): string[] {
  const routes: string[] = [];
  for (const file of walk(APP)) {
    const rel = relative(APP, file).split(sep);
    const name = rel.pop()!;
    // Route groups `(x)` do not add a segment.
    const segments = rel.filter((s) => !/^\(.*\)$/.test(s));
    if (/^page\.[jt]sx?$/.test(name)) {
      routes.push("/" + segments.join("/"));
    } else if (/^not-found\.[jt]sx?$/.test(name) && segments.length === 0) {
      routes.push("/404");
    }
  }
  return routes.sort();
}

describe("route coverage", () => {
  it("every static route is in the PAGES registry, and nothing else is", () => {
    const registered = Object.values(PAGES)
      .map((p) => p.path)
      .sort();
    expect(staticRoutes()).toEqual(registered);
  });
});
