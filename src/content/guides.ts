// The two guides (Copy deck, the guides' outlines). The headings, the intro
// key sentences and the meaning of each section's key sentences are the deck's;
// the running text around them is build-written and Lorenzo or Matteo approves
// it in review.
//
// Notation as in the Copy deck: `[label](target)` links, `code`, `**bold**`.
import type { Page } from "./pages";
import { PAGES } from "./pages";

export type GuideSection = {
  /** Published anchor of the section heading, stable once shipped. */
  id: string;
  /** The Copy deck's outline heading, verbatim. */
  heading: string;
  /** Build-written running text; the deck's key sentences come first. */
  body: string;
};

export type Guide = {
  /** The registry entry: the locked H1, title and description. */
  page: Page;
  /** A one-line summary for the /guides index (build-written). */
  summary: string;
  /** The deck's intro key sentence, rendered as the page lead. */
  intro: string;
  /** The outline sections, in the deck's order. */
  sections: GuideSection[];
  /** A closing paragraph after the outline. */
  closing?: string;
};

/** The /guides index: a lead, then one entry per guide. */
export const GUIDE_INDEX = {
  lead: "Two practical guides for Oxide: using coding agent CLIs in plain terminals, and installing or updating Oxide on Linux.",
} as const;

/**
 * Every Markdown source of a guide, in the order the page renders them:
 * the intro, then each section's heading and body, then the closing.
 */
export function guideSources(guide: Guide): string[] {
  return [
    guide.intro,
    ...guide.sections.flatMap((section) => [section.heading, section.body]),
    ...(guide.closing ? [guide.closing] : []),
  ];
}

