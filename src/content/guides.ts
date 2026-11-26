// Five practical guides (Copy deck, the guides' outlines). The headings, the
// intro key sentences and the meaning of each section's key sentences are the
// deck's; the running text around them is build-written and Lorenzo or Matteo
// approves it in review.
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
  lead: "Practical guides for Oxide: projects and plain terminals, running coding agent CLIs, the split code workspace with on-demand LSPs, GitHub workflows and Linux packages.",
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
    page: PAGES.guidesProjects,
    summary:
      "Organize local folders and GitHub clones as projects, run parallel terminals with command blocks and rely on session restore.",
    intro:
      "Every Project in Oxide groups its own folder, plain Terminals, Command blocks and Session restore state under one sidebar entry.",
    sections: [
      {
        id: "opening-and-switching-projects",
        heading: "Opening and switching Projects",
        body: `Use Open Project or \`Mod+Shift+O\` to add a local folder, initialize a new Git repository or clone from GitHub without leaving the window.

When you switch between Projects in the sidebar, Oxide keeps every Terminal process alive in Core, along with your scrollback, open files and layout. Closing a Project closes its Terminals cleanly with it. See [Open Projects](/features#open-projects).`,
      },
      {
        id: "multiple-terminals-in-one-folder",
        heading: "Multiple Terminals in one folder",
        body: `Each Project can hold as many Terminals as you need, with live program titles and \`Mod+Shift+T\` to start another shell in the same folder.

Use \`Mod+PageUp\` and \`Mod+PageDown\` to step between Terminals, or double-click any row to give it a fixed label such as \`dev server\` or \`tests\`. When a row is not renamed manually, Oxide surfaces the active long-running program automatically and returns to the shell name once it exits. See [Many terminals](/features#many-terminals).`,
      },
      {
        id: "command-blocks-and-exit-status",
        heading: "Command blocks and exit status",
        body: `Core groups each command's prompt, output, duration and exit status into a Command block with a subtle status rail so failures stand out immediately.

Full-screen interactive TUIs expand smoothly inside the Terminal viewport, while normal commands settle back into compact, scrollable blocks with a hairline divider between runs. See [Command blocks](/features#command-blocks).`,
      },
      {
        id: "session-restore-across-restarts",
        heading: "Session restore across restarts",
        body: `When Session restore is enabled, reopening Oxide brings back your Open Projects, Terminals, open files and recent Command blocks as a record.

Restored output sits above a quiet \`Restored session\` divider with a fresh shell prompt ready below it, so you can see where you left off before running the next command.`,
      },
    ],
    closing:
      "Next: [Running Claude Code, Codex and any CLI in Oxide](/guides/running-agents-in-oxide) shows how to run agent CLIs side by side in those plain shells.",
  },
  {
    page: PAGES.guidesAgents,
    summary:
      "Run Claude Code, Codex or any shell tool side by side in Oxide's plain terminals with your own shell config, code editor and GitHub tools.",
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

Click the \`+\` button on a Project row in the sidebar to open a fresh shell already in that folder. Double-click a Terminal row (or use Rename on its context menu) to label it \`claude\`, \`codex\` or \`tests\`. See [Many terminals](/features#many-terminals) and [Command blocks](/features#command-blocks).`,
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

Interactive CLIs that ask for \`Ctrl+C\` twice to exit, shell history search with \`Ctrl+R\`, and editor bindings inside the shell all work out of the box. If you want custom shortcuts for Oxide's own panels, configure them in Settings → Shortcuts.`,
      },
    ],
    closing:
      "Next: [Editing code beside your terminals with on-demand LSPs](/guides/code-workspace-and-language-servers) covers the Files view and split Code workspace.",
  },
  {
    page: PAGES.guidesCode,
    summary:
      "Browse a project's files view, split the code workspace beside your terminal and install language servers on demand.",
    intro:
      "A Project's Files view opens directly into a split Code workspace beside your Terminal, powered by Monaco and on-demand language servers.",
    sections: [
      {
        id: "browsing-the-files-view",
        heading: "Browsing the Files view",
        body: `Click the folder button on a Project row or press \`Mod+Shift+E\` to switch the sidebar to the Project's file tree and search across files.

Use the back header at the top of the sidebar to return to your Terminals at any time. Switching between Projects preserves both your open tabs and any unsaved edits in the Code workspace. See [Files and Code workspace](/features#files).`,
      },
      {
        id: "the-split-terminal-and-code-workspace",
        heading: "The split Terminal and Code workspace",
        body: `Selecting a file opens the Code workspace beside the active Terminal with a draggable divider and \`Mod+Shift+Enter\` to maximize either half.

You can keep tests or a dev server running on the left while reading stack traces or editing source files on the right, then maximize either side with a single keystroke when you need full width.`,
      },
      {
        id: "on-demand-language-servers",
        heading: "On-demand language servers",
        body: `Oxide supports Rust, TypeScript/JavaScript, Python and C/C++ and installs a language server only when you press Install on the prompt.

Core manages each language server process locally without an extension marketplace. Once installed, diagnostics, hover types and go-to-definition appear in the editor status bar and gutter.`,
      },
      {
        id: "shortcuts-that-stay-out-of-the-shells-way",
        heading: "Shortcuts that stay out of the shell's way",
        body: `Saving (\`Mod+S\` and \`Mod+Shift+S\`) is scoped to the Code workspace so terminal focus always keeps raw shell shortcuts intact.

When you click back into the Terminal half, \`Ctrl+S\` or \`Ctrl+C\` returns to the shell immediately without triggering editor actions.`,
      },
    ],
    closing:
      "Next: [From GitHub Issue to merged pull request in Oxide](/guides/github-issues-and-pull-requests) walks through the right-dock GitHub Surfaces.",
  },
  {
    page: PAGES.guidesGitHub,
    summary:
      "Triage GitHub Issues with sub-issues and labels, open pull requests, watch CI checks and merge from the right dock.",
    intro:
      "Oxide's right dock pairs your local Terminals with two GitHub Surfaces — Issues and Pull request — backed by the GitHub CLI (`gh`).",
    sections: [
      {
        id: "authenticating-with-the-github-cli",
        heading: "Authenticating with the GitHub CLI",
        body: `Install \`gh\` and run \`gh auth login\` once; Oxide reads repository Issues and pull requests through your local \`gh\` session with no extra tokens.

Because Core invokes \`gh\` on your behalf, your existing SSH keys, GitHub Enterprise hosts and repository permissions work automatically. See [Download Oxide](/download) for requirements.`,
      },
      {
        id: "triaging-issues-and-sub-issues",
        heading: "Triaging Issues and sub-issues",
        body: `Open the Issues Surface (\`Mod+Shift+I\`) to filter issues, inspect sub-issues, labels and assignees, comment, close or create a new Issue from templates.

Clicking an issue shows its full description, reactions, sub-issue progress and timeline beside your active Terminal so you can reproduce or fix a bug without switching windows. See [Issues](/features#issues).`,
      },
      {
        id: "opening-and-reviewing-pull-requests",
        heading: "Opening and reviewing pull requests",
        body: `Switch to the Pull request Surface (\`Mod+Shift+G\`) to browse open pull requests, inspect branch diffs and create a new pull request from your current branch.

Each pull request displays its head and base branches, diff stats, description and review state right next to the shell where you ran your tests. See [Pull requests](/features#pull-requests).`,
      },
      {
        id: "checks-reviewers-and-auto-merge",
        heading: "Checks, reviewers and auto-merge",
        body: `Watch CI checks update in the review view, verify mergeability and choose Squash and merge or Enable auto-merge without leaving your Terminal.

Use \`Mod+\\\` whenever you want to collapse or reopen the right dock so the Terminal and Code workspace get the full window width.`,
      },
    ],
    closing:
      "On Linux? [Installing, verifying and updating Oxide on Linux](/guides/linux-packages-and-updates) covers AppImage, `.deb` (APT) and `.rpm` (DNF) builds.",
  },
  {
    page: PAGES.guidesLinux,
    summary:
      "Install Oxide on Linux with AppImage, .deb or .rpm for x64 and arm64, configure the signed APT and DNF repositories and verify every download.",
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

Verify any downloaded file with \`sha256sum\` against the release notes, or run \`gh attestation verify <file> --repo getoxide/oxide\`. To get started inside Oxide, see [Working with projects, terminals and command blocks](/guides/working-with-projects-and-terminals).`,
      },
    ],
    closing:
      "Ready to install? Grab the AppImage, `.deb` or `.rpm` on [Download Oxide](/download).",
  },
];
