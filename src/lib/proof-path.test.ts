import { describe, expect, it } from "vitest";
import { SNAPSHOT, type Snapshot } from "./snapshot";
import { hasPullRequestLeadIn, proofSteps } from "./proof-path";

const withLeadIns = (leadIns: string[]): Snapshot => ({
  ...SNAPSHOT,
  readme: {
    ...SNAPSHOT.readme,
    features: [{ group: "Review before you merge", leadIns }],
  },
});

// Copy deck, Home → Proof points: steps 3 and 4 rest on the README lead-in
// "Pull requests, from review to merge." (oxide#416).
describe("hasPullRequestLeadIn", () => {
  it("is false while the README has no such lead-in", () => {
    expect(hasPullRequestLeadIn(withLeadIns(["Diff by Turn"]))).toBe(false);
  });

  it("is true once a Features lead-in carries it, with or without the period", () => {
    for (const leadIn of [
      "Pull requests, from review to merge",
      "Pull requests, from review to merge.",
    ]) {
      expect(hasPullRequestLeadIn(withLeadIns(["Blind review", leadIn]))).toBe(
        true,
      );
    }
  });

  it("does not match a lead-in that only starts like it", () => {
    expect(hasPullRequestLeadIn(withLeadIns(["Pull requests"]))).toBe(false);
  });
});

describe("proofSteps", () => {
  it("is Prompt and Review until the lead-in exists", () => {
    expect(
      proofSteps(withLeadIns(["Diff by Turn"])).map((s) => s.heading),
    ).toEqual(["Prompt", "Review"]);
  });

  it("is all four steps in order once it does", () => {
    expect(
      proofSteps(withLeadIns(["Pull requests, from review to merge"])).map(
        (s) => s.heading,
      ),
    ).toEqual(["Prompt", "Review", "Pull request", "Merge"]);
  });
});