export const GUIDES: Guide[] = [
  {
    page: PAGES.guidesAgents,
    summary:
      "Run Claude Code, Codex, Antigravity CLI or any shell tool side by side in Oxide's plain terminals with your own shell config, code editor and GitHub tools.",
    intro:
      "Oxide does not know about agents: every Terminal is a plain shell, so you run `claude`, `codex` or any CLI tool the same way you do outside Oxide.",
    sections: [
      {
        id: "why-plain-shells",
        heading: "Why plain shells",
        body: `A Terminal is your own zsh, bash or PowerShell with your startup files, aliases and PATH intact. Oxide adds no launch flags, prompts or wrappers around what runs inside it.

Because Core owns each PTY process directly and never interprets its output, every interactive TUI, colour theme, spinner and prompt behaves the same as in your standalone terminal. Whatever you run uses its own login and billing, and switching between Projects or Terminals keeps every running process alive.`,
      },
      {
        id: "running-claude-code-and-codex-side-by-side",
        heading: "Running Claude Code and Codex side by side",
        body: `Open as many Terminals as you need under one Project: run \`claude\` in one, \`codex\` in another and a test watcher in a third, with Session restore keeping your recent Command blocks across restarts.

Click the \`+\` button on a Project row in the sidebar to open a fresh shell already in that folder. Double-click a Terminal row (or use Rename on its context menu) to label it \`claude\`, \`codex\` or \`tests\`; until you rename it, Oxide shows the active long-running program automatically and returns to the default name once the shell is idle. See [Many terminals](/features#many-terminals) and [Command blocks](/features#command-blocks).`,
      },
      {
        id: "code-and-github-next-to-the-shell",
        heading: "Code and GitHub next to the shell",
        body: `Open the Files view from the Project row to inspect or edit files in the Code workspace beside the Terminal, then use the Issues and Pull request Surfaces in the right dock.

Opening a file splits the centre into a Terminal half and a Code half with a draggable divider, so you can read or edit a file in Monaco while watching an agent or test suite run beside it. When the branch is ready, switch to the [Pull requests](/features#pull-requests) Surface to review checks, comment and merge without leaving the window.`,
      },
      {
        id: "terminal-priority-for-shortcuts",
        heading: "Terminal priority for shortcuts",
        body: `When a Terminal has focus, bare \`Ctrl+<letter>\` and terminal control keys like \`Ctrl+C\`, \`Ctrl+D\` and \`Ctrl+R\` go straight to the PTY unless explicitly rebound in Settings.

Interactive CLIs that ask for \`Ctrl+C\` twice to exit, shell history search with \`Ctrl+R\`, and editor bindings inside the shell all work out of the box. If you want custom VS Code-inspired shortcuts for Oxide's own panels, configure them in Settings → Shortcuts.`,
      },
    ],
    closing:
      "On Linux? [Installing and updating Oxide on Linux](/guides/linux-packages-and-updates) covers AppImage, `.deb` (APT) and `.rpm` (DNF) builds.",
  },
  {
    page: PAGES.guidesLinux,
    summary:
      "Install Oxide on Linux with AppImage, .deb or .rpm for x64 and arm64, configure the signed APT and DNF repositories, and verify every download.",
    intro:
      "Oxide ships official Linux builds for x64 and arm64 as AppImage, `.deb` and `.rpm`, with signed APT and DNF repositories for updates.",
    sections: [
      {
        id: "choose-your-package-format",
        heading: "Choose your package format",
        body: `Pick an AppImage if you want a portable binary with In-app update, or install the \`.deb\` or \`.rpm\` Package install so your system package manager handles upgrades.

When you use an AppImage, Oxide checks for updates automatically and replaces the AppImage file in place from the titlebar or Settings → Updates. When you use a \`.deb\` or \`.rpm\`, Oxide leaves upgrades to \`apt\` or \`dnf\` and shows the command to run when a new stable release is out.`,
      },
      {
        id: "signed-apt-repository",
        heading: "Signed APT repository (Debian, Ubuntu)",
        body: `Add the Oxide repository key and source list once, then install and upgrade \`oxide\` through \`apt\` on x64 or arm64.

\`\`\`sh
sudo install -d -m 0755 /usr/share/keyrings
curl -fsSL https://updates.getoxide.dev/apt/oxide-repository.gpg | sudo tee /usr/share/keyrings/oxide.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/oxide.gpg] https://updates.getoxide.dev/apt/ ./" | sudo tee /etc/apt/sources.list.d/oxide.list
sudo apt update && sudo apt install oxide
\`\`\`

Installing a stable \`.deb\` from [Download Oxide](/download) also configures this repository for you. The APT repository serves stable releases only; test pre-releases never appear there.`,
      },
      {
        id: "signed-dnf-repository",
        heading: "Signed DNF repository (Fedora, RHEL, openSUSE)",
        body: `Add \`/etc/yum.repos.d/oxide.repo\` once and install \`oxide\` with \`dnf\`; \`dnf\` imports the repository key on first use and checks both packages and metadata.

\`\`\`sh
sudo curl -fsSL -o /etc/yum.repos.d/oxide.repo https://updates.getoxide.dev/rpm/oxide.repo
sudo dnf install oxide
\`\`\`

The \`.repo\` file sets \`skip_if_unavailable=1\`, so an unreachable Oxide repository never blocks the rest of \`dnf\`. Future releases arrive with \`sudo dnf upgrade\`.`,
      },
      {
        id: "verifying-downloads-and-requirements",
        heading: "Verifying downloads and requirements",
        body: `Every release lists SHA-256 checksums and build-provenance attestations; Linux builds require WebKitGTK 4.1 (\`libwebkit2gtk-4.1\`).

Verify any downloaded file with \`sha256sum\` against the release notes, or run \`gh attestation verify <file> --repo getoxide/oxide\`. If you also want to run coding agent CLIs inside Oxide, see [Running Claude Code, Codex and any CLI in Oxide](/guides/running-agents-in-oxide).`,
      },
    ],
    closing:
      "Ready to install? Grab the AppImage, `.deb` or `.rpm` on [Download Oxide](/download).",
  },
];
