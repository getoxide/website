import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { findTokenViolations } from "./tokens";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const SYNCED = join(ROOT, "content/oxide/brand/oxide-tokens.css");

const BRAND = `
:root { --ox-font-ui: "Inter"; }
:root, [data-theme="dark"] { --ox-background: #1C1C1E; --ox-text: #E8E6E1; }
[data-theme="light"] { --ox-background: #FBFBFA; }
`;

describe("findTokenViolations", () => {
  it("accepts --ox-* names the brand file defines", () => {
    const css = { "a.css": "body { color: var(--ox-text); }" };
    expect(findTokenViolations(css, BRAND)).toEqual([]);
  });

  it("flags a --ox-* name the brand file does not define", () => {
    const css = { "a.css": "p { color: var(--ox-text-shiny, red); }" };
    expect(findTokenViolations(css, BRAND)).toEqual([
      "a.css: var(--ox-text-shiny) is not defined by the synced brand tokens",
    ]);
  });

  it("flags colour literals: colours come only from --ox-* tokens", () => {
    const css = {
      "b.css": "a { color: #fff; background: rgb(0 0 0 / 50%); }",
      "c.css": "a { border-color: hsl(0 0% 0%); fill: oklch(0.5 0 0); }",
    };
    expect(findTokenViolations(css, BRAND)).toEqual([
      "b.css: colour literal #fff",
      "b.css: colour literal rgb(",
      "c.css: colour literal hsl(",
      "c.css: colour literal oklch(",
    ]);
  });

  it("ignores comments", () => {
    const css = {
      "d.css": "/* var(--ox-nope) #123456 */ a { color: inherit; }",
    };
    expect(findTokenViolations(css, BRAND)).toEqual([]);
  });
});

function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return cssFiles(path);
    return path.endsWith(".css") ? [path] : [];
  });
}

describe("the site's CSS", () => {
  it("uses only --ox-* names the synced brand tokens define, and no colour literals", () => {
    const files = Object.fromEntries(
      cssFiles(join(ROOT, "src")).map((f) => [
        relative(ROOT, f),
        readFileSync(f, "utf8"),
      ]),
    );
    expect(Object.keys(files).length).toBeGreaterThan(0);
    expect(findTokenViolations(files, readFileSync(SYNCED, "utf8"))).toEqual(
      [],
    );
  });
});
