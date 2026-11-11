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
    const sync = at("pnpm sync:oxide");
    const changed = at("changed=");
    const test = at("pnpm test");
    const build = at("pnpm build");
    const e2e = at("pnpm e2e");
    const commit = at("git commit");
    const push = at("git push origin HEAD:main");
    expect(sync).toBeLessThan(changed);
    expect(changed).toBeLessThan(test);
    expect(test).toBeLessThan(build);
    expect(build).toBeLessThan(e2e);
    expect(e2e).toBeLessThan(commit);
    expect(commit).toBeLessThan(push);
    expect(wf.match(/git push/g)).toHaveLength(1);
  });

  it("gates every check step on a changed Snapshot", () => {
    for (const cmd of ["pnpm test", "pnpm build", "pnpm e2e", "git commit"]) {
      const step = wf.slice(wf.lastIndexOf("- name:", at(cmd)), at(cmd));
      expect(step, cmd).toContain("steps.sync.outputs.changed == 'true'");
    }
  });

  it("commits as one chore(content) commit naming the Oxide ref", () => {
    expect(wf).toMatch(/chore\(content\): sync from oxide \$/);
  });

  it("lists new glossary terms in the job summary", () => {
    expect(wf).toContain("New glossary terms");
    expect(wf).toContain("GITHUB_STEP_SUMMARY");
  });
});
