# How comparable agent GUIs present themselves

Research for [#6](https://github.com/getoxide/website/issues/6), part of the map [#1](https://github.com/getoxide/website/issues/1). It informs positioning ([#8](https://github.com/getoxide/website/issues/8)). The site will not publish "vs" pages, so nothing here is meant to be quoted against a named competitor.

**Snapshot date:** every site below was fetched on 2026-11-10. These pages change weekly; treat the wording as a dated snapshot.

**Method and its limits.** Each claim comes from the vendor's own site or docs, fetched today. Pages were read through a fetch tool that converts HTML to text and summarizes it, so quoted strings are as that tool reported them and layout, motion and video content were not seen. Where it mattered (Conductor) the raw HTML was also downloaded and read directly. "Not mentioned" always means "not on the pages fetched", never "the product lacks it". Oxide facts come from the Oxide repo (`README.md`, `PRODUCT.md`, `GLOSSARY.md`, `llms.txt`, ADR-0010, ADR-0011).

## Summary

1. **The category is moving to cloud, teams and fleets.** Headlines today: "Run a team of coding agents in the cloud" (Conductor), "Run an Army of Coding Agents" (Paradev), "Coding agents for your whole team" (Emdash), "Open infrastructure for cloud software factories" (Warp), "Works autonomously, runs in parallel" (Cursor). Nobody leads with the moment after the agent stops.
2. **Review is mentioned everywhere and explained nowhere.** Almost every page says "review" once ("review and merge their changes", "Inline diff review before you push", "review changes with ease"). None says what a reviewer is shown beyond a diff.
3. **Diff, line comments, worktrees, PR creation and multi-agent support are table stakes.** Claiming them as differentiators would be wrong.
4. **No site fetched describes anything like the Verification Dossier or Blind review.** These are the two gaps Oxide can own outright. Per-Turn diff for any Turn and Restore are narrower gaps that need careful wording.
5. **The market is unstable this month.** Conductor is being wound down after joining Meta, Vibe Kanban is sunsetting, Superset was renamed Paradev, and Emdash's desktop app became "Emdash Classic". A local, open-source, no-account app is a credible answer to that, without naming anyone.

## Per-tool findings

### Conductor (conductor.build)

- **Headline.** The HTML page: title "Conductor - Run a team of coding agents in the cloud", hero "Run a team of coding agents in the cloud.", meta description "Run coding agents in isolated cloud sandboxes with Conductor Cloud." The text version the site serves to the fetch tool still carries the older claim: "Run parallel coding agents on your Mac." / "Create parallel Claude Code, Codex, and Cursor agents in isolated workspaces. See at a glance what they're working on, then review and merge their changes."
- **Audience.** Teams ("Conductor is now multiplayer"), "100k+ builders".
- **Structure.** Announcement bar, hero with one testimonial, multiplayer block, cloud sandbox block, "Bring your own subscriptions and keys", API block, "Conduct from anywhere" (desktop, mobile, API), changelog teaser, footer. No pricing, no FAQ.
- **Proof.** "Trusted by 100k+ builders", one named testimonial (a product designer at Thinking Machines), one quote about shipping speed, SOC 2 Type II. Animated UI mock-ups; no video file found in the HTML.
- **Download flow.** The HTML fetched has no download link at all: the only links are announcement, docs, changelog, blog and socials. Docs say "Get Conductor running on your Mac."
- **Status.** Top bar and changelog 0.93.0 (2026-11-04): "Conductor is joining Meta." "We'll be winding down Conductor over the next weeks and months": "Conductor Cloud goes read-only on November 13 and shuts down on November 20." "Local Conductor keeps getting new models and critical bug fixes until early 2027." Footer reads "Conductor from Meta".
- **On review.** Docs: a Diff viewer with commit filtering and line comments for the agent, GitHub review comments shown in-app, and a Checks tab that "collects the state you need before merging a workspace" (git status, PR metadata, CI and status checks, deployments, review threads, todos). The homepage demo shows a prompt asking a second model for a review ("get a review from gpt 5.6 sol ... and then put up a PR").
- **Unsaid.** Per-turn diffs, restore, which checks the agent itself ran, what stayed unverified, a reviewer that has not seen the conversation, Windows or Linux.

### T3 Code (t3.codes)

- **Headline.** "The open-source control plane for coding agents." / "Orchestrate Claude Code, Codex, Antigravity, OpenCode, Cursor, and Grok from one surface."
- **Audience.** Individual developers who already pay for an agent; tone is irreverent ("Tolerated by over 500,000 devs", "Steal our code (legally)").
- **Structure.** Hero with download, social proof wall, "Bring your own sub", "One button to commit, push, and make a PR.", "If you don't like something, fork it.", closing "Your agents deserve better than a terminal."
- **Proof.** "54k+ GitHub stars", "over 500,000 devs", about 20 X posts as testimonials, one desktop screenshot, a PR-flow UI mock-up. No video, no company logos.
- **Download flow.** "Download for macOS" in the hero, linking to GitHub Releases. A `/download` page with a Stable/Nightly toggle: macOS arm64 and x64 `.dmg`, Windows `.exe`, Linux `.deb` and AppImage, iOS and Android apps, `curl ... | sh` and PowerShell one-liners, and `npx t3@latest` to try without installing. No version number, prerequisites or signing notes on the page.
- **On review.** One line: "Inline diff review before you push." Plus "Draft PRs, stack PRs, amend PRs", "Auto-generated PR titles & bodies", "Every agent thread writes to its own branch."
- **Unsaid.** Checkpoints, restore, verification, tests. Note: T3's source does implement checkpoint-based turn diffs with hidden Git refs (see `docs/research/t3-code-architecture.md` in the Oxide repo, pinned commit `680152e`); the site simply does not market it.
- **Closest to Oxide** in shape (open source, MIT, bring your own subscription, multi-Provider, PR button) and far ahead in reach.

### Claude Code and the Claude desktop app (claude.com/product/claude-code, code.claude.com/docs)

- **Headline.** "Claude Code" / "Hand Claude a bug fix, test, or multi-day migration. Steer and review from your terminal, IDE, Slack, or web."
- **Audience.** Developers and engineering organisations; Team and Enterprise plans are on the page.
- **Structure.** Hero with "Download for macOS" and a row of surfaces (Terminal, Web, iOS, Android, GitHub, VS Code, JetBrains, Slack), pricing, feature announcements, "What Claude Code can take on", "Meets you where you code", Slack, testimonials, integrations, FAQ, closing CTA.
- **Proof.** Two rows of company logos, three named testimonials (Ramp, Intercom, Notion) with customer stories, text-rendered session transcripts, three images. No video reported.
- **Download flow.** Direct `.dmg` from the hero button. Docs list macOS universal, Windows x64 and ARM64, Linux beta; then "launch Claude, sign in, and click the **Code** tab." A paid plan or Console account is required.
- **On review (desktop docs).** "the diff view lets you review modifications file by file before creating a pull request"; line comments submitted in one go; `/code-review` with a findings card and "Apply fixes"; PR status with CI checks, "Auto-fix" and "Merge when ready"; optional worktree per session ("By default, **Worktree** is off"); auto-verify through a browser preview ("takes screenshots, checks for errors, and confirms changes work").
- **On restore (checkpointing docs).** Checkpoints are taken "before each prompt you send"; `/rewind` restores code, conversation or both. Documented limits: "A file that only Bash commands changed isn't tracked", subagent edits are usually not captured, and "Checkpoints are designed for quick, session-level recovery."
- **Unsaid.** A diff scoped to one earlier turn, an account of which checks ran, review by a different vendor's model. One Provider only, by design.

### Codex and the ChatGPT desktop app (chatgpt.com/codex, learn.chatgpt.com/docs)

- **Headline.** "Build anything with Codex." / "Move faster, go further, and bring your biggest ideas to life." The desktop docs no longer describe a separate "Codex app": Codex is a mode inside the "ChatGPT desktop app" ("Choose ChatGPT or Codex").
- **Audience.** Broad, from individuals on Plus to enterprises ("Contact sales").
- **Structure.** Hero, logos, plan block ("Codex is included in your ChatGPT plan."), "The best way to build with agents", "Designed for multi-agent workflows", cloud, "Scale code review confidently", plugins, "The same agent everywhere you code", testimonials, closing CTA.
- **Proof.** Logos (NVIDIA, Cisco, Shopify and others), six company testimonials, one metric (Harvey, "30–50%"), product screenshots including an edited-files review panel. No video reported.
- **Download flow.** "Download" in the nav; docs offer "Download for macOS (Apple Silicon)" as a direct `.dmg`, with Windows and Linux pages; sign in with a ChatGPT account.
- **On review (code-review docs).** A review pane with scopes Unstaged, Staged, Commit, Branch and **Last turn**; line comments ("Codex treats inline comments as review guidance"); stage or revert the whole diff, a file or a hunk; `/review` against a base branch or uncommitted changes. Marketing copy: "using computer and browser tools to verify work until your requirements are met."
- **Unsaid.** A diff for any earlier turn (only the last one), restoring files to before a turn, an account of the checks that ran, review by another vendor's model.
- **Not verified.** `openai.com/codex/` returned HTTP 403 to the fetch tool; `chatgpt.com/codex` and the docs were used instead.

### Cursor (cursor.com)

- **Headline.** "Cursor is your coding agent for building ambitious software." Title: "AI Coding Agent for Building Ambitious Software | Cursor".
- **Audience.** Professional teams and enterprises ("Trusted by over half of the Fortune 500", "Request a demo").
- **Structure.** Thirteen sections: hero with three CTAs, trust line, agents, "Works autonomously, runs in parallel", "In every tool, at every step", AI teammates, testimonials, models, cloud agents, enterprise, changelog, careers, blog, closing CTA.
- **Proof.** Celebrity testimonials (Jensen Huang, Andrej Karpathy, Patrick Collison, Greg Brockman and others), certifications, interactive product demos embedded in the page.
- **Download flow.** "Download for macOS" in the hero and at the bottom. `/download` lists every build (macOS ARM64, x64, universal; Windows x64 and ARM64, system and user; Linux `.deb`, RPM, AppImage), version history back six releases, and a `curl` line for the CLI.
- **On review.** Cursor "reviews PRs in GitHub" (Bugbot); agents "build, test, and demo features end to end for you to review."
- **Unsaid.** Diffs, checkpoints, worktrees, and it does not drive other vendors' agent CLIs: it is its own agent with a model picker.

### Zed (zed.dev, zed.dev/agentic)

- **Headline.** "Your last next editor" / "Zed is a minimal code editor crafted for speed and collaboration with humans and AI." On the AI page: "AI coding at native speed".
- **Audience.** Developers who care about a fast editor; open source ("Clone source" sits next to "Download now").
- **Structure.** Hero, trust row, feature grid (Fast, Agentic, Collaborative, Parallel Agents, Debugger, Git, Edit Prediction), AI block, extensions, founders' letter, blog, closing "Daily drive with Zed".
- **Proof.** Named developer testimonials (José Valim, Dan Abramov and others), extension install counts, short feature videos with "Play Video" on most blocks.
- **Download flow.** `/download` leads with the version and date ("1.27.0", November 04, 2026), a Stable/Preview toggle, macOS ("Requires version 12.0 or later"), Windows, and a `curl` line for Linux. No sign-in.
- **On review.** "Review the agent's work in an editable unified diff. Accept or reject all changes before committing them." External agents: "Bring agents like Claude Agent, Codex, or OpenCode via ACP."
- **Unsaid.** Checkpoints, verification, worktrees, pull requests. Zed is an editor with agents in it; the agent is a guest.

### Warp (warp.dev, warp.dev/terminal)

- **Headline.** Home: "Open infrastructure for cloud software factories". Terminal page: "The terminal, rebuilt for the agent era".
- **Audience.** Engineering organisations automating the software lifecycle; the terminal is now a secondary product.
- **Structure.** Factory-as-code, SDLC automation, measurement, cost case study, enterprise, open source, "Control your coding agent chaos", "Agents prove their work with computer use", FAQ.
- **Proof.** "Trusted by 800k+ devs at" plus logos, a cost claim ("Cutting our cost per PR from $80 to $30"), a benchmark chart, Product Hunt rating, SOC 2. One video on the terminal page.
- **Download flow.** Primary CTAs are "Book a demo" and "Get started"; "Download Warp" is a card lower down. `brew install --cask warp`; Mac, Windows, Linux.
- **On review.** Terminal page: "Review changes, leave comments, and send to agents for refinement." Home: "every factory agent captures a screenshot or video so you can verify its work before shipping a PR." A banner advertises an event titled "Solving the code review bottleneck: Agent verification & PR risk assessment."
- **Unsaid.** Diff scopes, restore. Its verification story is evidence produced by the agent (screenshots, video, a scorer), not an independent account.

### Others found along the way

| Tool | Headline today | Notes |
|---|---|---|
| Paradev, formerly Superset (paradev.com) | "Run an Army of Coding Agents" / "The open-source workspace for Claude Code, Codex, and any coding agent." | MIT, 16.2k stars, "$11.5M seed", SOC 2. macOS, experimental Linux, no Windows. "Scale to 100+ agents". Has an FAQ and a "See how Paradev compares to other tools" link. Restore not mentioned. |
| Emdash (emdash.com) | "Coding agents for your whole team." | Pivoted to cloud; the open-source desktop app is now "Emdash Classic" (6.2k stars, macOS, Windows, Linux). CTA is "Get early access" with a work email. YC logo. |
| Vibe Kanban (vibekanban.com) | "Your Engineering Bottleneck Has Shifted" / "Accelerate the human planning and review your coding agents are waiting on" | Banner: "Vibe Kanban is sunsetting. The project will continue as open source and community maintained." Install is `npx vibe-kanban`. The only site whose headline is about review as the bottleneck. |
| Nimbalyst (nimbalyst.com) | "Overwhelmed and disorganized by Codex and Claude Code?" | Now leads with an agent-written wiki. Runs dedicated landing pages per category query (`/claude-code-gui/`, `/codex-gui/`, `/claude-code-desktop-app/`, `/codex-desktop-app/`), each long, with an FAQ and a comparison table. |
| Google Antigravity (antigravity.google) | "Experience liftoff with the next-gen agent platform" | Google's own app; one of Oxide's Providers is its CLI. Hero video, persona case-study videos, "Available at no charge". Mentions "artifacts and comprehensive verification tests"; no diff or review copy. |

Code Bar, 1Code, cdesktop, Claudette, termic and FleetCode turned up in search results as smaller GUIs for agent CLIs. Their sites were not fetched; nothing is claimed about them.

## Patterns across the sites

**Evidence.**

- **Hero formula.** One sentence naming the category, one sentence naming the agents, one download button labelled with the OS ("Download for macOS" on T3 Code, Claude Code, Cursor, Paradev, Codex docs).
- **Naming the agents is universal** among the wrappers: every one lists Claude Code and Codex in the first two lines.
- **"Bring your own subscription"** is a standard section (T3 Code "Bring your own sub", Conductor "Bring your own subscriptions and keys", Emdash, Nimbalyst).
- **Proof ranks** roughly: GitHub stars and user counts, then X posts, then company logos, then SOC 2. First-party apps use customer stories. Wrappers rarely use video; Zed and Antigravity do.
- **Download.** Open-source tools send the hero button to GitHub Releases (T3 Code) and add a `/download` page with every build. Showing the version and date (Zed, Cursor) and a no-install trial (`npx t3@latest`, `npx vibe-kanban`) both appear. No wrapper site fetched explains code signing or how to verify a download.
- **Review vocabulary.** "review and merge", "inline diff review", "review changes with ease", "verify its work". Verification, where it appears, means the agent demonstrating its own result (Warp, Claude auto-verify, Codex, Cursor).
- **Comparison content exists but is not "vs" pages only.** Nimbalyst's category landing pages target the same queries the map lists ("GUI for Claude Code", "desktop app for Codex") without being a page against one named product, although they do contain a comparison table.

**Opinion.**

- The shift to cloud and fleets leaves the single engineer who must sign off on a change underserved in the copy, even where the products have decent review tooling.
- Irreverent social proof (T3 Code) and enterprise proof (Cursor, Warp) are both out of reach for a pre-release app. Oxide's available proof is the product itself: real captures, the open repository, CI, build provenance.

## What is and is not a gap

Stated carefully, because the ticket lists five candidate differentiators and not all five hold.

| Oxide feature | What others say on their sites | Verdict |
|---|---|---|
| **Verification Dossier** | Nothing equivalent. Nearest: Conductor's Checks tab (CI, todos, review threads), Warp's agent-captured screenshots and scorer, Claude's auto-verify. All are CI state or the agent's own evidence. None states which checks ran, whether they are stale, and what no check covers, computed without an LLM. | **Open. Strongest gap.** |
| **Blind review** | Claude `/code-review` and Codex `/review` use the same vendor. Conductor's demo asks a second model for a review by prompt, inside the conversation. No site describes a reviewer from another Provider that sees only the diff and the issue. | **Open.** |
| **Per-Turn diff** | Codex documents a "Last turn" scope. T3 Code implements turn diffs but does not market them. Conductor filters by commit. No site describes picking any earlier Turn. | **Partly open.** Claim "any Turn, for every Provider", never "the only per-turn diff". |
| **Restore** | Claude Code has `/rewind` (with documented limits on Bash-made changes and subagents). Codex reverts files and hunks. Oxide's own ADR-0011 says "competing tools already offer restore". | **Not unique.** Claim the specifics: before any Turn, undoable, same for every Provider. |
| **Multi-Provider** | T3 Code, Conductor, Paradev, Emdash, Vibe Kanban and Zed all drive several agents; most list more than Oxide's three. | **Table stakes.** Useful only as the precondition for Blind review. |
| Line comments, worktrees, PR creation | Documented by nearly everyone. | **Table stakes.** Mention, do not headline. |

## Gaps Oxide can credibly own

1. **The account of what was checked.** The one thing no site shows: after the agent says "done", which Verification commands actually ran, which are stale, which languages and paths nothing covered, with the agent's closing message kept apart as a claim. "Computed without an LLM" and "separate signals, never a single score" are both distinctive and verifiable in the source.
2. **A second Provider that has not read the conversation.** Blind review turns "multi-Provider" from a list of logos into a reason: the reviewer is a different vendor's model and sees only the diff and the issue.
3. **The other end of the pipeline.** Everyone else's headline is about starting more agents (parallel, team, army, fleet, factory). Oxide's ADR-0010 already says it optimizes "the path from a finished agent Turn to a confident merge". That sentence has no competitor on any hero fetched. Vibe Kanban, the one site that framed review as the bottleneck, is sunsetting.
4. **Any Turn, and back again.** Per-Turn diff for any Turn plus Restore to before any Turn, identical across Providers and undoable. Narrower than 1 and 2, and must be worded as specifics, not as a first.
5. **Local, no account, no server, no telemetry.** While Conductor, Emdash, Warp and Cursor lead with cloud, and one of them is shutting its cloud down, "your Transcript, Checkpoints and Review ledger stay on your machine" is a plain, checkable statement. It needs no reference to anyone else's situation.
6. **A download you can verify.** No wrapper site fetched mentions checksums, provenance or signing status. Oxide publishes `SHA256SUMS.txt` and build-provenance attestations and says openly when a build is unsigned. For an audience defined by wanting evidence before trusting, the download page can practise what the product preaches.
7. **Windows as a first-class target.** Conductor is Mac-only and Paradev has no Windows build; T3 Code, the first-party apps, Cursor, Zed and Warp do have one, so this is a point against some alternatives only. State it as a fact, not as a differentiator.

## Recommendations for the decisions this unblocks

- **Positioning (#8).** Lead with the confident merge, not with the agents. Keep the README's line ("The open-source desktop app for reviewing and merging what your coding agents write.") as the base: it is already unlike every hero above. Name Claude Code, Codex and Antigravity CLI in the subheadline, as every comparable site does and as the category queries require.
- **Feature order.** Verification Dossier first, Blind review second, per-Turn diff and Restore third, then the table stakes (Line comments, worktrees, Git and GitHub, editor, terminal) in one compact block.
- **Wording guardrails.** Do not write "the only" for per-Turn diff, Restore or multi-Provider. Do not use "verify" for what the Dossier does without saying it reports checks rather than runs or judges them.
- **Proof.** Real captures of the Dossier and of a Blind review are the proof no one else has. Skip star counts and user numbers until they are worth showing. Short captures on feature blocks (the Zed pattern) fit the motion bar better than a hero video.
- **Download page.** Follow the open-source pattern (OS-labelled button to GitHub Releases, a page listing every build with version and date) and add what nobody has: requirements (a Provider installed and logged in, `git`), signing status, and the verification commands.
- **Category queries without "vs" pages.** Nimbalyst shows that pages built around "Claude Code GUI" and "Codex desktop app" with an FAQ are the working pattern. Oxide can do the same with FAQ-led pages that describe Oxide alone; whether to include any comparison table is a decision for the page inventory, given the map's rule against naming competitors.
- **FAQ.** Every wrapper that has one answers "is it free", "is it open source", "does it replace the agent". Oxide's README FAQ already covers these and adds the honesty line ("Is Oxide an AI coding agent? No.").

## Not verified

- Visual design, motion and video content of every site: only text was read.
- `openai.com/codex/` (HTTP 403). The Codex findings come from `chatgpt.com/codex` and `learn.chatgpt.com/docs`.
- Whether Conductor's HTML page hides a download button behind client-side rendering, and the terms of the Meta deal.
- The second half of the Claude desktop docs page (it was truncated at 100,000 characters); checkpoint behaviour inside the desktop app specifically was not confirmed, only in Claude Code generally.
- Pricing pages, and every product's actual behaviour: this is a study of what the sites say, not a hands-on test. A product may do more than its site claims (T3 Code's checkpoints are an example).
- User and star counts are the vendors' own figures.
- The smaller tools listed from search results only.

## Sources

All fetched 2026-11-10.

- Conductor: <https://conductor.build>, <https://conductor.build/docs>, <https://conductor.build/docs/reference/diff-viewer>, <https://conductor.build/docs/reference/checks>, <https://conductor.build/changelog>, <https://conductor.build/changelog/0.93.0-conductor-is-joining-meta>
- T3 Code: <https://t3.codes>, <https://t3.codes/download>; source notes in the Oxide repo, `docs/research/t3-code-architecture.md`
- Claude Code: <https://claude.com/product/claude-code>, <https://code.claude.com/docs/en/desktop>, <https://code.claude.com/docs/en/checkpointing>
- Codex: <https://chatgpt.com/codex>, <https://learn.chatgpt.com/docs/app>, <https://learn.chatgpt.com/docs/code-review.md>
- Cursor: <https://cursor.com>, <https://cursor.com/download>
- Zed: <https://zed.dev>, <https://zed.dev/agentic>, <https://zed.dev/download>
- Warp: <https://www.warp.dev>, <https://www.warp.dev/terminal>
- Paradev: <https://paradev.com/> (redirect from `superset.sh`)
- Emdash: <https://emdash.com/> (redirect from `emdash.sh`)
- Vibe Kanban: <https://www.vibekanban.com>
- Nimbalyst: <https://nimbalyst.com>, <https://nimbalyst.com/claude-code-gui/>
- Google Antigravity: <https://antigravity.google>
- Oxide: `README.md`, `PRODUCT.md`, `GLOSSARY.md`, `llms.txt`, `docs/adr/0010-prioritize-the-path-to-a-confident-merge.md`, `docs/adr/0011-checkpoints-can-be-restored-and-chat-threads-use-worktrees.md` in <https://github.com/getoxide/oxide>
