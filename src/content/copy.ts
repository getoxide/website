// Site-owned strings. H1s, titles and descriptions live in the PAGES registry.
// Locked strings come verbatim from the Copy deck (docs/spec/copy.md).

export const GITHUB_REPO_URL = "https://github.com/getoxide/oxide";

export type Link = { label: string; href: string };

export const COPY = {
  skipLink: "Skip to content",

  /**
   * Site header. Labels and targets from Page inventory (#9), Header; the
   * logo's alt text, the GitHub link's name and "Menu" are build-written.
   */
  header: {
    logoAlt: "Oxide",
    links: [
      { label: "Features", href: "/features" },
      { label: "Docs", href: "/docs/quick-start" },
      { label: "Guides", href: "/guides" },
      { label: "Changelog", href: "/changelog" },
    ] satisfies Link[],
    github: { label: "GitHub", href: GITHUB_REPO_URL },
    download: { label: "Download", href: "/download" },
    menu: "Menu",
  },

  /**
   * Site footer: columns, trust line and disclaimers verbatim from Page
   * inventory (#9), Footer. The canonical definition block joins it with the
   * content snapshot (#32).
   */
  footer: {
    columns: [
      {
        heading: "Product",
        links: [
          { label: "Features", href: "/features" },
          { label: "Download", href: "/download" },
          { label: "Changelog", href: "/changelog" },
          { label: "FAQ", href: "/faq" },
        ],
      },
      {
        heading: "Use with",
        links: [
          { label: "Claude Code", href: "/claude-code-gui" },
          { label: "Codex", href: "/codex-gui" },
        ],
      },
      {
        heading: "Resources",
        links: [
          { label: "Docs", href: "/docs/quick-start" },
          { label: "Guides", href: "/guides" },
          { label: "GitHub", href: GITHUB_REPO_URL },
          { label: "llms.txt", href: "/llms.txt" },
        ],
      },
    ] satisfies { heading: string; links: Link[] }[],
    trustLine: "Free and open source (MIT) · Local · No account · No telemetry",
    repo: { label: "getoxide/oxide", href: GITHUB_REPO_URL },
    notAffiliated: "Not affiliated with Oxide Computer Company",
    trademarks:
      "Claude Code, Codex and Antigravity are trademarks of their respective owners; Oxide is not affiliated with or endorsed by Anthropic, OpenAI or Google",
    madeBy: {
      label: "Made by Lorenzo Cavallini",
      href: "https://cavallinilorenzo.com",
    },
    privacy: { label: "Privacy", href: "/privacy" },
    licence: "Licence",
  },

  /**
   * `/docs/*`. Sub-nav labels from the Design system (Prose); the leads, the
   * section headings and the anchor-link names are build-written drafts
   * Lorenzo approves in review. Everything else on these pages is derived.
   */
  docs: {
    nav: {
      label: "Docs",
      links: [
        { label: "Quick start", href: "/docs/quick-start" },
        { label: "Concepts", href: "/docs/concepts" },
      ] satisfies Link[],
    },
    quickStart: {
      lead: "What Oxide needs on your machine, then the steps from a first prompt to a pull request.",
      requirements: "Requirements",
      steps: "Steps",
    },
    concepts: {
      leadBefore: "The words Oxide uses, defined in the Oxide",
      glossary: "glossary",
      anchorLabel: (term: string) => `Link to ${term}`,
    },
  },

  /** Copy deck, Home → Hero (frozen). */
  hero: {
    subheadline:
      "Prompt, review, pull request and merge, with Claude Code, Codex and Antigravity CLI.",
  },

  /**
   * `/download`, Copy deck → `/download` (locked). Strings keep the deck's
   * notation: `[label](README#anchor)` links to the README at the pinned ref,
   * `` `x` `` is code and `**x**` is bold; `<DeckText>` renders them.
   */
  download: {
    byoa: {
      heading: "Bring your own agent",
      sentence:
        "Oxide doesn't ship an agent: it drives the one you already have. Install and log in to Claude Code, Codex or Antigravity CLI first; Oxide offers only the ones it finds.",
    },
    buttons: {
      macos: "Download for macOS",
      windows: "Download for Windows",
      prerelease: (version: string) => `Download test pre-release ${version}`,
      followGithub: "Follow on GitHub",
      buildFromSource: "Build from source",
      /** Sublabel parts before the size token. */
      sublabel: { macos: "Apple Silicon · .dmg", windows: "x64 · installer" },
    },
    lines: {
      stable: (version: string, date: string) =>
        `Version ${version} · ${date} · [Release notes](/changelog)`,
      prerelease:
        "This is a test pre-release: it never reaches the in-app updater. [Build from source](README#build-from-source) for the latest code.",
      none: "No release yet. Oxide is pre-release software; follow the repository to hear about the first one.",
    },
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
