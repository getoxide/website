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

const CURRENT = FEATURE_GROUPS.map((g) =>
  g.features.map((f) => f.leadIn.replace(/\.$/, "")),
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

  it("fails on a Snapshot lead-in the contract lacks", () => {
    const next = CURRENT.map((l, i) => (i === 1 ? [...l, "Plugins"] : l));
    expect(checkFeatureContract(withLeadIns(next)).unknown).toEqual([
      "Plugins",
    ]);
  });

  it("fails on a renamed lead-in, in both directions", () => {
    const renamed = CURRENT.map((l) =>
      l.map((x) => (x === "Issues" ? "Bug tracker" : x)),
    );
    expect(checkFeatureContract(withLeadIns(renamed))).toEqual({
      unknown: ["Bug tracker"],
      missing: ["Issues."],
    });
  });

  it("does not mind the closing period or a different group split", () => {
    expect(leadInKey("Issues.")).toBe(leadInKey("Issues"));
    const flat = withLeadIns([CURRENT.flat().map((l) => `${l}.`)]);
    expect(checkFeatureContract(flat)).toEqual({ unknown: [], missing: [] });
  });
});

describe("featureSections", () => {
  const anchors = (snapshot: Snapshot) =>
    featureSections(snapshot).flatMap((g) => g.features.map((f) => f.anchor));

  it("has one section per README lead-in, grouped in order", () => {
    expect(featureSections(SNAPSHOT).map((g) => g.heading)).toEqual([
      "Projects and plain terminals",
      "GitHub at hand",
    ]);
    expect(anchors(SNAPSHOT)).toEqual([
      "open-projects",
      "many-terminals",
      "command-blocks",
      "issues",
      "pull-requests",
      "files",
    ]);
  });

  it("refuses to render a Snapshot lead-in the contract lacks", () => {
    const next = CURRENT.map((l, i) => (i === 0 ? [...l, "Plugins"] : l));
    expect(() => featureSections(withLeadIns(next))).toThrow(/Plugins/);
  });
});
