import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

describe("package.json", () => {
  // The gate scripts import the TypeScript PAGES registry directly, which
  // needs Node's type stripping; pin it so CI, Vercel and a laptop agree
  // (issue #29, item 19).
  it("requires the Node that can strip types", () => {
    expect(pkg.engines?.node).toBe(">=22.18");
  });

  it("runs both post-export passes before the static-only guard", () => {
    const build = pkg.scripts.build;
    const strip = build.indexOf("strip-reading-js.mjs");
    const defer = build.indexOf("defer-hydration.mjs");
    const check = build.indexOf("check-static.mjs");
    expect(strip).toBeGreaterThan(-1);
    expect(defer).toBeGreaterThan(strip);
    expect(check).toBeGreaterThan(defer);
  });
});
