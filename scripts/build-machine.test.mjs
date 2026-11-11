import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildMachine } from "./build-machine.mjs";

const SNAPSHOT = {
  source: { repo: "getoxide/oxide", ref: "main" },
  readme: { definition: "Oxide is a desktop app." },
  release: {
    state: "stable",
    releasesUrl: "https://github.com/getoxide/oxide/releases",
    latest: { date: "2026-12-10" },
  },
};

const PAGES = [
  {
    path: "/",
    title: "Oxide: the complete desktop app",
    description: "The home page.",
    indexable: true,
    llmsSection: "Pages",
  },
  {
    path: "/download",
    title: "Download · Oxide",
    description: "Download the app.",
    indexable: true,
    llmsSection: "Pages",
  },
  {
    path: "/404",
    title: "Page not found · Oxide",
    description: null,
    indexable: false,
    llmsSection: null,
  },
];

let dir;
afterEach(() => dir && rmSync(dir, { recursive: true, force: true }));

describe("buildMachine", () => {
  it("writes robots.txt, sitemap.xml and llms.txt to the export root", () => {
    dir = mkdtempSync(join(tmpdir(), "machine-"));
    buildMachine({ outDir: dir, pages: PAGES, snapshot: SNAPSHOT });
    expect(readFileSync(join(dir, "robots.txt"), "utf8")).toContain(
      "Sitemap: https://oxide.cavallinilorenzo.com/sitemap.xml",
    );
    expect(readFileSync(join(dir, "sitemap.xml"), "utf8")).toContain(
      "<lastmod>2026-12-10</lastmod>",
    );
    const llms = readFileSync(join(dir, "llms.txt"), "utf8");
    expect(llms).toContain("# Oxide");
    expect(llms).toContain(
      "- [Oxide: the complete desktop app](https://oxide.cavallinilorenzo.com)",
    );
  });
});
