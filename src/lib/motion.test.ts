import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { MOTION_SCRIPT } from "./motion";

function run(reduced: boolean) {
  const dataset: Record<string, string> = {};
  runInNewContext(MOTION_SCRIPT, {
    matchMedia: (query: string) => ({
      matches: reduced && query === "(prefers-reduced-motion: reduce)",
    }),
    document: { documentElement: { dataset } },
  });
  return dataset;
}

// ADR-0001: a hidden start state applies only when JavaScript runs and motion
// is allowed.
describe("MOTION_SCRIPT", () => {
  it("marks the document when motion is allowed", () => {
    expect(run(false)).toEqual({ motion: "" });
  });

  it("leaves the document alone under reduced motion", () => {
    expect(run(true)).toEqual({});
  });
});
