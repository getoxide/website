# Copy deck

The site-owned words the build works from. Updated to reflect Oxide's current architecture: Open Projects and plain terminals, the split Terminal | Code centre, Issues and Pull request Surfaces, and macOS, Windows and Linux (x64 and arm64) releases.

Build issues **cite** this file; they never copy it. A change to a locked string is a PR to this file, approved by Lorenzo or Matteo.

## How to read this deck

| Level | Meaning | Who may change it |
| --- | --- | --- |
| **Locked** | Rendered verbatim, punctuation included. | A PR to this file. The hero needs a new ticket. |
| **Outline** | The section headings are fixed. The key sentences are fixed in meaning; the build may adjust their grammar to fit the running text around them. | The build writes the running text; Lorenzo or Matteo approves it in PR review. |
| **Derived** | Rendered from the Oxide snapshot, never written here. | The Oxide repo. |

### Tokens

A `⟨…⟩` token is never typed out: the build renders it from the committed snapshot, so a product fact has one source ([Content sourced from the Oxide repo](https://github.com/getoxide/website/issues/12)).

| Token | Renders | Source |
| --- | --- | --- |
| `⟨definition⟩` | The canonical definition | `site:definition` marker |
| `⟨platforms⟩` | The supported platforms, e.g. "macOS on Apple Silicon, Windows (x64, arm64) and Linux (x64, arm64)" | Derived from the release assets in the snapshot, or from the README Install table before any release exists. |
| `⟨requirements⟩` | The Requirements section (`git`, optional `gh`) | `### Requirements` in the README |
| `⟨version⟩`, `⟨release-date⟩` | Latest stable version and its date | GitHub release metadata in the snapshot |
| `⟨asset-size:macos⟩`, `⟨asset-size:windows⟩`, `⟨asset-size:linux⟩` | Installer size | Release metadata in the snapshot |

`[label](target)` marks a link. A target starting with `README#` points at that README section on GitHub at the pinned tag.

### Rules every string here follows

1. The canonical definition is never reworded; where it appears, it is `⟨definition⟩`.
2. None of the banned phrases from Copy (`copy-lint` rule 2) appears: "10x", "magic", "army of agents", "the only", "agentic engineering", "senior", "write code with Oxide", "code with Oxide", "Oxide writes code", "the most complete", "the best" and "the main app" (not bare "the main", which would match "the main branch").
3. "GUI" never appears on any page.
4. Glossary terms are capitalised (Project, Terminal, Command block, Surface, Files view, Code workspace, Session restore, In-app update, Package install, Open Project, Project palette, Terminals view, Settings). The **first** capitalised mention of one of the nine Concepts terms on a page links to `/docs/concepts#<term>`; that link is the build's job and is not marked below.
5. Product facts (platforms, requirements, licence, telemetry, API key, version) are tokens or links, never typed out. Two hand-written exceptions: the footer trust line and the unsupported-platform line on `/download`. "Free" and "open-source" come from the canonical definition, so they count as identity and may appear in titles and descriptions; "MIT" is the licence fact and may not.
6. Oxide provides plain terminals; whatever runs in them uses its own CLI and login. Never "write code with Oxide".

## Metadata: every page

Rendered `<title>` follows the template `%s · Oxide` from [Machine-readable layer](https://github.com/getoxide/website/issues/14); the home title is the exception. Descriptions are 120–160 characters and unique. The `<title>` column below is the full rendered string. **All locked.**

| Path | H1 | `<title>` | Meta description |
| --- | --- | --- | --- |
| `/` | A terminal app that knows your GitHub projects. | Oxide: a desktop terminal app for your GitHub Projects | Open a Project, run as many plain terminals as you like in its folder, and keep your files, GitHub Issues and pull requests in the same window. |
| `/features` | Everything around your terminals and GitHub | Features: terminals, code and GitHub · Oxide | Open Projects, run many plain terminals with Command blocks, edit files beside them, and handle GitHub Issues and pull requests without leaving Oxide. |
| `/guides` | Guides | Guides · Oxide | Five practical guides for Oxide: Projects and Terminals, running agent CLIs, the Code workspace with LSPs, GitHub workflows and Linux packages. |
| `/guides/working-with-projects-and-terminals` | Working with projects, terminals and command blocks | Projects, terminals and command blocks · Oxide | Open local repositories or clone from GitHub, run parallel Terminals with Command blocks, keep running shells alive and rely on Session restore. |
| `/guides/running-agents-in-oxide` | Running Claude Code, Codex and any CLI in Oxide | Running Claude Code and Codex in Oxide · Oxide | Run Claude Code, Codex or any shell tool side by side in Oxide's plain terminals, keeping your shell config, shortcuts, code editor and GitHub tools. |
| `/guides/code-workspace-and-language-servers` | Editing code beside your terminals with on-demand LSPs | Code workspace and language servers · Oxide | Browse a Project's Files view, open files in the split Code workspace beside your Terminal and install language servers for Rust, TS, Python or C/C++. |
| `/guides/github-issues-and-pull-requests` | From GitHub Issue to merged pull request in Oxide | GitHub Issues and pull requests · Oxide | Triage GitHub Issues with sub-issues and labels, open pull requests, watch CI checks and merge or enable auto-merge from Oxide's right dock Surfaces. |
| `/guides/linux-packages-and-updates` | Installing, verifying and updating Oxide on Linux | Linux packages and updates · Oxide | Install Oxide on Linux with AppImage, .deb or .rpm for x64 and arm64, configure the signed APT and DNF repositories and verify every download. |
| `/docs/quick-start` | Quick start | Quick start · Oxide | Check what Oxide needs, open a Project, start as many plain terminals as you like, browse Files and open Issues or pull requests in four steps. |
| `/docs/concepts` | Concepts | Concepts · Oxide | The words Oxide uses and what they mean: Project, Terminal, Command block, Surface, Files view, Code workspace, Session restore and update channels. |
| `/faq` | Frequently asked questions | FAQ · Oxide | Answers about Oxide, the open-source desktop terminal app for GitHub Projects: what it is, running agent CLIs in it, supported platforms and privacy. |
| `/changelog` | Changelog | Changelog · Oxide | Every stable Oxide release, newest first: breaking changes, new features and fixes, with a link to the full release notes on GitHub for each version. |
| `/download` | Download Oxide | Download · Oxide | Download Oxide for macOS, Windows and Linux (x64 and arm64) from GitHub Releases, configure the signed APT or DNF repository, and verify the file. |
| 404 | Page not found | Page not found · Oxide | *(none: not indexable, not in the sitemap)* |

The home description deliberately does not repeat the canonical definition: the definition is already in the body below the hero and in the `SoftwareApplication` description. The home `<title>` is also the home `og:title`.

## Home

### Hero *(locked)*

- **H1**: A terminal app that knows your GitHub projects.
- **Subheadline**: Open a folder, run as many clean shells as you like, and keep code, issues and pull requests at hand.

The H1 and the subheadline are the share card's two lines, word for word ([Social and share assets](https://github.com/getoxide/website/issues/23)). If the hero changes, the card follows it.
- **Primary button** *(locked)*: Download Oxide → `/download`
- **Secondary button** *(locked)*: View on GitHub → `https://github.com/getoxide/oxide` (event `github-cta`)
- **Platform line** *(locked)*: `⟨platforms⟩` · Pre-release

Below the hero, centred: `⟨definition⟩`, then the trust line (fixed by [Page inventory and site structure](https://github.com/getoxide/website/issues/9)).

### Proof points *(locked)*

Section heading: **From Project to pull request**

Four steps in order, each ending with a link labelled **Learn more** to its `/features` anchor. Its accessible name includes the heading ("Learn more about Projects").

| # | Heading | Sentence | Link |
| --- | --- | --- | --- |
| 1 | Projects | Open any local Git repository or clone from GitHub; each Project keeps its own Terminals, open files and split layout. | `/features#open-projects` |
| 2 | Terminals | Run a server, an agent CLI and a test watcher in plain shells owned by Core, with Warp-like Command blocks and Session restore. | `/features#many-terminals` |
| 3 | Code | Browse a Project's Files view in the sidebar and open files in the Code workspace beside the Terminal, with on-demand language servers. | `/features#files` |
| 4 | GitHub | Read and create Issues, open and review pull requests, check CI status and merge or enable auto-merge from the right dock Surfaces. | `/features#pull-requests` |

## Closing CTA block *(locked)*

On every page except `/download`, identical everywhere ([Page inventory and site structure](https://github.com/getoxide/website/issues/9), internal linking rule 1).

- **Heading**: Open a folder and start a clean shell.
- **Sentence**: Open a Project from the sidebar, run as many plain Terminals as you like, and keep your Files view, Issues and pull requests beside them.
- **Primary button**: Download Oxide → `/download`
  - While the snapshot has no release at all (`none`, pre-launch previews only): **Get Oxide** → `/download`, so no button promises a download that does not exist.
- **Secondary button**: View on GitHub → `https://github.com/getoxide/oxide` (event `github-cta`)

## 404 *(locked)*

- **H1**: Page not found
- **Sentence**: This page doesn't exist. Oxide's published URLs never move without a redirect, so if a link brought you here, it's a bug worth reporting.
- **Links**: [Home](/) · [Docs](/docs/quick-start) · [Report a broken link](https://github.com/getoxide/oxide/issues/new)

## `/download`

The block order is fixed by [Download experience and pre-release state](https://github.com/getoxide/website/issues/13): Requirements → buttons → Linux repositories → signing note and verify link → unsupported-platform line. Then the page FAQ.

### Reassurance lines *(locked)*

**What Oxide needs** (above the buttons)

- **Heading**: What Oxide needs
- **Sentence**: `git` is required; the GitHub CLI (`gh`, logged in) is optional and enables Issues and pull requests. Anything else you run in a Terminal — Claude Code, Codex or any CLI — uses its own install and login.

**Buttons** (labels and targets from the snapshot)

| State | Primary | Secondary | Line under the buttons |
| --- | --- | --- | --- |
| `stable` | Download for macOS / Download for Windows / Download for Linux (the detected platform first) | the other platforms | Version `⟨version⟩` · `⟨release-date⟩` · [Release notes](/changelog) |
| `prerelease-only` | Download for macOS / Download for Windows / Download for Linux (the detected platform first) | the other platforms | Test pre-release `⟨version⟩`: it never reaches the in-app updater or the APT and DNF repositories. [Build from source](README#build-from-source) for the latest code. |
| `none` | Follow on GitHub → repository (event `github-cta`) | Build from source → `README#build-from-source` | No release yet. Oxide is pre-release software; follow the repository to hear about the first one. |

Each primary platform button carries a sublabel: macOS "Apple Silicon · .dmg · `⟨asset-size:macos⟩`", Windows "x64 · installer · `⟨asset-size:windows⟩`", Linux "x64 · AppImage · `⟨asset-size:linux⟩`". Additional builds (Windows arm64, Linux `.deb` and `.rpm` for x64 and arm64, and Linux arm64 AppImage) are listed directly underneath.

**Signing note** (under the buttons)

- **macOS**: macOS blocks the first launch because the build isn't notarized yet. Open it once, then choose **Open Anyway** in System Settings → Privacy & Security. [Full steps](README#opening-an-unsigned-build)
- **Windows**: SmartScreen may warn on first run. Choose **More info → Run anyway** after verifying the file. [Full steps](README#opening-an-unsigned-build)
- **Linux**: The `.rpm` is signed with the Oxide repository key and the `.deb` is covered by the signed APT `InRelease`; the AppImage is unsigned. Requires WebKitGTK 4.1. [Full steps](README#opening-an-unsigned-build)
- **Verify link**: [Verify your download](README#verifying-a-download) with SHA-256 checksums and the build attestation.

**Unsupported platforms** (one quiet line)

- Intel Macs aren't packaged yet. [Build from source](README#build-from-source).
  - Hand-written exception to rule 5: nothing in the snapshot lists what is *not* supported.

### Page FAQ *(locked)*

Each question is an H3 with an anchor; answers are plain text, never collapsed. None repeats a question from `/faq`.

**Why does macOS say Oxide can't be opened?** `#macos-cant-be-opened`
Oxide's macOS builds aren't notarized by Apple yet, so Gatekeeper stops the first launch. Open the app once, then go to System Settings → Privacy & Security and choose Open Anyway. You only do this once; updates installed through Oxide are unaffected. [Full steps](README#opening-an-unsigned-build).

**How do I check that the download is genuine?** `#verify-download`
Every release lists SHA-256 checksums in its release notes and ships a build-provenance attestation that ties each file to the workflow run and commit that built it. Check the hash, or run `gh attestation verify` on the file. [Commands for every platform](README#verifying-a-download).

**How do Linux packages and updates work?** `#linux-packages`
Linux builds ship as AppImage, `.deb` and `.rpm` for both x64 and arm64. The AppImage uses In-app update, while a Package install updates through the signed APT and DNF repositories. [Linux installation guide](/guides/linux-packages-and-updates).

**How do I stay up to date?** `#updates`
On macOS, Windows and the Linux AppImage, Oxide checks for updates automatically and installs them from the titlebar or Settings → Updates. Test pre-releases never reach the stable APT and DNF repositories. New versions and what changed are on the [changelog](/changelog). [How updates work](README#updates).

## `/features` *(outline)*

**H1**: Everything around your terminals and GitHub *(locked, above)*

**Intro key sentence**: Oxide gives every GitHub Project a clean set of plain terminals, a side-by-side code editor and GitHub tools in one window.

### The feature-name contract

One section per README Features lead-in, no more, no fewer. The **lead-in** column is the contract key the test compares with the `site:features` snapshot; the **heading** is what the page shows; the **anchor** is published and stable.

#### Group 1: Projects and plain terminals

Group key sentence: Open a Project, open as many clean shells as you like in its folder, and run whatever you want in them.

| README lead-in | Heading | Anchor | Key sentences |
| --- | --- | --- | --- |
| Open Projects. | Open Projects | `#open-projects` | The sidebar lists the Open Projects and, under each, its Terminals. A New terminal control on a Project opens a fresh shell already in its folder. |
| Many terminals. | Many terminals | `#many-terminals` | Run a server, an agent CLI and a test watcher side by side. The selected Terminal fills the centre; switching keeps each one's scrollback, working directory and running process. |
| Command blocks. | Command blocks | `#command-blocks` | The Warp-like grouping of command, output and exit status. Each Command block belongs to a persistent shell session. |

#### Group 2: GitHub at hand

Group key sentence: Browse files, edit code beside your terminal and handle GitHub Issues and pull requests without leaving the window.

| README lead-in | Heading | Anchor | Key sentences |
| --- | --- | --- | --- |
| Issues. | Issues | `#issues` | List, read and create GitHub Issues for the Project through the GitHub CLI, with labels, sub-issues and the Activity Timeline. |
| Pull requests. | Pull requests | `#pull-requests` | List, read, create, review and merge pull requests, check CI status, or turn on auto-merge while checks run. |
| Files. | Files and Code workspace | `#files` | Browse the Project's folder from the Files view on its sidebar row and open a file in the Code workspace beside the Terminal, with on-demand language servers. |

Capture captions are constraints-only: the build writes them, describing what the real capture shows.

## `/guides/working-with-projects-and-terminals` *(outline)*

**Job**: developers organizing repositories, multiple Terminals, Command blocks and Session restore in Oxide.

**Intro key sentence**: Every Project in Oxide groups its own folder, plain Terminals, Command blocks and Session restore state under one sidebar entry.

| Section heading | Key sentences |
| --- | --- |
| Opening and switching Projects | Use Open Project or `Mod+Shift+O` to add a local folder, initialize a new Git repository or clone from GitHub without leaving the window. |
| Multiple Terminals in one folder | Each Project can hold as many Terminals as you need, with live program titles and `Mod+Shift+T` to start another shell in the same folder. |
| Command blocks and exit status | Core groups each command's prompt, output, duration and exit status into a Command block with a subtle status rail so failures stand out immediately. |
| Session restore across restarts | When Session restore is enabled, reopening Oxide brings back your Open Projects, Terminals, open files and recent Command blocks as a record. |

## `/guides/running-agents-in-oxide` *(outline)*

**Job**: people who want to run `claude`, `codex` or other CLI tools in Oxide now that Terminals are plain shells.

**Intro key sentence**: Oxide does not know about agents: every Terminal is a plain shell, so you run `claude`, `codex` or any CLI tool the same way you do outside Oxide.

| Section heading | Key sentences |
| --- | --- |
| Why plain shells | A Terminal is your own zsh, bash or PowerShell with your startup files, aliases and PATH intact. Oxide adds no launch flags, prompts or wrappers around what runs inside it. |
| Running Claude Code and Codex side by side | Open as many Terminals as you need under one Project: run `claude` in one, `codex` in another and a test watcher in a third, with Session restore keeping your recent Command blocks across restarts. |
| Code and GitHub next to the shell | Open the Files view from the Project row to inspect or edit files in the Code workspace beside the Terminal, then use the Issues and Pull request Surfaces in the right dock. |
| Terminal priority for shortcuts | When a Terminal has focus, bare `Ctrl+<letter>` and terminal control keys like `Ctrl+C`, `Ctrl+D` and `Ctrl+R` go straight to the PTY unless explicitly rebound in Settings. |

## `/guides/code-workspace-and-language-servers` *(outline)*

**Job**: developers browsing files, splitting the Code workspace beside a Terminal and using on-demand language servers.

**Intro key sentence**: A Project's Files view opens directly into a split Code workspace beside your Terminal, powered by Monaco and on-demand language servers.

| Section heading | Key sentences |
| --- | --- |
| Browsing the Files view | Click the folder button on a Project row or press `Mod+Shift+E` to switch the sidebar to the Project's file tree and search across files. |
| The split Terminal and Code workspace | Selecting a file opens the Code workspace beside the active Terminal with a draggable divider and `Mod+Shift+Enter` to maximize either half. |
| On-demand language servers | Oxide supports Rust, TypeScript/JavaScript, Python and C/C++ and installs a language server only when you press Install on the prompt. |
| Shortcuts that stay out of the shell's way | Saving (`Mod+S` and `Mod+Shift+S`) is scoped to the Code workspace so terminal focus always keeps raw shell shortcuts intact. |

## `/guides/github-issues-and-pull-requests` *(outline)*

**Job**: developers managing GitHub Issues, pull requests, CI checks and merges from the right dock.

**Intro key sentence**: Oxide's right dock pairs your local Terminals with two GitHub Surfaces — Issues and Pull request — backed by the GitHub CLI (`gh`).

| Section heading | Key sentences |
| --- | --- |
| Authenticating with the GitHub CLI | Install `gh` and run `gh auth login` once; Oxide reads repository Issues and pull requests through your local `gh` session with no extra tokens. |
| Triaging Issues and sub-issues | Open the Issues Surface (`Mod+Shift+I`) to filter issues, inspect sub-issues, labels and assignees, comment, close or create a new Issue from templates. |
| Opening and reviewing pull requests | Switch to the Pull request Surface (`Mod+Shift+G`) to browse open pull requests, inspect branch diffs and create a new pull request from your current branch. |
| Checks, reviewers and auto-merge | Watch CI checks update in the review view, verify mergeability and choose Squash and merge or Enable auto-merge without leaving your Terminal. |

## `/guides/linux-packages-and-updates` *(outline)*

**Job**: people installing and updating Oxide on Linux across AppImage, `.deb` (APT) and `.rpm` (DNF) for x64 and arm64.

**Intro key sentence**: Oxide ships official Linux builds for x64 and arm64 as AppImage, `.deb` and `.rpm`, with signed APT and DNF repositories for updates.

| Section heading | Key sentences |
| --- | --- |
| Choose your package format | Pick an AppImage if you want a portable binary with In-app update, or install the `.deb` or `.rpm` Package install so your system package manager handles upgrades. |
| Signed APT repository (Debian, Ubuntu) | Add the Oxide repository key and source list once, then install and upgrade `oxide` through `apt` on x64 or arm64. |
| Signed DNF repository (Fedora, RHEL, openSUSE) | Add `/etc/yum.repos.d/oxide.repo` once and install `oxide` with `dnf`; `dnf` imports the repository key on first use and checks both packages and metadata. |
| Verifying downloads and requirements | Every release lists SHA-256 checksums and build-provenance attestations; Linux builds require WebKitGTK 4.1 (`libwebkit2gtk-4.1`). |
