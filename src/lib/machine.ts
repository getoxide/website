// The machine-readable layer (Machine-readable layer #14): robots.txt,
// sitemap.xml and the user-facing /llms.txt are generated from the page
// registry and the committed Snapshot, so a page added to `PAGES` is picked up
// by all three without touching this file.
import { SITE_URL, type Page } from "../content/pages.ts";

/** The subset of the Snapshot the machine files need. */
export type MachineSnapshot = {
  source: { repo: string; ref: string };
  readme: { definition: string };
  release: {
    state: "stable" | "prerelease-only" | "none";
    releasesUrl: string;
    latest: { date: string } | null;
  };
};

/** The three root files, as URL paths. */
export const MACHINE_FILES = [
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
] as const;

const absolute = (path: string, siteUrl: string) =>
  path === "/" ? siteUrl : `${siteUrl}${path}`;

/** The one file the robots policy needs: allow all, name the sitemap. */
export function robotsTxt(siteUrl = SITE_URL): string {
  return [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ].join("\n");
}

/**
 * Every indexable page, absolute, with no priority or changefreq. `lastmod` is
 * only where it is verifiable: `/changelog` and `/download`, from the latest
 * stable release date (Machine-readable layer #14, decision 9).
 */
export function sitemapXml(
  pages: readonly Page[],
  lastmod: string | null,
  siteUrl = SITE_URL,
): string {
  const dated = new Set(["/changelog", "/download"]);
  const urls = pages
    .filter((page) => page.indexable)
    .map((page) => {
      const loc = absolute(page.path, siteUrl);
      const date = lastmod && dated.has(page.path) ? lastmod : null;
      return [
        "  <url>",
        `    <loc>${loc}</loc>`,
        ...(date ? [`    <lastmod>${date}</lastmod>`] : []),
        "  </url>",
      ].join("\n");
    });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}

const SECTION_ORDER = ["Docs", "Guides", "Pages", "Optional"] as const;

const titleOf = (page: Page) => page.title.replace(/ · Oxide$/, "");

/**
 * The user-facing /llms.txt (Machine-readable layer #14, decision 7): what
 * Oxide is, then the site's pages grouped by section, then the repository and
 * releases. The contributor file in the repo covers architecture and DevOps.
 */
export function llmsTxt(
  pages: readonly Page[],
  snapshot: MachineSnapshot,
  siteUrl = SITE_URL,
): string {
  const listed = pages.filter((page) => page.indexable && page.llmsSection);
  const sections = SECTION_ORDER.map((section) => {
    const entries = listed
      .filter((page) => page.llmsSection === section)
      .map(
        (page) =>
          `- [${titleOf(page)}](${absolute(page.path, siteUrl)}): ${page.description}`,
      );
    return [`## ${section}`, ...entries];
  });

  const repo = `https://github.com/${snapshot.source.repo}`;
  const optional = sections[sections.length - 1];
  optional.push(
    `- [GitHub repository](${repo}): the source code, issues and discussions.`,
    `- [Releases](${snapshot.release.releasesUrl}): installers and release notes.`,
    "",
    `[llms.txt for contributors](${repo}/blob/${snapshot.source.ref}/llms.txt) covers the architecture, ADRs and DevOps.`,
  );

  return [
    "# Oxide",
    "",
    `> ${snapshot.readme.definition}`,
    "",
    ...sections.flatMap((section) => [...section, ""]),
    "",
  ].join("\n");
}

/** The three root files with their generated contents. */
export function machineFiles(
  pages: readonly Page[],
  snapshot: MachineSnapshot,
  siteUrl = SITE_URL,
): { path: string; content: string }[] {
  const lastmod =
    snapshot.release.state === "stable"
      ? (snapshot.release.latest?.date ?? null)
      : null;
  return [
    { path: "/robots.txt", content: robotsTxt(siteUrl) },
    { path: "/sitemap.xml", content: sitemapXml(pages, lastmod, siteUrl) },
    { path: "/llms.txt", content: llmsTxt(pages, snapshot, siteUrl) },
  ];
}
