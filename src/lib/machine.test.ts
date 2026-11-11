import { describe, expect, it } from "vitest";
import { PAGES, SITE_URL } from "@/content/pages";
import { SNAPSHOT } from "@/lib/snapshot";
import {
  llmsTxt,
  machineFiles,
  robotsTxt,
  sitemapXml,
  type MachineSnapshot,
} from "./machine";

const pages = Object.values(PAGES);
const indexable = pages.filter((page) => page.indexable);

const snapshot: MachineSnapshot = {
  source: { repo: "getoxide/oxide", ref: "main", commit: "0123456789abcdef" },
  readme: { definition: SNAPSHOT.readme.definition },
  release: {
    state: "stable",
    releasesUrl: "https://github.com/getoxide/oxide/releases",
    latest: { date: "2026-12-10" },
  },
};

describe("robots.txt", () => {
  it("allows every crawler and names the one absolute sitemap", () => {
    expect(robotsTxt()).toBe(
      [
        "User-agent: *",
        "Allow: /",
        "",
        "Sitemap: https://oxide.cavallinilorenzo.com/sitemap.xml",
        "",
      ].join("\n"),
    );
  });

  it("builds the sitemap line from SITE_URL", () => {
    expect(robotsTxt("https://example.test")).toContain(
      "Sitemap: https://example.test/sitemap.xml",
    );
    expect(robotsTxt()).not.toMatch(/Disallow/);
  });
});

describe("sitemap.xml", () => {
  it("lists every indexable page as an absolute URL and excludes the 404", () => {
    const xml = sitemapXml(pages, null);
    for (const page of indexable) {
      const url =
        page.path === "/"
          ? "https://oxide.cavallinilorenzo.com"
          : `https://oxide.cavallinilorenzo.com${page.path}`;
      expect(xml).toContain(`<loc>${url}</loc>`);
    }
    expect(xml).not.toContain("/404");
    expect(xml).not.toContain(
      "<loc>https://oxide.cavallinilorenzo.com/docs</loc>",
    );
  });

  it("carries lastmod only on /changelog and /download", () => {
    const xml = sitemapXml(pages, "2026-12-10");
    const withLastmod = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)];
    expect(withLastmod).toHaveLength(2);
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const dated = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)]
      .filter((m) => m[1].includes("<lastmod>"))
      .map((m) => /<loc>([^<]+)<\/loc>/.exec(m[1])![1]);
    expect(dated.sort()).toEqual([
      `${SITE_URL}/changelog`,
      `${SITE_URL}/download`,
    ]);
    expect(urls).toHaveLength(indexable.length);
  });

  it("omits lastmod everywhere with no stable release, and never priority or changefreq", () => {
    const xml = sitemapXml(pages, null);
    expect(xml).not.toContain("<lastmod>");
    expect(xml).not.toContain("priority");
    expect(xml).not.toContain("changefreq");
  });
});

describe("llms.txt", () => {
  it("opens with the H1 and the canonical definition as a blockquote", () => {
    const text = llmsTxt(pages, snapshot);
    expect(text.startsWith("# Oxide\n\n")).toBe(true);
    expect(text).toContain(`> ${snapshot.readme.definition}\n`);
  });

  it("lists every indexable page under its registry section", () => {
    const text = llmsTxt(pages, snapshot);
    const headingAt = (heading: string) => text.indexOf(`## ${heading}`);
    expect(headingAt("Docs")).toBeGreaterThan(0);
    expect(headingAt("Guides")).toBeGreaterThan(headingAt("Docs"));
    expect(headingAt("Pages")).toBeGreaterThan(headingAt("Guides"));
    expect(headingAt("Optional")).toBeGreaterThan(headingAt("Pages"));
    for (const page of indexable) {
      const url =
        page.path === "/"
          ? "https://oxide.cavallinilorenzo.com"
          : `https://oxide.cavallinilorenzo.com${page.path}`;
      expect(text, page.path).toContain(`](${url})`);
    }
    expect(text).not.toContain("/404");
  });

  it("puts the repo, releases and changelog under Optional, and links the contributor file", () => {
    const optional = llmsTxt(pages, snapshot).split("## Optional")[1];
    expect(optional).toContain(
      "[Changelog](https://oxide.cavallinilorenzo.com/changelog)",
    );
    expect(optional).toContain(
      "[GitHub repository](https://github.com/getoxide/oxide)",
    );
    expect(optional).toContain(
      "[Releases](https://github.com/getoxide/oxide/releases)",
    );
    expect(optional).toContain(
      "[llms.txt for contributors](https://github.com/getoxide/oxide/blob/0123456789abcdef/llms.txt)",
    );
  });

  it("links at a stable tag when the Snapshot was taken at one", () => {
    const tagged = {
      ...snapshot,
      source: {
        repo: "getoxide/oxide",
        ref: "v1.2.3",
        commit: "0123456789abcdef",
      },
    };
    expect(llmsTxt(pages, tagged)).toContain(
      "[llms.txt for contributors](https://github.com/getoxide/oxide/blob/v1.2.3/llms.txt)",
    );
  });
});

describe("machineFiles", () => {
  it("writes the three root files and derives lastmod from the stable release", () => {
    const files = machineFiles(pages, snapshot);
    expect(files.map((file) => file.path)).toEqual([
      "/robots.txt",
      "/sitemap.xml",
      "/llms.txt",
    ]);
    const sitemap = files.find((file) => file.path === "/sitemap.xml")!;
    expect(sitemap.content).toContain("<lastmod>2026-12-10</lastmod>");
  });

  it("has no lastmod while the release state is not stable", () => {
    const files = machineFiles(pages, {
      ...snapshot,
      release: { ...snapshot.release, state: "prerelease-only" },
    });
    expect(
      files.find((file) => file.path === "/sitemap.xml")!.content,
    ).not.toContain("<lastmod>");
  });
});
