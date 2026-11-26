import { describe, expect, it } from "vitest";
import { proofSteps } from "./proof-path";

describe("proofSteps", () => {
  it("returns all four steps in order", () => {
    expect(proofSteps().map((s) => s.heading)).toEqual([
      "Projects",
      "Terminals",
      "Code",
      "GitHub",
    ]);
  });
});
