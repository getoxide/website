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
    h1: "The complete desktop app for agentic coding.",
    title: "Oxide: the complete desktop app for Claude Code and Codex",
    description:
      "Oxide drives Claude Code, Codex and Antigravity CLI through the whole loop in one desktop app: prompt, review each Turn, open the pull request and merge.",
    budgetClass: "showcase",
    structuredData: "HomeGraph",
    indexable: true,
    llmsSection: "Pages",
  },
  features: {
    path: "/features",
    h1: "Everything between the prompt and the merge",
    title: "Features: from the prompt to the merge · Oxide",
    description:
      "Every Oxide feature, from the prompt to the merge: drive three agent CLIs, review each Turn and what actually ran, then open the pull request and merge it.",
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
      "Practical guides to reviewing what coding agents write: a method for AI-generated code, and using Claude Code and Codex together as writer and reviewer.",
    budgetClass: "reading",
    structuredData: "WebPage",
    indexable: true,
    llmsSection: "Guides",
  },
  guidesReview: {
    path: "/guides/review-ai-generated-code",
    h1: "How to review AI-generated code before you merge",
    title: "How to review AI-generated code · Oxide",
    description:
      "A four-step method to review AI-generated code: read one Turn at a time, check what actually ran, send feedback where it belongs, undo what you don't want.",
    budgetClass: "reading",
    structuredData: "TechArticle",
    indexable: true,
    llmsSection: "Guides",
  },
  guidesCodex: {
    path: "/guides/claude-code-and-codex-together",
    h1: "Claude Code and Codex together: one writes, the other reviews",
    title: "Claude Code and Codex together, with Blind review · Oxide",
    description:
      "Use Claude Code and Codex together: let one agent write the change and have the other review only the diff and the issue, never the original conversation.",
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
      "Install a Provider, open a Project, start a Thread, review the Turn in the Diff Surface, then commit, push and open the pull request. Oxide in five steps.",
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
      "The words Oxide uses and what they mean: Project, Thread, Turn, Provider, Surface, Checkpoint, Verification Dossier, Blind review and Restore.",
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
      "Download the Oxide desktop app from GitHub Releases, verify the file, and connect the Claude Code, Codex or Antigravity CLI you already have installed.",
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
      "Answers about Oxide, the open-source desktop app for Claude Code and Codex: what it is, what it is not, where your code goes and how it differs.",
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
