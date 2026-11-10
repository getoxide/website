# Search query landscape for Oxide

Research for [issue #3](https://github.com/getoxide/website/issues/3), part of the map in issue #1.
Observed on **2026-11-10**. Everything here is a snapshot: SERPs, star counts and autocomplete drift weekly in this category.

## Question

For the three success levels on the map (qualified brand queries, category queries, LLM answers): which real queries do people use, who ranks for them today, and what is the baseline?

## Method and limits

No paid SEO tool was available, so **search volumes are unknown for every query in this document**. Nothing below is a volume figure.

| Instrument | What it gives | Limit |
| --- | --- | --- |
| Google autocomplete, public endpoint `suggestqueries.google.com/complete/search` (`hl=en`, `gl=us`), about 70 seeds | Evidence that a phrasing is typed by real people. Presence or absence only. | No volumes, no ranking between phrasings. The endpoint also returns some suggestions that look machine-completed; its subtype codes are undocumented, so I did not use them. |
| A US-only web search API (about 25 queries) | Who appears for a query, and a search-grounded LLM summary of the results | **Not Google or Bing.** The underlying index is not disclosed, the order is not a rank, and personalisation and SERP features (AI Overviews, knowledge panels, video, Reddit blocks) are invisible. Treat it as "who is in the result set", not "who is position 1". |
| GitHub API (`gh api`) | Star counts, licences, last push of comparable repos | Exact, as of the date above. |
| First-party pages fetched directly | What official products are and claim | Cited inline. |

Not done, and why: a direct scrape of Google, Bing or DuckDuckGo result pages (DuckDuckGo's HTML endpoint returned no results to an automated client; Google and Bing were not attempted), and any query to ChatGPT, Gemini, Perplexity or Copilot (no access from this environment). Both are listed under [To verify manually](#to-verify-manually).

## Baseline: Oxide today

Evidence:

- `getoxide/oxide` is public, created 2026-10-21, **1 star, no release, empty homepage field** (GitHub API).
- `oxide.cavallinilorenzo.com` does not resolve yet.
- The repo did not appear in any result set for any query tried, including the exact string `"getoxide/oxide"` and the descriptive query `oxide desktop app AI coding agents open source`. The search-grounded summary for that query said: "The search didn't turn up an app called 'Oxide' that is a desktop app for AI coding agents."
- `getoxide.com` is a live domain serving an empty placeholder page ("©2022-2024 getoxide.com"). It is not this project's.

Reading: Oxide's search presence is zero at all three levels. That is expected for a three-week-old repo with no site, and it means there is no existing ranking to protect.

## Level 1: brand queries

### The bare query "oxide" (out of scope, recorded for context)

- Result set: Wikipedia "Oxide" (chemistry), dictionaries, chemistry study sites.
- Autocomplete for `oxide`: oxide computer company, oxide survival island, oxide formula, oxide ion, oxide computer, oxide meaning, oxide charge, oxide game.
- Owners, in order of visible strength: **chemistry**, **Oxide Computer Company** ([oxide.computer](https://oxide.computer/), "On-prem that feels like the public cloud"; ten autocomplete completions of its own, such as careers, glassdoor, series d, founders), and **games** (Oxide Survival Island; the Oxide/uMod modding framework for the game Rust).
- GitHub has **3,055 repositories with "oxide" in the name**. "-oxide" is a naming convention for Rust ports (markdown-oxide 2.3k stars, pdf_oxide, jxl-oxide, miniz_oxide, gitoxide), so "oxide rust" and "oxide github" are saturated too.

This confirms the map's decision to leave the bare query out of the v1 success criteria.

### Qualified variants

| Query | Autocomplete | Who is in the result set today | Reading |
| --- | --- | --- | --- |
| `getoxide` | none | Nothing relevant; the engine falls back to chemistry | **Unowned.** The only truly clean brand term. |
| `oxide claude code` | none | Oxide Computer's LLM material (an internal "LLM tips" gist recommending Claude Code, commentary on [RFD 576 "Using LLMs at Oxide"](https://rfd.shared.oxide.computer/rfd/0576)), a third-party "Oxide Computer vs Claude Code" page, a community Claude Code skill "Develop Like Oxide", and [hakula139/oxide-code](https://github.com/hakula139/oxide-code) | Contested by **Oxide Computer's engineering reputation**, not by a product. Winnable with a page that pairs the two terms explicitly. |
| `oxide coding agent` | none for "oxide coding" (Google rewrites it to "oxide coating") | `oxide-code` ("Yet another coding agent, written in Rust", 2 stars), `oxi` (a native Rust desktop coding agent), `Oxe` (a CLI coding agent on Product Hunt), then chemistry | Weak competitors, but all of them **are** agents. Oxide is not one, so the page that answers this query must say so. |
| `oxide app` | oxide app store, oxide application, then Apple and oxidation noise | JourneyApps OXIDE (a low-code IDE and app-container platform), `dev.invrs.oxide` (a Rust-built Linux game-modding tool on Flathub), OxideTerm (1.8k stars, "AI-native workspace for local shells"), a WebCatalog wrapper for Oxide Computer, the reMarkable "Oxide" launcher | Crowded with unrelated software called Oxide. Hardest of the qualified set. |
| `oxide ai` | oxide ai policy, oxide ai rfd, oxide ai company | Oxide Computer | **Owned by Oxide Computer.** Do not target. |
| `oxide code` | oxide codes, nitrous oxide code, HS codes | chemistry, trade codes | Not a software query. Do not target. |
| `oxide download`, `oxide mac`, `oxide rust` | oxide download rust/apk/windows/umod/mac; oxide macos; oxide rust plugins/mods/server | The Rust game's Oxide modding framework, Oxide Survival Island | Owned by gaming. "Oxide" plus "Rust" is the worst collision, and Oxide's stack is Rust. |
| `oxide desktop`, `oxide gui`, `oxide codex`, `oxide open source` | Only the seed itself echoes back, with no organic completions | Not checked individually | No demand signal yet, and no owner either. They become winnable by default once the site exists. |

Findings:

1. Nobody searches for this product by name yet, which is normal before a launch. Level-1 traffic will be created by the launch, not captured from existing demand.
2. The name collides with a well-known company in an adjacent developer niche. A reader or an LLM that sees "Oxide" next to "Rust", "open source" and "engineering" will think of Oxide Computer first.
3. Three small projects (`oxide-code`, `oxi`, `Oxe`) sit on "oxide + coding agent" and are actual agents. The risk is being taken for a fourth.

## Level 2: category queries

### Which phrasings are real

Autocomplete confirms these seeds and completions (grouped; presence only, no volumes):

- **Claude Code GUI**: `claude code gui`, `gui for claude code` (+ cli, reddit, github, linux), `ui for claude code`, `claude code gui vs terminal`, `claude code gui vs cli`, `best claude code gui`, `claude code windows gui`, `open source claude code gui`, `claude code alternative gui`, `claude code desktop alternative`.
- **Claude Code desktop app**: `claude code desktop`, `claude code desktop app` (+ download, mac, windows, linux, vs terminal, vs cli, vs vscode), `claude code app`, `claude code mac app`. These carry the richest completions of the whole set.
- **Codex GUI**: `codex gui` (+ for linux, vs cli, open source, for windows, download), `gui for codex cli`, `best gui for codex`, `is there a gui for codex`, `codex cli ui wrapper`, `codex desktop app` (+ linux, windows, mac, github), `codex app alternative`, `open source codex app alternative`, `is there a desktop app for codex`.
- **Antigravity**: `antigravity cli` (+ install, vs gemini cli, vs claude code, github), `antigravity cli gui`, `antigravity cli ui`.
- **Two agents together**: `claude code and codex together` (+ github, reddit), `using claude code and codex together`, `can claude code and codex work together`, `best way to use claude code and codex together`.
- **Reviewing agent output**: `review ai generated code` (+ reddit), `how to review ai generated code`, `best way to review ai generated code`, `do you review ai generated code`, `claude code review changes` (+ uncommitted, local, staged, git), `claude code diff viewer`, `claude code diff tool`.
- **Undo**: `claude code undo changes`, `claude code rollback changes`, `claude code revert all changes`, `claude code checkpoints` (+ restore, revert, "does claude code have checkpoints").
- **Parallel work**: `run multiple claude code agents`, `run multiple claude code sessions at once`, `claude code worktrees` (+ workflow, explained, best practices), `claude code parallel agents`.
- **Competitor-anchored**: `conductor alternative for windows`, `conductor alternative for linux`, `conductor alternative claude code`, `opcode vs claude desktop`, `vibe kanban alternative`, `t3 code alternatives`.
- **Category name**: `agentic engineering` (+ vs vibe coding, patterns, workflow, meaning), `agentic engineering tools`.

Two corrections to the map's level-2 wording:

- **"review AI agent code" is not how people phrase it.** Google completes that seed to `code review ai agent` (+ github, prompt, open source, gitlab, bitbucket), which is the opposite intent: an AI that reviews pull requests. The human-reviews-agent intent is phrased `review ai generated code` and `claude code review changes`.
- **"desktop app for Codex" is a navigational query for OpenAI's own app**, as "Claude Code desktop app" is for Anthropic's. The independent-tool intent sits under "gui": `codex gui`, `gui for codex cli`, `codex gui open source`.

### Who ranks

**Claude Code GUI.** Result sets are split between open-source repos and vendor comparison posts.

- Repos (GitHub API, 2026-11-10): [winfunc/opcode](https://github.com/winfunc/opcode), formerly Claudia, 22.4k stars, AGPL-3.0, Tauri 2; [siteboon/claudecodeui](https://github.com/siteboon/claudecodeui) (CloudCLI), 14.5k stars, AGPL-3.0, web UI.
- Coverage of those repos: It's FOSS, Apidog, ClaudeLog, AlternativeTo.
- Vendor "best of" posts: Nimbalyst ([Best Claude Code GUI in 2026](https://nimbalyst.com/blog/best-claude-code-gui-tools-2026/), by its CEO, published 2026-03-26, updated 2026-09-15; the same author's dev.to post also appears), [crystl](https://crystl.dev/compare/claude-code-guis/), CodeAgentSwarm, AgentsRoom, plus Medium and personal answer pages.
- Nimbalyst alone appeared with seven different URLs for one query: a `/claude-code-gui/` landing page, a `/claude-code-desktop-app/` landing page, several "best X in 2026" posts and head-to-head pages.

**Claude Code / Codex desktop app.** First-party pages own these.

- Anthropic's [Claude Code Desktop](https://code.claude.com/docs/en/desktop) is the Code tab of the Claude Desktop app, on macOS, Windows and Linux (beta). Its documentation lists parallel sessions, Git worktree isolation, a diff view with **line comments submitted back to Claude**, pull request check monitoring and auto-fix.
- OpenAI's Codex app URL (`developers.openai.com/codex/app`) now permanently redirects to a "ChatGPT desktop app" page on `learn.chatgpt.com`, where Codex is a mode of that app.
- Google ships its own Antigravity desktop app next to the `agy` CLI (seen only through secondary coverage and a Google Cloud blog title; not verified on a Google product page).

**Codex GUI.** Thinner than the Claude Code set: Nimbalyst again, CodeAgentSwarm, a dev.to listicle, [Dimillian/CodexMonitor](https://github.com/Dimillian/CodexMonitor) (4.4k stars, MIT, Tauri, last push 2026-03-26), OpenRouter's cookbook.

**Multi-provider desktop apps** (Oxide's actual shelf). Large and well funded in attention: [pingdotgg/t3code](https://github.com/pingdotgg/t3code) 54.9k stars, [BloopAI/vibe-kanban](https://github.com/BloopAI/vibe-kanban) 28.6k, [getpaseo/paseo](https://github.com/getpaseo/paseo) 23.7k, [generalaction/emdash](https://github.com/generalaction/emdash) 6.2k, [nimbalyst/nimbalyst](https://github.com/nimbalyst/nimbalyst) 2.1k, plus Conductor (macOS only), OpenClawdex, Canopy, Tessera, Pane. Nearly all describe themselves with the same sentence: run multiple coding agents in parallel.

**Reviewing AI-generated code.** Different owners, and no GUI vendor among them except one: [Real Python](https://realpython.com/review-ai-generated-code/), [Warp's docs guide "Review AI-generated code"](https://docs.warp.dev/guides/agent-workflows/how-to-review-ai-generated-code/), Laracasts, Pydantic, an arXiv paper, vendor checklists (Verdent, Tenki). Warp's page is the model to study: a generic how-to whose numbered steps are its own Code Review panel, and it states that it works with Claude Code, Codex and others.

**Claude Code and Codex together.** How-to posts (Towards Data Science, Substack, dev.to, personal blogs) and coverage of OpenAI's Codex plugin for Claude Code, which adds a Codex review command. The recurring pattern in those posts is "let one model review the other's diff", which is what Oxide calls Blind review. No desktop app appeared in this result set.

### What the winning pages look like

1. **One landing page per query phrasing**, with the phrase in the URL and H1 (`/claude-code-gui/`, `/codex-desktop-app/`, `/guides/codex-gui`).
2. **"Best X in 2026" comparison posts written by a vendor that ranks itself first**, with a quick-answer block, a comparison table, a "which one should you pick" section and an FAQ.
3. **"X vs Y" and "X alternatives" pages** (Paseo, Nimbalyst, HiveTerm, AlternativeTo).
4. **A docs-style how-to that makes the product the method** (Warp).
5. **The GitHub repo itself**, for open-source phrasings.

Types 2 and 3 are excluded by the map ("Oxide vs X" pages are out of scope, and so is a blog). Types 1, 4 and 5 are available.

## Level 3: LLM answers

### Observed

- **Search-grounded answers** (the summary the search API writes over its results; one run per question, one system):
  - "what is Oxide coding app": answered with JourneyApps OXIDE, then listed a Linux modding tool, the reMarkable launcher, a Rust-based language and a terminal app. Oxide was absent.
  - "which GUI should I use for Claude Code": Claude Code Desktop as the default, Nimbalyst for several sessions, Opcode and CloudCLI as open source, CodePilot for several providers. It noted that most sources are vendor-written. Oxide was absent.
  - "which GUI should I use for Codex CLI": the official OpenAI app, CodexMonitor for open source or Linux, Nimbalyst, CodeAgentSwarm. Oxide was absent.
- **Training knowledge**: the model that wrote this document (training cutoff June 2026) has no knowledge of the project, which is unavoidable since the repo dates from 2026-10-21. The same holds for any assistant whose cutoff precedes that date; such assistants can only know Oxide through live retrieval.
- The inputs an assistant would retrieve are the same vendor listicles and GitHub READMEs described above. Oxide's repo already has an `llms.txt` and a README FAQ; the site has neither, because it does not exist.

### Not observed

What ChatGPT, Gemini, Perplexity, Copilot and Claude's own apps answer to the level-3 questions. See the checklist below. Until that is done, "Oxide is absent from LLM answers" is proven for one search-grounded system and inferred for the rest.

## Prioritised query list

Priority weighs fit with what Oxide is, how weak the current owners are, and whether the map allows the page type. It is a judgement, not a measurement. **Volume is unknown for every row.**

| # | Query cluster | Intent | Who holds it now | Page that could win it |
| --- | --- | --- | --- | --- |
| 1 | `getoxide`, `getoxide oxide`, `oxide getoxide github` | Navigational | Nobody | Home page, plus the GitHub repo with its homepage field set to the site. Winning this needs only existence and the string "getoxide" in visible text. |
| 2 | `oxide claude code`, `oxide codex`, `oxide gui`, `oxide desktop app` | Navigational, brand plus category | Oxide Computer's LLM writing; `oxide-code` | Home page whose title and H1 pair "Oxide" with "Claude Code" and "Codex", for example "Oxide: desktop app for Claude Code, Codex and Antigravity CLI". |
| 3 | `oxide coding agent`, `what is oxide (coding)` | Informational, disambiguation | `oxide-code`, `oxi`, `Oxe`; JourneyApps OXIDE in LLM answers | A "What is Oxide?" block or page in question-and-answer form, stating that Oxide is not an agent and is not affiliated with Oxide Computer Company. Mirrored in `llms.txt`. |
| 4 | `claude code gui`, `gui for claude code`, `open source claude code gui`, `claude code windows gui`, `claude code gui vs terminal` | Commercial investigation | opcode, CloudCLI, Nimbalyst, crystl, listicles | A dedicated landing page at a URL containing the phrase (`/claude-code-gui`), specific to Claude Code: what Oxide adds to the `claude` CLI and what stays the same. Includes the "vs terminal" answer already in the README FAQ. |
| 5 | `codex gui`, `gui for codex cli`, `codex gui open source`, `codex gui for windows`, `is there a gui for codex` | Commercial investigation | Nimbalyst, CodeAgentSwarm, CodexMonitor | The same page type for Codex (`/codex-gui`). Thinner competition than row 4, and the best-known open-source entry has not been pushed to since March. |
| 6 | `review ai generated code`, `how to review ai generated code`, `best way to review ai generated code` | Informational | Real Python, Warp docs, vendor checklists | A docs-style guide, not a blog post: the review steps, with Diff by Turn, the Verification Dossier and Line comments as the method. Closest to Oxide's positioning and the only cluster where GUI competitors are mostly absent. |
| 7 | `claude code and codex together`, `can claude code and codex work together`, "have Codex review Claude Code" | Informational, how-to | Blog how-tos; OpenAI's Codex plugin for Claude Code | A feature page or guide for Blind review, framed as a second Provider reviewing the first one's diff. |
| 8 | `claude code review changes`, `claude code diff viewer`, `claude code undo changes`, `claude code rollback changes`, `claude code checkpoints restore` | Informational, task | Anthropic docs, Q&A threads (result sets not inspected) | Feature sections with their own headings and anchors (Diff, Revert and Restore), or short docs pages. Low cost, long tail. |
| 9 | `antigravity cli gui`, `antigravity cli ui` | Commercial investigation | Google's own desktop app; launch coverage | A third landing page of the row 4 type, or a section. Early and thin, but demand is unproven and Google's first-party app answers it. |
| 10 | `claude code desktop alternative`, `codex app alternative`, `open source codex app alternative` | Commercial investigation | Paseo, Nimbalyst, AlternativeTo | On-site this needs a page that names first-party apps, which the map currently excludes. Off-site: a listing on AlternativeTo and inclusion in third-party comparisons. |
| 11 | `conductor alternative for windows`, `conductor alternative for linux` | Commercial investigation | AlternativeTo, vendor comparison pages | Off-site only under the current scope. Oxide has an official Windows build and Conductor is macOS only, so the fit is real. |
| 12 | `claude code worktrees`, `run multiple claude code agents`, `claude code parallel agents` | Informational | Anthropic docs, orchestration tools | A feature section on worktrees per Thread. Do not lead with it: every competitor already owns "parallel agents", and ADR-0010 says Oxide does not optimise for it. |
| 13 | `agentic engineering`, `agentic engineering tools` | Informational | Essays and courses | Use the term in copy and metadata. No dedicated page. |
| – | `claude code desktop app`, `codex desktop app`, `codex app` | Navigational to Anthropic and OpenAI | First-party docs and download pages | Do not target. Avoid titles that could read as the official app. |
| – | `oxide`, `oxide ai`, `oxide code`, `oxide download`, `oxide rust`, `oxide app` | Other entities | Chemistry, Oxide Computer, gaming, unrelated apps | Do not target in v1. |

## Recommendations

These are opinions drawn from the evidence above.

1. **Never let the name stand alone.** In the title tag, H1, meta description, Open Graph title and `llms.txt`, write "Oxide" next to "Claude Code" and "Codex" every time. The bare name resolves to chemistry and Oxide Computer for both search engines and LLMs.
2. **Use `getoxide` as the anchor brand term.** It is the only string with no owner. Show it on the site (GitHub link, install commands), and set the repo's homepage field, which is empty today. Note that `getoxide.com` belongs to someone else.
3. **Rewrite the map's example queries.** Replace "review AI agent code" with "review AI-generated code", and replace "desktop app for Codex" with "Codex GUI" as the targetable phrasing.
4. **Page inventory this implies**: home; download; one landing page per Provider phrasing (`/claude-code-gui`, `/codex-gui`, optionally Antigravity); a review feature page; one how-to guide on reviewing AI-generated code; a "What is Oxide?" FAQ in question form; `llms.txt`; changelog. The Provider landing pages need distinct content each, not one template with the name swapped.
5. **Lead with review, not with parallelism.** Result sets for the GUI queries are full of tools saying "run multiple agents in parallel". The review cluster (rows 6 to 8) is where Oxide's actual differentiators map to queries and where few GUI vendors compete. One caveat for positioning: Anthropic's own desktop app documents a diff view with line comments, so "review the diff and comment on lines" is not unique on its own. The Verification Dossier, Blind review by a second Provider, and per-Turn Restore across three Providers are the parts I found no first-party equivalent for in the page I read (the first 100k characters of the Claude Code Desktop reference; the remainder was not read).
6. **Disambiguate explicitly.** Add one line stating that Oxide is not affiliated with Oxide Computer Company, next to the existing trademark disclaimer. It helps LLMs separate the entities and belongs in the legal and trust pages listed as unspecified on the map.
7. **Level 3 is mostly an off-site problem.** Assistants answer "which GUI for Claude Code" from vendor listicles, GitHub READMEs, AlternativeTo and Reddit. With comparison pages and a blog out of scope, the site alone cannot put Oxide in those answers. The off-site plan needs: listings in awesome-claude-code style lists and AlternativeTo, a Show HN or Reddit launch post, and outreach to the authors of the existing comparison posts.
8. **Decision to take back to the map**: whether a small `/guides` or docs section is in scope. The strongest available page types (rows 6 and 7) are guides, and the map only rules out a blog.

## To verify manually

- [ ] Real Google and Bing SERPs, logged out, US English, for rows 1 to 7: positions 1 to 10, and whether an AI Overview, a Reddit block or a video carousel appears.
- [ ] Volumes for rows 4 to 7 in Google Keyword Planner or Search Console once the site is live.
- [ ] ChatGPT, Gemini, Perplexity, Copilot and Claude, each with search on and off, asked: "What is Oxide (coding)?", "What is the Oxide desktop app for Claude Code?", "Which GUI should I use for Claude Code?", "Which GUI should I use for Codex?", "How do I review code written by an AI coding agent?". Record the tools named and the sources cited, then repeat after launch.
- [ ] Reddit threads behind `gui for claude code reddit` and `best gui for claude code reddit`: only third-party snapshot mirrors were visible here.
- [ ] Google's first-party Antigravity pages, to confirm what its desktop app offers for review.
- [ ] Whether `oxide-code`, `oxi` and `Oxe` are growing. They were small on 2026-11-10 (`oxide-code` has 2 stars).

## Sources

First-party and primary:

- Oxide repo: `README.md`, `PRODUCT.md`, `llms.txt`, and GitHub API metadata for [getoxide/oxide](https://github.com/getoxide/oxide)
- Google autocomplete endpoint, queried 2026-11-10
- GitHub API for every star count, licence and push date quoted
- [Claude Code Desktop reference](https://code.claude.com/docs/en/desktop) (Anthropic)
- [ChatGPT desktop app docs](https://learn.chatgpt.com/docs/app), the redirect target of `developers.openai.com/codex/app` (OpenAI)
- [oxide.computer](https://oxide.computer/) and [RFD 576](https://rfd.shared.oxide.computer/rfd/0576) (Oxide Computer Company)
- [hakula139/oxide-code](https://github.com/hakula139/oxide-code)
- [Warp: Review AI-generated code](https://docs.warp.dev/guides/agent-workflows/how-to-review-ai-generated-code/)

Secondary, used only as evidence of who appears in result sets:

- [Nimbalyst: Best Claude Code GUI in 2026](https://nimbalyst.com/blog/best-claude-code-gui-tools-2026/)
- [crystl: the best UI for Claude Code, compared honestly](https://crystl.dev/compare/claude-code-guis/)
- [Real Python: review AI-generated code](https://realpython.com/review-ai-generated-code/)
- [It's FOSS: Claudia](https://itsfoss.com/news/claudia/)
- [AlternativeTo: Conductor alternatives](https://alternativeto.net/software/conductor)
- [JourneyApps OXIDE overview](https://docs.journeyapps.com/reference/oxide/getting-started-with-oxide/overview)
- [Flathub: dev.invrs.oxide](https://flathub.org/el/apps/dev.invrs.oxide)
