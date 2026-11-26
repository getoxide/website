// The page registry: one entry per page, feeding metadata, the sitemap and
// llms.txt (Machine-readable layer #14, decision 10). Titles, H1s and
// descriptions of pages in the Copy deck (docs/spec/copy.md) are locked
// strings; a test compares them with the deck.

/** Production origin. Canonicals and absolute URLs are built from it. */
export const SITE_URL = "https://getoxide.dev";

/** Performance tier of a page (docs/spec/budgets.md, Budget classes). */
export type BudgetClass = "showcase" | "reading";

/** JSON-LD a page carries (Machine-readable layer #14, decision 5). */
export type StructuredDataType =
  "HomeGraph" | "WebPage" | "TechArticle" | "FAQPage";

/** Section of the site's /llms.txt a page is listed under. */
export type LlmsSection = "Docs" | "Guides" | "Pages" | "Optional";

export type Page = {
  /** URL path, no trailing slash. The 404 is `/404`. */
  path: string;
  h1: string;
  /** The full rendered `<title>`. */
  title: string;
  /** `null` only on pages that are not indexable. */
  description: string | null;
  budgetClass: BudgetClass;
  structuredData: StructuredDataType | null;
  indexable: boolean;
  llmsSection: LlmsSection | null;
};

export const PAGES = {
  home: {
    path: "/",
    h1: "A terminal app that knows your GitHub projects.",
    title: "Oxide: a desktop terminal app for your GitHub Projects",
    description:
      "Open a Project, run as many plain terminals as you like in its folder, and keep your files, GitHub Issues and pull requests in the same window.",
    budgetClass: "showcase",
    structuredData: "HomeGraph",
    indexable: true,
    llmsSection: "Pages",
  },
  features: {
    path: "/features",
    h1: "Everything around your terminals and GitHub",
    title: "Features: terminals, code and GitHub · Oxide",
    description:
      "Open Projects, run many plain terminals with Command blocks, edit files beside them, and handle GitHub Issues and pull requests without leaving Oxide.",
    budgetClass: "showcase",
    structuredData: "WebPage",
    indexable: true,
    llmsSection: "Pages",
  },
  guides: {
    path: "/guides",
    h1: "Guides",
    title: "Guides · Oxide",
    description:
      "Practical guides for Oxide: running coding agent CLIs side by side in plain terminals, and installing or updating Oxide on Linux with APT, DNF or AppImage.",
    budgetClass: "reading",
    structuredData: "WebPage",
    indexable: true,
    llmsSection: "Guides",
  },
  guidesAgents: {
    path: "/guides/running-agents-in-oxide",
    h1: "Running Claude Code, Codex and any CLI in Oxide",
    title: "Running Claude Code and Codex in Oxide · Oxide",
    description:
      "Use Claude Code, Codex, Antigravity CLI or any shell tool side by side in Oxide's plain terminals, with your own shell config, code editor and GitHub tools.",
    budgetClass: "reading",
    structuredData: "TechArticle",
    indexable: true,
    llmsSection: "Guides",
  },
  guidesLinux: {
    path: "/guides/linux-packages-and-updates",
    h1: "Installing and updating Oxide on Linux",
    title: "Linux packages and updates · Oxide",
    description:
      "Install Oxide on Linux with AppImage, .deb or .rpm for x64 and arm64, configure the signed APT and DNF repositories, and verify every download.",
    budgetClass: "reading",
    structuredData: "TechArticle",
    indexable: true,
    llmsSection: "Guides",
  },
  docsQuickStart: {
    path: "/docs/quick-start",
    h1: "Quick start",
    title: "Quick start · Oxide",
    description:
      "Check what Oxide needs, open a Project, start as many plain terminals as you like, browse Files and open Issues or pull requests in four steps.",
    budgetClass: "reading",
    structuredData: "TechArticle",
    indexable: true,
    llmsSection: "Docs",
  },
  docsConcepts: {
    path: "/docs/concepts",
    h1: "Concepts",
    title: "Concepts · Oxide",
    description:
      "The words Oxide uses and what they mean: Project, Terminal, Command block, Surface, Files view, Code workspace, Session restore and update channels.",
    budgetClass: "reading",
    structuredData: "TechArticle",
    indexable: true,
    llmsSection: "Docs",
  },
  download: {
    path: "/download",
    h1: "Download Oxide",
    title: "Download · Oxide",
    description:
      "Download Oxide for macOS, Windows and Linux (x64 and arm64) from GitHub Releases, configure the signed APT or DNF repository, and verify the file.",
    budgetClass: "reading",
    structuredData: "WebPage",
    indexable: true,
    llmsSection: "Pages",
  },
  faq: {
    path: "/faq",
    h1: "Frequently asked questions",
    title: "FAQ · Oxide",
    description:
      "Answers about Oxide, the open-source desktop terminal app for GitHub Projects: what it is, running agent CLIs in it, supported platforms and privacy.",
    budgetClass: "reading",
    structuredData: "FAQPage",
    indexable: true,
    llmsSection: "Pages",
  },
  changelog: {
    path: "/changelog",
    h1: "Changelog",
    title: "Changelog · Oxide",
    description:
      "Every stable Oxide release, newest first: breaking changes, new features and fixes, with a link to the full release notes on GitHub for each version.",
    budgetClass: "reading",
    structuredData: "WebPage",
    indexable: true,
    // Machine-readable layer #14, decision 7: Changelog is under Optional.
    llmsSection: "Optional",
  },
  // Not in the Copy deck: build-written, approved by Lorenzo or Matteo in review.
  privacy: {
    path: "/privacy",
    h1: "Privacy",
    title: "Privacy · Oxide",
    description:
      "The Oxide app has no telemetry. This site counts page views with GoatCounter, without cookies and only in aggregate. Here is what is counted.",
    budgetClass: "reading",
    structuredData: "WebPage",
    indexable: true,
    llmsSection: "Pages",
  },
  notFound: {
    path: "/404",
    h1: "Page not found",
    title: "Page not found · Oxide",
    description: null,
    budgetClass: "reading",
    structuredData: null,
    indexable: false,
    llmsSection: null,
  },
} as const satisfies Record<string, Page>;

export type PageKey = keyof typeof PAGES;
