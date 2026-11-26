// Site-owned strings. H1s, titles and descriptions live in the PAGES registry.
// Locked strings come verbatim from the Copy deck (docs/spec/copy.md).

export const GITHUB_REPO_URL = "https://github.com/getoxide/oxide";

export type Link = { label: string; href: string };

export const COPY = {
  skipLink: "Skip to content",

  /** Accessible name of a heading's anchor link (build-written). */
  anchorLabel: (heading: string) => `Link to ${heading}`,

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
   * Site footer: columns, trust line and disclaimers. The canonical definition
   * block joins it with the content snapshot (#32).
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
        heading: "Docs & Guides",
        links: [
          { label: "Quick start", href: "/docs/quick-start" },
          { label: "Concepts", href: "/docs/concepts" },
          { label: "Guides", href: "/guides" },
        ],
      },
      {
        heading: "Resources",
        links: [
          { label: "GitHub", href: GITHUB_REPO_URL },
          { label: "Releases", href: `${GITHUB_REPO_URL}/releases` },
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
      lead: "Made by",
      and: "and",
      authors: [
        { label: "Lorenzo Cavallini", href: "https://cavallinilorenzo.com" },
        { label: "Matteo Benassi", href: "https://benassimatteo.dev" },
      ] satisfies Link[],
    },
    privacy: { label: "Privacy", href: "/privacy" },
    licence: "Licence",
  },

  /**
   * `/docs/*`. Sub-nav labels from the Design system (Prose); the leads, the
   * section headings and the anchor-link names are build-written drafts
   * Lorenzo or Matteo approves in review. Everything else on these pages is derived.
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
      lead: "What Oxide needs on your machine, then the steps from opening a Project to working in its terminals.",
      requirements: "Requirements",
      steps: "Steps",
    },
    concepts: {
      leadBefore: "The words Oxide uses, defined in the Oxide",
      glossary: "glossary",
    },
  },

  /**
   * `/changelog`. The group names, the per-version link and the maintenance
   * line come from Content #12 (Changelog); the empty-state line, the
   * older-releases line and the anchor-link name are build-written, drafts
   * Lorenzo or Matteo approves in review.
   */
  changelog: {
    groups: {
      breaking: "Breaking changes",
      features: "Features",
      fixes: "Fixes",
    },
    fullNotes: "Full release notes on GitHub",
    maintenance: "Maintenance release: dependency and documentation updates.",
    anchorLabel: (version: string) => `Link to version ${version}`,
    older: {
      before: "Older releases are on",
      link: "GitHub Releases",
      after: ".",
    },
    empty: {
      before: "No stable release yet. New versions will be listed here and on",
      link: "GitHub Releases",
      after: ".",
    },
  },

  /** Copy deck, Home → Hero (locked). */
  hero: {
    subheadline:
      "Open a folder, run as many clean shells as you like, and keep code, issues and pull requests at hand.",
    /** Locked buttons; the primary reads "Get Oxide" while the state is `none`. */
    download: "Download Oxide",
    getOxide: "Get Oxide",
    github: "View on GitHub",
    /** The platform line is `⟨platforms⟩ · Pre-release` (locked). */
    platformSuffix: "Pre-release",
  },

  /**
   * Copy deck, Home → Proof points (locked). The heading and the four steps
   * are the deck's; "Learn more about ⟨heading⟩" is the link's accessible
   * name (build-written, as the deck specifies it).
   */
  proofPath: {
    heading: "From Project to pull request",
    learnMore: "Learn more",
    steps: [
      {
        heading: "Projects",
        sentence:
          "Open any local Git repository or clone from GitHub; each Project keeps its own Terminals, open files and split layout.",
        href: "/features#open-projects",
        icon: "repo",
      },
      {
        heading: "Terminals",
        sentence:
          "Run a server, an agent CLI and a test watcher in plain shells owned by Core, with Warp-like Command blocks and Session restore.",
        href: "/features#many-terminals",
        icon: "terminal",
      },
      {
        heading: "Code",
        sentence:
          "Browse a Project's Files view in the sidebar and open files in the Code workspace beside the Terminal, with on-demand language servers.",
        href: "/features#files",
        icon: "code",
      },
      {
        heading: "GitHub",
        sentence:
          "Read and create Issues, open and review pull requests, check CI status and merge or enable auto-merge from the right dock Surfaces.",
        href: "/features#pull-requests",
        icon: "git-pull-request",
      },
    ],
  },

  /**
   * `/download`, Copy deck → `/download` (locked). Strings keep the deck's
   * notation: `[label](README#anchor)` links to the README at the pinned ref,
   * `` `x` `` is code and `**x**` is bold; `<DeckText>` renders them.
   */
  download: {
    requirements: {
      heading: "What Oxide needs",
      sentence:
        "`git` is required; the GitHub CLI (`gh`, logged in) is optional and enables Issues and pull requests. Anything else you run in a Terminal — Claude Code, Codex or any CLI — uses its own install and login.",
    },
    buttons: {
      macos: "Download for macOS",
      windows: "Download for Windows",
      linux: "Download for Linux",
      followGithub: "Follow on GitHub",
      buildFromSource: "Build from source",
      /** Sublabel parts before the size token. */
      sublabel: {
        macos: "Apple Silicon · .dmg",
        windows: "x64 · installer",
        linux: "x64 · AppImage",
      },
    },
    lines: {
      stable: (version: string, date: string) =>
        `Version ${version} · ${date} · [Release notes](/changelog)`,
      prerelease: (version: string) =>
        `Test pre-release ${version}: it never reaches the in-app updater or the APT and DNF repositories. [Build from source](README#build-from-source) for the latest code.`,
      none: "No release yet. Oxide is pre-release software; follow the repository to hear about the first one.",
    },
    repos: {
      heading: "Linux package repositories",
      lead: "For `.deb` and `.rpm` installs on x64 and arm64, add the signed APT or DNF repository once and upgrade through your package manager:",
      aptTitle: "APT (Debian, Ubuntu)",
      aptSnippet: [
        "```sh",
        "sudo install -d -m 0755 /usr/share/keyrings",
        "curl -fsSL https://updates.getoxide.dev/apt/oxide-repository.gpg | sudo tee /usr/share/keyrings/oxide.gpg > /dev/null",
        'echo "deb [signed-by=/usr/share/keyrings/oxide.gpg] https://updates.getoxide.dev/apt/ ./" | sudo tee /etc/apt/sources.list.d/oxide.list',
        "sudo apt update && sudo apt install oxide",
        "```",
      ].join("\n"),
      dnfTitle: "DNF (Fedora, RHEL, openSUSE)",
      dnfSnippet: [
        "```sh",
        "sudo curl -fsSL -o /etc/yum.repos.d/oxide.repo https://updates.getoxide.dev/rpm/oxide.repo",
        "sudo dnf install oxide",
        "```",
      ].join("\n"),
    },
    /** Under the buttons. */
    signing: {
      macos:
        "macOS blocks the first launch because the build isn't notarized yet. Open it once, then choose **Open Anyway** in System Settings → Privacy & Security. [Full steps](README#opening-an-unsigned-build)",
      windows:
        "SmartScreen may warn on first run. Choose **More info → Run anyway** after verifying the file. [Full steps](README#opening-an-unsigned-build)",
      linux:
        "The `.rpm` is signed with the Oxide repository key and the `.deb` is covered by the signed APT `InRelease`; the AppImage is unsigned. Requires WebKitGTK 4.1. [Full steps](README#opening-an-unsigned-build)",
      verify:
        "[Verify your download](README#verifying-a-download) with SHA-256 checksums and the build attestation.",
    },
    /** Hand-written exception to the Copy deck's rule 5. */
    unsupported:
      "Intel Macs aren't packaged yet. [Build from source](README#build-from-source).",
    /** Build-written: the H2 over the page FAQ, a draft for Lorenzo or Matteo. */
    faqHeading: "Questions",
    faq: [
      {
        id: "macos-cant-be-opened",
        question: "Why does macOS say Oxide can't be opened?",
        answer:
          "Oxide's macOS builds aren't notarized by Apple yet, so Gatekeeper stops the first launch. Open the app once, then go to System Settings → Privacy & Security and choose Open Anyway. You only do this once; updates installed through Oxide are unaffected. [Full steps](README#opening-an-unsigned-build).",
      },
      {
        id: "verify-download",
        question: "How do I check that the download is genuine?",
        answer:
          "Every release lists SHA-256 checksums in its release notes and ships a build-provenance attestation that ties each file to the workflow run and commit that built it. Check the hash, or run `gh attestation verify` on the file. [Commands for every platform](README#verifying-a-download).",
      },
      {
        id: "linux-packages",
        question: "How do Linux packages and updates work?",
        answer:
          "Linux builds ship as AppImage, `.deb` and `.rpm` for both x64 and arm64. The AppImage uses In-app update, while a Package install updates through the signed APT and DNF repositories. [Linux installation guide](/guides/linux-packages-and-updates).",
      },
      {
        id: "updates",
        question: "How do I stay up to date?",
        answer:
          "On macOS, Windows and the Linux AppImage, Oxide checks for updates automatically and installs them from the titlebar or Settings → Updates. Test pre-releases never reach the stable APT and DNF repositories. New versions and what changed are on the [changelog](/changelog). [How updates work](README#updates).",
      },
    ],
  },

  /**
   * Copy deck, Closing CTA block (locked): on every page except `/download`.
   * The primary reads "Get Oxide" while the Release state is `none`.
   */
  closingCta: {
    heading: "Open a folder and start a clean shell.",
    sentence:
      "Open a Project from the sidebar, run as many plain Terminals as you like, and keep your Files view, Issues and pull requests beside them.",
    download: "Download Oxide",
    getOxide: "Get Oxide",
    github: "View on GitHub",
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
   * or Matteo approves in review. Wording constraints from the Measurement plan (#16):
   * the app has no telemetry, the site counts page views without cookies
   * through GoatCounter, aggregate only, and never "collects nothing".
   */
  privacy: {
    lead: "What the Oxide app and this website count, and what they don't.",
    app: {
      heading: "The Oxide app",
      sentence: "The Oxide app has no telemetry.",
      readmeLead: "Where your code and GitHub requests go is answered in the",
      readmeLink: "Oxide README's FAQ",
    },
    site: {
      heading: "This website",
      paragraphs: [
        "This site counts page views with GoatCounter, without cookies. GoatCounter keeps aggregate counts only: no IP address and no visitor ID are stored, so a count never points back to you.",
        "Clicks on the download and GitHub buttons are counted the same way, as aggregate events. The real number of downloads comes from GitHub's own release statistics, not from this site.",
        "The site contacts no third party other than GoatCounter. Fonts and images are served from this site, and there are no embeds or other analytics.",
      ],
    },
  },
} as const;
