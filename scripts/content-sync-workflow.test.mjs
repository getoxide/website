import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// The workflow writes to `main` (ticket #33, ADR-0003), so its shape is
// pinned: a text check, since the repo carries no YAML parser.
const wf = readFileSync(
  new URL("../.github/workflows/content-sync.yml", import.meta.url),
  "utf8",
);
const at = (needle) => {
  const i = wf.indexOf(needle);
  expect(i, `missing: ${needle}`).toBeGreaterThan(-1);
  return i;
};

/** The whole step that contains `cmd`, from its `- name:` line. */
const stepOf = (cmd) => wf.slice(wf.lastIndexOf("- name:", at(cmd)), at(cmd));

describe("content-sync workflow", () => {
  it("runs daily and by hand with an optional ref", () => {
    expect(wf).toMatch(/schedule:\s*\n\s*- cron: "[^"]+"/);
    expect(wf).toMatch(/workflow_dispatch:\s*\n\s*inputs:\s*\n\s*ref:/);
    expect(wf).toMatch(/required: false/);
  });

  it("has the minimum permissions: contents write and nothing else", () => {
    expect(wf).toMatch(/^permissions:\s*\n\s+contents: write\s*\n/m);
    expect(wf.match(/^\s+[a-z-]+: (read|write|none)$/gm)).toHaveLength(1);
  });

  it("always works on main and never overlaps itself", () => {
    expect(wf).toMatch(/ref: main/);
    expect(wf).toMatch(/concurrency:\s*\n\s+group: content-sync/);
    expect(wf).not.toMatch(/cancel-in-progress: true/);
  });

  it("does not interpolate the dispatch input into a script", () => {
    expect(wf).not.toMatch(/run:[^\n]*\$\{\{\s*(inputs|github\.event)/);
    expect(wf).toMatch(/SYNC_REF: \$\{\{ inputs\.ref \}\}/);
  });

  it("syncs, stops when unchanged, checks, then commits and pushes last", () => {
    const order = [
      "pnpm sync:oxide",
      "changed=",
      "pnpm test",
      "pnpm build",
      "pnpm check:budgets",
      "pnpm check:copy",
      "pnpm check:concept-links",
      "pnpm e2e",
      "pnpm check:lighthouse",
      "git commit",
      "git push origin HEAD:main",
    ].map(at);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(wf.match(/git push/g)).toHaveLength(1);
  });

  // ADR-0003: a changed Snapshot is pushed only when the site's checks pass.
  // engineering.md defines those as format, lint, typecheck, test, build,
  // budgets, copy, concept links, e2e and Lighthouse (issue #29, item 3).
  it("runs every check engineering.md defines", () => {
    for (const cmd of [
      "pnpm format:check",
      "pnpm lint",
      "pnpm typecheck",
      "pnpm test",
      "pnpm build",
      "pnpm check:budgets",
      "pnpm check:copy",
      "pnpm check:concept-links",
      "pnpm e2e",
      "pnpm check:lighthouse",
    ]) {
      expect(wf, cmd).toContain(cmd);
    }
  });

  it("installs the browser before every check that needs it", () => {
    const browser = at("pnpm exec playwright install");
    expect(browser).toBeLessThan(at("pnpm og:card"));
    expect(browser).toBeLessThan(at("pnpm e2e"));
    expect(browser).toBeLessThan(at("pnpm check:lighthouse"));
  });

  it("regenerates the share card before the tests when the tokens changed", () => {
    const og = stepOf("pnpm og:card");
    expect(og).toContain("steps.sync.outputs.tokens == 'true'");
    expect(at("pnpm og:card")).toBeLessThan(at("pnpm test"));
    expect(wf).toContain("content/oxide/brand");
    expect(wf).toContain("tokens=true");
  });

  it("commits the regenerated card with the Snapshot", () => {
    const commit = stepOf("git commit");
    expect(commit).toContain("public/og.png");
    expect(commit).toContain("assets/og-card.json");
  });

  it("gates every check step on a changed Snapshot", () => {
    for (const cmd of [
      "pnpm format:check",
      "pnpm lint",
      "pnpm typecheck",
      "pnpm test",
      "pnpm build",
      "pnpm check:budgets",
      "pnpm check:copy",
      "pnpm check:concept-links",
      "pnpm e2e",
      "pnpm check:lighthouse",
      "git commit",
    ]) {
      expect(stepOf(cmd), cmd).toContain(
        "steps.sync.outputs.changed == 'true'",
      );
    }
  });

  it("commits as one chore(content) commit naming the Oxide ref", () => {
    expect(wf).toMatch(/chore\(content\): sync from oxide \$/);
  });

  it("labels the summary with the glossary terms that are not on the site", () => {
    expect(wf).toContain("Glossary terms not on the site");
    expect(wf).toContain("GITHUB_STEP_SUMMARY");
  });
});
