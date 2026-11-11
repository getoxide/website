import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FEATURE_GROUPS } from "@/content/features";
import { checkFeatureContract, featureSections, leadInKey } from "./features";
import { SNAPSHOT, type Snapshot } from "./snapshot";

const withLeadIns = (leadIns: string[][]): Snapshot => ({
  ...SNAPSHOT,
  readme: {
    ...SNAPSHOT.readme,
    features: leadIns.map((l, i) => ({ group: `Group ${i}`, leadIns: l })),
  },
});

/** Every contract lead-in, without the closing period. */
const CURRENT = FEATURE_GROUPS.map((g) =>
  g.features.map((f) => f.leadIn.replace(/\.$/, "")),
);

/** A README from before oxide#416, which lacks the Pull requests lead-in. */
const BEFORE_416 = CURRENT.map((leadIns) =>
  leadIns.filter((l) => l !== "Pull requests, from review to merge"),
);

const DECK = readFileSync(
  new URL("../../docs/spec/copy.md", import.meta.url),
  "utf8",
);
const contractTable = DECK.split("### The feature-name contract")[1].split(
  "Capture captions are constraints-only",
)[0];

describe("the feature-name contract and the Copy deck", () => {
  const rows = contractTable
    .split("\n")
    .filter((line) => line.startsWith("| ") && !/^\| (README|---)/.test(line));
  const features = FEATURE_GROUPS.flatMap((g) => g.features);

  it("has one contract entry per deck row, in the deck's order", () => {
    expect(
      features.map((f) => [f.leadIn, f.heading, `\`#${f.anchor}\``]),
    ).toEqual(
      rows.map((row) =>
        row
          .split("|")
          .slice(1, 4)
          .map((cell) => cell.trim()),
      ),
    );
  });

  it("renders every locked key sentence verbatim", () => {
    for (const feature of features) {
      const row = rows.find((r) => r.includes(`\`#${feature.anchor}\``))!;
      for (const sentence of feature.keySentences) {
        expect(row).toContain(sentence);
      }
    }
  });

  it("carries the group headings and key sentences of the deck", () => {
    for (const group of FEATURE_GROUPS) {
      expect(contractTable).toContain(`: ${group.heading}\n`);
      expect(contractTable).toContain(`Group key sentence: ${group.sentence}`);
    }
  });
});

describe("checkFeatureContract", () => {
  it("passes for the README as the Snapshot carries it today", () => {
    expect(checkFeatureContract(SNAPSHOT)).toEqual({
      unknown: [],
      missing: [],
    });
  });

  it("reports the Pull requests lead-in missing from an older README", () => {
    expect(checkFeatureContract(withLeadIns(BEFORE_416)).missing).toEqual([
      "Pull requests, from review to merge.",
    ]);
  });

  it("fails on a Snapshot lead-in the contract lacks", () => {
    const next = CURRENT.map((l, i) => (i === 2 ? [...l, "Plugins"] : l));
    expect(checkFeatureContract(withLeadIns(next)).unknown).toEqual([
      "Plugins",
    ]);
  });

  it("fails on a renamed lead-in, in both directions", () => {
    const renamed = CURRENT.map((l) =>
      l.map((x) => (x === "Line comments" ? "Inline comments" : x)),
    );
    expect(checkFeatureContract(withLeadIns(renamed))).toEqual({
      unknown: ["Inline comments"],
      missing: ["Line comments."],
    });
  });

  it("does not mind the closing period or a different group split", () => {
    expect(leadInKey("Threads.")).toBe(leadInKey("Threads"));
    const flat = withLeadIns([CURRENT.flat().map((l) => `${l}.`)]);
    expect(checkFeatureContract(flat)).toEqual({ unknown: [], missing: [] });
  });
});

describe("featureSections", () => {
  const anchors = (snapshot: Snapshot) =>
    featureSections(snapshot).flatMap((g) => g.features.map((f) => f.anchor));

  it("has one section per README lead-in, grouped in loop order", () => {
    expect(featureSections(SNAPSHOT).map((g) => g.heading)).toEqual([
      "One app, every agent CLI",
      "Review before you merge",
      "A full workspace around the conversation",
    ]);
    expect(anchors(SNAPSHOT)).toEqual([
      "multiple-providers",
      "threads",
      "permission-modes",
      "slash-commands",
      "worktrees",
      "verification-dossier",
      "blind-review",
      "diff-by-turn",
      "line-comments",
      "restore",
      "rule-suggestions",
      "pull-requests",
      "git-and-github",
      "code-editor",
      "terminal",
      "dictation",
      "keyboard",
    ]);
  });

  it("renders #pull-requests only once the Snapshot carries its lead-in", () => {
    expect(anchors(SNAPSHOT)).toContain("pull-requests");
    expect(anchors(withLeadIns(BEFORE_416))).not.toContain("pull-requests");
    const group = featureSections(SNAPSHOT).find(
      (g) => g.heading === "Review before you merge",
    )!;
    expect(group.features.at(-1)!.anchor).toBe("pull-requests");
  });

  it("points Git and GitHub at Pull requests only when that section renders", () => {
    const git = (s: Snapshot) =>
      featureSections(s)
        .flatMap((g) => g.features)
        .find((f) => f.anchor === "git-and-github")!;
    expect(git(SNAPSHOT).see?.anchor).toBe("pull-requests");
    expect(git(withLeadIns(BEFORE_416)).see).toBeNull();
  });

  it("refuses to render a Snapshot lead-in the contract lacks", () => {
    const next = CURRENT.map((l, i) => (i === 0 ? [...l, "Plugins"] : l));
    expect(() => featureSections(withLeadIns(next))).toThrow(/Plugins/);
  });

  it("keeps the merge, auto-merge and Fix claims out while the section is absent", () => {
    const text = JSON.stringify(featureSections(withLeadIns(BEFORE_416)));
    expect(text).not.toMatch(/auto-merge|Fix sends|Merge, squash/);
  });
});
