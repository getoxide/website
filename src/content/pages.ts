// The page registry: one entry per page, feeding metadata, the sitemap and
// llms.txt (Machine-readable layer #14, decision 10). Titles, H1s and
// descriptions of pages in the Copy deck (docs/spec/copy.md) are locked
// strings; a test compares them with the deck.

/** Production origin. Canonicals and absolute URLs are built from it. */
export const SITE_URL = "https://oxide.cavallinilorenzo.com";

/** Performance tier of a page (docs/spec/budgets.md, Budget classes). */
export type BudgetClass = "showcase" | "reading";

/** JSON-LD a page carries (Machine-readable layer #14, decision 5). */
export type StructuredDataType =
  | "HomeGraph"
  | "WebPage"
  | "TechArticle"
  | "FAQPage";

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
    h1: "The complete desktop app for agentic coding.",
    title: "Oxide: the complete desktop app for Claude Code and Codex",
    description:
      "Oxide drives Claude Code, Codex and Antigravity CLI through the whole loop in one desktop app: prompt, review each Turn, open the pull request and merge.",
    budgetClass: "showcase",
    structuredData: "HomeGraph",
    indexable: true,
    llmsSection: "Pages",
  },
  // Not in the Copy deck: build-written, approved by Lorenzo in review.
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
