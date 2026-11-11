// Site-owned strings. H1s, titles and descriptions live in the PAGES registry.
// Locked strings come verbatim from the Copy deck (docs/spec/copy.md).

export const GITHUB_REPO_URL = "https://github.com/getoxide/oxide";

export const COPY = {
  skipLink: "Skip to content",

  /** Copy deck, Home → Hero (frozen). */
  hero: {
    subheadline:
      "Prompt, review, pull request and merge, with Claude Code, Codex and Antigravity CLI.",
  },

  /** Copy deck, 404 (locked). */
  notFound: {
    sentence:
      "This page doesn't exist. Oxide's published URLs never move without a redirect, so if a link brought you here, it's a bug worth reporting.",
    links: [
      { label: "Home", href: "/" },
      { label: "Docs", href: "/docs/quick-start" },
      { label: "Report a broken link", href: `${GITHUB_REPO_URL}/issues/new` },
    ],
  },

  /**
   * `/privacy`, build-written (not in the Copy deck): a draft Lorenzo
   * approves in review. Wording constraints from the Measurement plan (#16):
   * the app has no telemetry, the site counts page views without cookies
   * through GoatCounter, aggregate only, and never "collects nothing".
   */
  privacy: {
    lead: "What the Oxide app and this website count, and what they don't.",
    app: {
      heading: "The Oxide app",
      sentence: "The Oxide app has no telemetry.",
      readmeLead: "Where your prompts and code go is answered in the",
      readmeLink: "Oxide README's FAQ",
    },
    site: {
      heading: "This website",
      paragraphs: [
        "This site counts page views with GoatCounter, without cookies. GoatCounter keeps aggregate counts only: no IP address and no visitor ID are stored, so a count never points back to you.",
        "Clicks on the download and GitHub buttons are counted the same way, as aggregate events. The real number of downloads comes from GitHub's own release statistics, not from this site.",
        "GoatCounter is the only third party the site contacts. Fonts and images are served from this site, and there are no embeds or other analytics.",
      ],
    },
  },
} as const;
