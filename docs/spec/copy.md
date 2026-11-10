# Copy deck

The site-owned words the build works from. Decided in [Copy deck: locked strings and page outlines](https://github.com/getoxide/website/issues/20), at the fidelity fixed by [Copy: what the spec locks and what the build writes](https://github.com/getoxide/website/issues/18).

Build issues **cite** this file; they never copy it. A change to a locked string is a PR to this file, approved by Lorenzo.

## How to read this deck

| Level | Meaning | Who may change it |
| --- | --- | --- |
| **Locked** | Rendered verbatim, punctuation included. | A PR to this file. The hero needs a new ticket. |
| **Outline** | The section headings are fixed. The key sentences are fixed in meaning; the build may adjust their grammar to fit the running text around them. | The build writes the running text; Lorenzo approves it in PR review. |
| **Derived** | Rendered from the Oxide snapshot, never written here. | The Oxide repo. |

### Tokens

A `⟨…⟩` token is never typed out: the build renders it from the committed snapshot, so a product fact has one source ([Content sourced from the Oxide repo](https://github.com/getoxide/website/issues/12)).

| Token | Renders | Source |
| --- | --- | --- |
| `⟨definition⟩` | The canonical definition | `site:definition` marker |
| `⟨platforms⟩` | The supported platforms, e.g. "macOS on Apple Silicon and Windows x64" | Release assets in the snapshot (see Open points) |
| `⟨requirements⟩` | The Provider table: Provider, command, install link | `site:requirements` marker |
| `⟨version⟩`, `⟨release-date⟩` | Latest stable version and its date | `latest.json` in the snapshot |
| `⟨asset-size:macos⟩`, `⟨asset-size:windows⟩` | Installer size | Release metadata in the snapshot |

`[label](target)` marks a link. A target starting with `README#` points at that README section on GitHub at the pinned tag.

### Rules every string here follows

1. The canonical definition is never reworded; where it appears, it is `⟨definition⟩`.
2. None of the banned phrases from Copy (`copy-lint` rule 2) appears.
3. "GUI" appears only on `/claude-code-gui`, `/codex-gui` and in the derived `/faq#what-is-oxide`.
4. Glossary terms are capitalised (Project, Thread, Turn, Provider, Surface, Checkpoint, Verification Dossier, Blind review, Restore, Revert, Line comment, Verification command, Risk signal, Approval, Permission mode). The **first** capitalised mention of one of the nine Concepts terms on a page links to `/docs/concepts#<term>`; that link is the build's job and is not marked below.
5. Product facts (platforms, requirements, licence, telemetry, API key, version) are tokens or links, never typed out. The footer trust line is the only exception.
6. Oxide drives the agents; the agent writes the code. Never "write code with Oxide".

## Metadata: every page

Rendered `<title>` follows the template `%s · Oxide` from [Machine-readable layer](https://github.com/getoxide/website/issues/14); the home title is the exception. Descriptions are 120–160 characters and unique. The `<title>` column below is the full rendered string. **All locked.**

| Path | H1 | `<title>` | Meta description |
| --- | --- | --- | --- |
| `/` | Agentic coding, from prompt to merge. *(frozen)* | Oxide: the desktop app for Claude Code and Codex *(frozen)* | Oxide drives Claude Code, Codex and Antigravity CLI from one desktop app and shows what each change touched and what was actually checked before you merge. |
| `/features` | Everything between the prompt and the merge | Features: review, diff and restore agent changes · Oxide | See what each agent Turn changed, which checks actually ran and what stayed unverified, then comment, revert or restore before you merge. Every Oxide feature. |
| `/claude-code-gui` | A Claude Code GUI for reviewing what the agent changed | Claude Code GUI: an open-source desktop app · Oxide | Oxide is an open-source desktop GUI for Claude Code: keep your claude login and sessions, and see each Turn's diff and what was actually checked. |
| `/codex-gui` | A Codex GUI that shows what actually ran | Codex GUI: a desktop app for the Codex CLI · Oxide | Is there a GUI for Codex? Oxide is an open-source desktop app that drives the codex CLI you already use and shows which checks ran before you merge. |
| `/guides` | Guides | Guides · Oxide | Practical guides to reviewing what coding agents write: a method for AI-generated code, and using Claude Code and Codex together as writer and reviewer. |
| `/guides/review-ai-generated-code` | How to review AI-generated code before you merge | How to review AI-generated code · Oxide | A four-step method to review AI-generated code: read one Turn at a time, check what actually ran, send feedback where it belongs, undo what you don't want. |
| `/guides/claude-code-and-codex-together` | Claude Code and Codex together: one writes, the other reviews | Claude Code and Codex together, with Blind review · Oxide | Use Claude Code and Codex together: let one agent write the change and have the other review only the diff and the issue, never the original conversation. |
| `/docs/quick-start` | Quick start | Quick start · Oxide | Install a Provider, open a Project, start a Thread, review the Turn in the Diff Surface, then commit, push and open the pull request. Oxide in five steps. |
| `/docs/concepts` | Concepts | Concepts · Oxide | The words Oxide uses and what they mean: Project, Thread, Turn, Provider, Surface, Checkpoint, Verification Dossier, Blind review and Restore. |
| `/faq` | Frequently asked questions | FAQ · Oxide | Answers about Oxide, the open-source desktop app for Claude Code and Codex: what it is, what it is not, where your code goes and how it differs. |
| `/changelog` | Changelog | Changelog · Oxide | Every stable Oxide release, newest first: breaking changes, new features and fixes, with a link to the full release notes on GitHub for each version. |
| `/download` | Download Oxide | Download · Oxide | Download the Oxide desktop app from GitHub Releases, verify the file, and connect the Claude Code, Codex or Antigravity CLI you already have installed. |
| 404 | Page not found | Page not found · Oxide | *(none: not indexable, not in the sitemap)* |

The home description deliberately does not repeat the canonical definition: the definition is already in the body below the hero and in the `SoftwareApplication` description.

## Home

### Hero *(frozen)*

- **H1**: Agentic coding, from prompt to merge.
- **Subheadline**: Drive Claude Code, Codex and Antigravity CLI from one desktop app, with the editor, terminal, Git and GitHub around them, and see what was actually checked before you merge.
- **Primary button** *(locked)*: Download Oxide → `/download`
- **Secondary button** *(locked)*: View on GitHub → `https://github.com/getoxide/oxide` (event `github-cta`)
- **Platform line** *(locked)*: `⟨platforms⟩` · Pre-release

Below the hero, centred: `⟨definition⟩`, then the trust line (fixed by [Page inventory and site structure](https://github.com/getoxide/website/issues/9)).

### Proof points *(locked)*

Section heading: **From prompt to merge**

In positioning order. Each step ends with a link labelled **Learn more** to its `/features` anchor; its accessible name includes the heading ("Learn more about Verification Dossier").

| # | Heading | Sentence | Link |
| --- | --- | --- | --- |
| 1 | Verification Dossier | See which Verification commands actually ran, which are stale and what stayed unverified, computed without an LLM as separate signals, never a single score. | `/features#verification-dossier` |
| 2 | Blind review | A second Provider reviews the change seeing only the diff and the issue, never the original conversation, and its findings come back as Line comments. | `/features#blind-review` |
| 3 | Every Turn, reviewable and undoable | See what one Turn changed, send Line comments back to the agent or to GitHub, and Restore the files to how they were before any Turn. | `/features#diff-by-turn` |
| 4 | One window | Claude Code, Codex and Antigravity CLI side by side, with the editor, terminal, Git, GitHub pull requests and Issues around them. | `/features#multiple-providers` |

## Closing CTA block *(locked)*

On every page except `/download`, identical everywhere ([Page inventory and site structure](https://github.com/getoxide/website/issues/9), internal linking rule 1).

- **Heading**: Take your next Turn all the way to the merge.
- **Sentence**: Oxide drives the Claude Code, Codex or Antigravity CLI you already use. Open a Project, start a Thread and review what comes back.
- **Primary button**: Download Oxide → `/download`
  - While the snapshot has no release at all (`none`, pre-launch previews only): **Get Oxide** → `/download`, so no button promises a download that does not exist.
- **Secondary button**: View on GitHub → `https://github.com/getoxide/oxide` (event `github-cta`)

## 404 *(locked)*

- **H1**: Page not found
- **Sentence**: This page doesn't exist. Oxide's published URLs never move without a redirect, so if a link brought you here, it's a bug worth reporting.
- **Links**: [Home](/) · [Docs](/docs/quick-start) · [Report a broken link](https://github.com/getoxide/oxide/issues/new)

## `/download`

The block order is fixed by [Download experience and pre-release state](https://github.com/getoxide/website/issues/13): Provider requirement → buttons → signing note and verify link → unsupported-platform line. Then the page FAQ. Install, verify and unsigned-build detail stays in the README, linked.

### Reassurance lines *(locked)*

**Bring your own agent** (above the buttons)

- **Heading**: Bring your own agent
- **Sentence**: Oxide doesn't ship an agent: it drives the one you already have. Install and log in to Claude Code, Codex or Antigravity CLI first; Oxide offers only the ones it finds.
- Beside it: the three install links from `⟨requirements⟩`.

**Buttons** (labels from the download ticket; targets from the snapshot)

| State | Primary | Secondary | Line under the buttons |
| --- | --- | --- | --- |
| `stable` | Download for macOS *or* Download for Windows (the detected platform) | the other platform | Version `⟨version⟩` · `⟨release-date⟩` · [Release notes](/changelog) |
| `prerelease-only` | Download test pre-release `⟨version⟩` | the other platform | This is a test pre-release: it never reaches the in-app updater. [Build from source](README#build-from-source) for the latest code. |
| `none` | Follow on GitHub → repository (event `github-cta`) | Build from source → `README#build-from-source` | No release yet. Oxide is pre-release software; follow the repository to hear about the first one. |

Each platform button carries a sublabel: macOS "Apple Silicon · .dmg · `⟨asset-size:macos⟩`", Windows "x64 · installer · `⟨asset-size:windows⟩`".

**Signing note** (under the buttons)

- **macOS**: macOS blocks the first launch because the build isn't notarized yet. Open it once, then choose **Open Anyway** in System Settings → Privacy & Security. [Full steps](README#opening-an-unsigned-build)
- **Windows**: SmartScreen may warn on first run. Choose **More info → Run anyway** after verifying the file. [Full steps](README#opening-an-unsigned-build)
- **Verify link**: [Verify your download](README#verifying-a-download) with `SHA256SUMS.txt` and the build attestation.

**Unsupported platforms** (one quiet line)

- Linux, Intel Macs and Windows on ARM aren't packaged yet. [Build from source](README#build-from-source).

### Page FAQ *(locked)*

Each question is an H3 with an anchor; answers are plain text, never collapsed. None repeats a question from `/faq`.

**Why does macOS say Oxide can't be opened?** `#macos-cant-be-opened`
Oxide's macOS builds aren't notarized by Apple yet, so Gatekeeper stops the first launch. Open the app once, then go to System Settings → Privacy & Security and choose Open Anyway. You only do this once; updates installed through Oxide are unaffected. [Full steps](README#opening-an-unsigned-build).

**How do I check that the download is genuine?** `#verify-download`
Every release ships a `SHA256SUMS.txt` and a build-provenance attestation that ties each file to the workflow run and commit that built it. Check the hash, or run `gh attestation verify` on the file. [Commands for macOS and Windows](README#verifying-a-download).

**Which agent should I install first?** `#which-agent`
Any one of Claude Code, Codex or Antigravity CLI is enough, installed and logged in before you launch Oxide. Add the others whenever you like: Oxide offers every Provider it finds, and you choose one per Thread. [Requirements](/docs/quick-start#requirements).

**How do I stay up to date?** `#updates`
Oxide updates itself from Settings → Updates and offers only stable releases; test pre-releases never reach the updater. New versions and what changed are on the [changelog](/changelog). [How updates work](README#updates).

## `/features` *(outline)*

**H1**: Everything between the prompt and the merge *(locked, above)*

**Intro key sentence**: Oxide drives the agent CLIs you already use and puts the review, the checks and the undo next to the conversation, so a finished Turn becomes a merge you can stand behind.

### The feature-name contract

One section per README Features lead-in, no more, no fewer. The **lead-in** column is the contract key the test compares with the `site:features` snapshot; the **heading** is what the page shows; the **anchor** is published and stable. Groups and their order follow [Page inventory and site structure](https://github.com/getoxide/website/issues/9): review first.

#### Group 1: Review before you merge

Group key sentence: The part most agent tools leave to you: seeing what changed, what was checked and what stayed unverified.

| README lead-in | Heading | Anchor | Key sentences |
| --- | --- | --- | --- |
| Verification Dossier. | Verification Dossier | `#verification-dossier` | Which Verification commands ran and whether they're still fresh, which languages no check covers, source changed without a test change, sensitive paths. Computed without an LLM, shown as separate signals, never a score; the agent's closing message stays apart as a claim. Links to the [review guide](/guides/review-ai-generated-code). |
| Blind review. | Blind review | `#blind-review` | A second Provider reviews the change seeing only the diff and the issue, never the original Thread. Its findings become Line comments you keep or dismiss. Links to the [Claude Code and Codex guide](/guides/claude-code-and-codex-together). |
| Diff by Turn, Uncommitted or Branch. | Diff by Turn | `#diff-by-turn` | See exactly what one Turn changed, thanks to Checkpoints taken when it starts and ends. Switch to everything uncommitted or the whole branch. |
| Line comments. | Line comments | `#line-comments` | Comment on any line of the Diff and send the comments back to the Thread as one prompt, or submit them to GitHub as a pull request review. |
| Revert and Restore. | Revert and Restore | `#restore` | Revert takes out one file or hunk; Restore puts a Thread's files back to how they were before any Turn. Both can be undone. |
| Rule suggestions. | Rule suggestions | `#rule-suggestions` | Feedback you keep giving becomes a proposed rule for the Project's `AGENTS.md`. |

#### Group 2: One app, every agent CLI

Group key sentence: The agents keep doing the work; Oxide gives them one window.

| README lead-in | Heading | Anchor | Key sentences |
| --- | --- | --- | --- |
| Multiple Providers. | Claude Code, Codex and Antigravity CLI | `#multiple-providers` | Use the three side by side. Oxide detects which ones are installed and offers only those. |
| Threads. | Threads | `#threads` | Each Thread is one conversation with one Provider, mapped one-to-one to that Provider's own session, with its own Model and Effort. |
| Permission modes. | Permission modes and Approvals | `#permission-modes` | Choose Ask, Auto-edit or Full access per Thread and answer Approvals inline. The Attention Center collects every Thread waiting on you, across Projects. |
| Slash commands, attachments and usage limits. | Slash commands, attachments and usage limits | `#slash-commands` | Each Provider's Slash commands and skills in the composer, files and images in the prompt, and the usage limits your Provider reports. |
| Worktrees. | Worktrees | `#worktrees` | A Thread can work in its own Git worktree, with an optional setup command per Project, so parallel work never collides. Never the lead of the page. |

#### Group 3: A full workspace around the conversation

Group key sentence: Everything the review needs, without a second app open.

| README lead-in | Heading | Anchor | Key sentences |
| --- | --- | --- | --- |
| Git and GitHub. | Git and GitHub | `#git-and-github` | Branches, commit and push, pull requests with checks and review threads, and Issues, through `git` and the GitHub CLI. |
| Code editor. | Code editor | `#code-editor` | A Monaco editor with language servers, installed on first use and only when you press Install. |
| Terminal. | Terminal | `#terminal` | Terminal tabs per Project with Command blocks, kept alive while you switch Threads. |
| Local dictation. | Local dictation | `#dictation` | Speak into the composer or the terminal; on-device Whisper models, and the audio never leaves your machine. |
| Keyboard first. | Keyboard first | `#keyboard` | Full keyboard navigation, themes and reduced-motion support. |

Capture captions are constraints-only: the build writes them, describing what the real capture shows.

## `/claude-code-gui` *(outline + locked FAQ)*

**Job**: people who use `claude` in a terminal and look for a GUI. Distinct content from `/codex-gui`: this page leads with the Turn (what one prompt changed, and undoing it).

**Intro** (directly under the H1): key sentence "Oxide is a desktop GUI for the `claude` CLI you already have: the same login, the same sessions, with each Turn's changes and checks in view." Then `⟨definition⟩`.

| Section heading | Key sentences |
| --- | --- |
| What Oxide adds to Claude Code | Every Turn gets its own diff, so you read what one prompt changed instead of scrolling a transcript. The [Verification Dossier](/features#verification-dossier) shows which checks actually ran, and Line comments go back to Claude Code as one prompt. |
| What stays the same | Claude Code still does the work, with your login and your plan. Each Thread maps one-to-one to a Claude Code session, and its Slash commands and skills are in the composer. |
| Undo a Turn, not just a file | Restore puts the files back to how they were before any Turn, and the Restore itself can be undone. Claude Code is told on its next prompt which files went back. |
| Let another Provider review it | Have Codex or Antigravity CLI review Claude Code's change in a [Blind review](/features#blind-review), seeing only the diff and the issue. Links to [Claude Code and Codex together](/guides/claude-code-and-codex-together). |
| GUI or terminal? | The terminal is still the fastest way to fire off a prompt. A GUI pays off at review time: per-Turn diffs, the Dossier, comments on lines and the pull request in one window. Links to [How to review AI-generated code](/guides/review-ai-generated-code). |

### Page FAQ *(locked)*

**Do I need Claude Code installed first?** `#install-claude-code-first`
Yes. Oxide drives the `claude` CLI; it doesn't replace it. Install Claude Code and log in once in a terminal, then launch Oxide and it shows up as a Provider. [Requirements](/docs/quick-start#requirements).

**Can I keep using my Slash commands and skills?** `#slash-commands-and-skills`
Yes. The composer lists Claude Code's own Slash commands and skills, because the Thread is a real Claude Code session, not an imitation of one.

**How do permission modes map to Claude Code?** `#permission-modes`
Each Thread runs in Ask, Auto-edit or Full access, and you can change the mode between Turns. When Claude Code asks for an Approval, you answer it inline; the Attention Center lists every Thread waiting on you.

**Does Oxide work with Claude Code on Windows?** `#windows`
Yes. Oxide runs on `⟨platforms⟩`, and on Windows it drives the `claude` CLI installed there, with the same Diff, Dossier and Restore as on macOS.

**What happens to my Claude Code sessions?** `#sessions`
Each Thread maps one-to-one to a Claude Code session. Deleting a Thread removes Oxide's own record of it (Transcript, Checkpoints, worktree) and leaves Claude Code's session files alone.

## `/codex-gui` *(outline + locked FAQ)*

**Job**: people who use `codex` in a terminal and wonder whether a GUI exists. Distinct content from `/claude-code-gui`: this page leads with the gap between what the agent says and what actually ran, and with using Codex alongside Claude Code.

**Intro**: key sentence "Yes, there is a GUI for Codex: Oxide drives the `codex` CLI you already use and shows which checks actually ran before you merge." Then `⟨definition⟩`.

| Section heading | Key sentences |
| --- | --- |
| "Tests pass" is a claim | Codex's closing message says what it believes it did. The [Verification Dossier](/features#verification-dossier) keeps that message apart and shows which Verification commands actually ran, which are stale and what no check covers. |
| Codex next to Claude Code | Run Codex and Claude Code in the same Project, one Thread each, each with its own Model and Effort. Let one write and the other run a [Blind review](/features#blind-review). Links to [Claude Code and Codex together](/guides/claude-code-and-codex-together). |
| What stays the same | Codex still does the work, with your login and your plan. Its Slash commands are in the composer, and the usage limits Codex reports are shown next to the Thread. |
| From the diff to the pull request | Review the change, leave Line comments, commit, push and open the pull request without switching to a browser. Links to [How to review AI-generated code](/guides/review-ai-generated-code). |

### Page FAQ *(locked)*

**Do I need the Codex CLI installed first?** `#install-codex-first`
Yes. Oxide drives the `codex` CLI rather than replacing it. Install Codex, log in once in a terminal, then launch Oxide and Codex appears as a Provider. [Requirements](/docs/quick-start#requirements).

**Can I choose the Codex model and reasoning effort?** `#model-and-effort`
Yes. Every Thread has its own Model and Effort, picked when you start it and changeable between Turns.

**Does Oxide show my Codex usage limits?** `#usage-limits`
Yes, when Codex reports them: the 5-hour and weekly limits appear in the app, so you see how much is left before you start a long Turn.

**Does Oxide work with Codex on Windows?** `#windows`
Yes. Oxide runs on `⟨platforms⟩`, and on Windows it drives the `codex` CLI installed there.

**Can Claude Code review what Codex wrote?** `#claude-code-reviews-codex`
Yes. Start a Blind review and pick Claude Code as the reviewer: it sees only the diff and the issue, never the Codex conversation, and its findings become Line comments you keep or dismiss. [The full workflow](/guides/claude-code-and-codex-together).

## `/guides/review-ai-generated-code` *(outline)*

**Job**: the review method for the query "how to review AI-generated code". The method stands on its own; Oxide is the tool that puts each step one click apart, never the premise.

**Intro key sentence**: An agent's summary tells you what it believes it did. Reviewing AI-generated code means checking what it actually changed and what actually ran, one Turn at a time.

| Section heading | Key sentences |
| --- | --- |
| Treat the summary as a claim | "Done, tests pass" is a sentence, not evidence. Start from the diff and the commands that ran, and read the summary last. |
| 1. Read one Turn at a time | A Turn is one prompt and everything the agent did in response. Reviewing per Turn keeps each diff small enough to read; in Oxide, Checkpoints make each Turn's diff exact ([Diff by Turn](/features#diff-by-turn)). |
| 2. Check what actually ran | Look for which tests, type checks and builds ran after the last edit, which went stale, and which languages or paths no check covers. That is what the [Verification Dossier](/features#verification-dossier) computes, without an LLM. |
| 3. Send feedback where it belongs | Comments on lines, not paragraphs of chat. Send them back to the agent as one prompt, or to the pull request as a review ([Line comments](/features#line-comments)). |
| 4. Undo what you don't want | Take out one hunk or one file, or put everything back to before a Turn, and keep the rest ([Revert and Restore](/features#restore)). |
| Before you merge | A short checklist: every Turn read, every Risk signal looked at, checks fresh on the final commit. Optionally publish the Dossier in the pull request body so reviewers see the same evidence. |
| Going further: a second reviewer | One paragraph pointing to [Claude Code and Codex together](/guides/claude-code-and-codex-together). |

## `/guides/claude-code-and-codex-together` *(outline)*

**Job**: the query "claude code and codex together" and "have Codex review Claude Code". Honest about cost and about doing it without Oxide.

**Intro key sentence**: Claude Code and Codex are different agents with different blind spots. Let one write the change and have the other review it, seeing only the diff and the issue.

| Section heading | Key sentences |
| --- | --- |
| Why a second agent | A reviewer that didn't write the change, from a different model, catches what the author's context hides. |
| Why the reviewer works blind | A reviewer that reads the original conversation inherits its assumptions. Given only the diff and the issue, it judges the change on its own terms. That is a [Blind review](/features#blind-review). |
| Set it up | Both Providers installed and logged in. One Thread with the writer; when its Turn finishes, start a Blind review and pick the other Provider. |
| Read the findings | The reviewer's findings arrive as Line comments on the Diff. Keep the ones that hold up, dismiss the rest, and send the kept ones back to the writer as one prompt. |
| When it's worth it | A Blind review spends usage on a second Provider. Use it where it pays: changes that touch sensitive paths, trigger Risk signals, or lack tests. |
| Without Oxide | You can do this by hand: give the second agent a fresh session with only the diff and the issue, and paste its findings back. Oxide removes the copying and keeps the reviewer from seeing the conversation. |

## Open points for review

Questions the draft surfaced. Each needs Lorenzo's call before this file is merged.

1. **Where `⟨platforms⟩` comes from.** The README markers are `definition`, `requirements`, `quick-start`, `faq` and `features`; none holds the platform list. Proposal: derive it from the release assets in the snapshot (an `aarch64.dmg` means macOS on Apple Silicon, an `x64-setup.exe` means Windows x64), with the README Install table as the fallback before the first release.
2. **The unsupported-platform line on `/download` names platforms by hand** ("Linux, Intel Macs and Windows on ARM"), which bends rule 5. It is the wording decided in the download ticket, and nothing in the snapshot lists what is *not* supported. Proposal: accept it as a second hand-written exception, next to the footer trust line.
3. **The macOS signing line is true only until notarization** ([oxide#417](https://github.com/getoxide/oxide/issues/417)). Proposal: when that lands, changing the line and the `#macos-cant-be-opened` answer is part of the same change, not a snapshot flag.
4. **"Open-source" and "free" in titles and descriptions.** They come from the canonical definition, so the draft treats them as identity, not as the retyped "MIT licence" fact.
5. **Proof-point order on a path.** The visual direction draws the proof points as a four-step path, "From prompt to merge", in positioning order (Dossier first). Read as a path, "One window" → "Every Turn" → "Dossier" → "Blind review" would follow the actual flow. The draft keeps positioning order, as decided; say if the path should win.
