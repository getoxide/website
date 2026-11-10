# Off-site surfaces that feed search and LLM answers for developer tools

Research for ticket #5 of the map "Oxide website spec" (#1). Checked on 2026-11-10.

Question: for an open-source developer desktop app, which off-site surfaces feed search rankings and LLM answers, what does each require, and what evidence exists for its effect? Output: a ranked list of channels with entry requirements and effort.

How to read this file:

- **Evidence** is a fact read from the source that owns it, with a link.
- **Inference** is my reasoning from that evidence. It is labelled as such.
- **Not verified** lists what I could not confirm. See the last section.

## Oxide's starting position (measured)

Read from the GitHub API for `getoxide/oxide` on 2026-11-10:

| Fact | Value |
| --- | --- |
| Stars / forks / watchers | 1 / 0 / 0 |
| Repository created | 2026-10-21 (20 days old) |
| Published releases | 0 |
| Topics | 8 of 20 allowed: `agentic-engineering`, `ai`, `ai-coding-agent`, `coding-agents`, `desktop-app`, `developer-tools`, `rust`, `tauri` |
| Homepage field | empty |

These numbers decide which channels are open today. Most gates below are stated in stars, repository age or "is it released".

## How LLM answers pick sources (evidence)

There are two paths: a live web search at answer time, and training data. Only the first can be influenced in weeks.

- **Google AI Overviews and AI Mode** use the normal Search index. Google states: "There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary", and a page "must be indexed and eligible to be shown in Google Search with a snippet". Both features may use "query fan-out", that is "issuing multiple related searches across subtopics and data sources". Google also says no "new machine readable files, AI text files, or markup" are needed. Source: [Google Search Central, AI features](https://developers.google.com/search/docs/appearance/ai-features).
- **ChatGPT search** shows only sites its search crawler may read: "Sites that are opted out of OAI-SearchBot will not be shown in ChatGPT search answers." `GPTBot` is the separate training crawler. Source: [OpenAI, bots](https://developers.openai.com/api/docs/bots).
- **Claude** has three bots: `ClaudeBot` (training), `Claude-User` (fetches a page when a user asks), `Claude-SearchBot` (search index). Source: [Anthropic help centre](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler).
- **Citations concentrate on a few platforms, and those platforms are easy to post on.** A Fudan-authored arXiv paper (Liu et al., submitted 2026-10-08) analysed 17,211 citation instances on 10 AI-search platforms from 6,356 domains. The top 20 domains took 20.5 to 70.8% of each platform's citations. 15 of 22 publishing platforms behind cited domains had low or medium barriers. 8 of 10 platforms cited a fabricated concept within seven days of ordinary posts. "One article on a high-preference platform had greater citation impact than more than 20 matched posts on low-preference platforms." Source: [arXiv:2610.11932](https://arxiv.org/abs/2610.11932) (abstract only read).
- **Which platforms those are** (vendor data, lower trust): Peec's analysis of 30 million cited sources (US, March 2026, five engines) ranks Reddit 1, YouTube 2, LinkedIn 3, Wikipedia 4, then Forbes, G2, Yelp, Facebook, Medium, TechRadar. Per engine: ChatGPT leads with Wikipedia and Reddit; Perplexity with Reddit and YouTube; Google AI Mode and AI Overviews with YouTube and Reddit. GitHub is not in any top five. Sources: [Peec, most cited domains](https://docs.peec.ai/research/most-cited-domains-in-ai-search.md), [by engine](https://docs.peec.ai/research/most-cited-domains-by-engine.md).
- **Content shape matters too.** The Princeton GEO paper reports that its methods can "boost visibility by up to 40%" in generative engine responses, with effect varying by domain. Source: [arXiv:2311.09735](https://arxiv.org/abs/2311.09735) (abstract only read).

### What the category query returns today (observed)

One web search for "best GUI for Claude Code desktop app" on 2026-11-10 returned, in order of prominence:

- Listicles on dev.to and Medium ("Best Claude Code GUI in 2026: 5 tools compared").
- Vendor comparison pages on the vendors' own sites (crystl.dev "the best UI for Claude Code, compared honestly"; several Nimbalyst "best ... GUI tools 2026" posts).
- `awesome.ecosyste.ms` project pages, which are generated from GitHub awesome lists.
- A `wingetly.io` tag page for `claude-code`, generated from winget manifests.

Inference: for this category the answer is built from listicles, vendor comparison pages and pages derived from awesome lists and package managers. A tool that is in none of them is not in the answer. This is one search on one engine, so it shows the kind of source, not a ranking.

## Ranked channels

Ranking is my recommendation. It weighs evidence of effect, whether Oxide can enter now, and effort. Effort: S = under an hour, M = a few hours, L = days or ongoing.

| # | Channel | Open to Oxide today? | Effort | Evidence of effect |
| --- | --- | --- | --- | --- |
| 1 | GitHub repo metadata, topics, README, releases | Yes | S | Direct: it is the page every other channel links to |
| 2 | Niche awesome lists for coding-agent GUIs | Partly (see gates) | S each | Observed: list-derived pages rank for the category query |
| 3 | Show HN | After first release | M | Rules verified; effect on LLM answers not measured |
| 4 | Reddit (topic subreddits) | After first release | M, ongoing | Strongest citation evidence (vendor studies) |
| 5 | Demo video on YouTube | After first release | M | Top cited domain on Google AI surfaces (vendor studies) |
| 6 | Third-party comparison articles and listicles | Cannot be forced | L | Observed: they dominate the category query |
| 7 | winget | After first release | M | Indirect: generates indexable pages; no notability gate |
| 8 | Homebrew: own tap now, official cask later | Tap yes; official cask no | S tap, M cask | Indirect; comparable tools all have casks |
| 9 | Directories: AlternativeTo, Product Hunt | After first release | M | Weak; nofollow links, editorial gates |
| 10 | Wikidata | Borderline | S | Weak for an unknown product |
| 11 | Wikipedia | No | n/a | Strong if present, but not eligible |

### 1. GitHub repository surface

- **Requirements (evidence):** none. Up to 20 topics, lowercase letters, numbers and hyphens, 50 characters or less. Topics let people "explore repositories in a particular subject area", and each topic has a page listing its repositories. Source: [GitHub docs, topics](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics).
- **Gaps found:** the homepage field is empty, 12 topic slots are unused, and no topic names a Provider (`claude-code`, `codex`, `codex-cli`) or the category words people search (`gui`, `code-review`, `git-worktree`).
- **Inference:** every list, directory and package manager below links to the repository, and several read its stars, licence and last commit automatically. Fix this first. The homepage field is also the cleanest link from GitHub to the site.
- **Not measured:** how much topics affect Google or LLM answers. GitHub documents discovery inside GitHub only.

### 2. Awesome lists and curated directories for coding-agent GUIs

Rules read from each list's README or CONTRIBUTING file on 2026-11-10. Stars from the GitHub API.

| List | Stars | Section that fits Oxide | Entry rule | Oxide today |
| --- | --- | --- | --- | --- |
| [andyrewlee/awesome-agent-orchestrators](https://github.com/andyrewlee/awesome-agent-orchestrators) (web: agent-orchestrators.com) | 2.4k | "Parallel Coding Agents: Desktop & Web" | Open or source-available with a GitHub repo; "at least 5 GitHub stars and signs of life"; one entry per PR, alphabetical, must pass awesome-lint | Blocked: needs 5 stars |
| [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | 57.7k | "Alternative Clients" | Web issue form only ("Do not open a PR"), not via `gh`; "resource recommendations must be created by human beings"; repo "at least 14 days old" with commits after day one, or 100 stars; one line, descriptive, not promotional, no emojis | Age gate passed; a human must file it |
| [jqueryscript/awesome-claude-code](https://github.com/jqueryscript/awesome-claude-code) | 546 | "Clients & GUIs" | Contribution guidelines say "Under Construction"; entries are sorted with star counts | Unclear; open a PR and see |
| [RoggeOhta/awesome-codex-cli](https://github.com/RoggeOhta/awesome-codex-cli) | 568 | "GUI & Desktop Apps" | Issue or PR; directly related to Codex CLI; actively maintained; rejects "Self-promotion without substance — your project needs real users or a clear unique value" | Open, at maintainer's discretion |
| [rohitg00/awesome-claude-code-toolkit](https://github.com/rohitg00/awesome-claude-code-toolkit) | 2.8k | "Companion Apps & GUIs" | Fork and PR; update the README table | Open |
| [jaywcjlove/awesome-mac](https://github.com/jaywcjlove/awesome-mac) | 118k | "AI Tools" (already lists Orca, Coincide, Threadlines, CC-Switch) | One PR per app, alphabetical, one sentence, synced across the four language READMEs; AI-assisted PRs are welcome | Open once a macOS build can be downloaded |
| [serhii-londar/open-source-mac-os-apps](https://github.com/serhii-londar/open-source-mac-os-apps) | 51k | "Development" | PR that edits `applications.json`, not the README; needs licence, recent commit, clear English README | Open |
| [rust-unofficial/awesome-rust](https://github.com/rust-unofficial/awesome-rust) | 60k | Applications | "Accepted: `(stars > 50 \| downloads > 2000)`" | Blocked: needs 50 stars |
| [tauri-apps/awesome-tauri](https://github.com/tauri-apps/awesome-tauri) | 8.2k | none | "Application submissions are not accepted anymore!" | Closed |
| [bradAGI/awesome-cli-coding-agents](https://github.com/bradAGI/awesome-cli-coding-agents) | 1.5k | "Session managers & parallel runners" | "Must have a CLI or terminal interface (IDE-only tools don't qualify)" | Doubtful: Oxide is a GUI |

- **Evidence of effect:** `awesome.ecosyste.ms` republishes these lists as one page per project and per list, and those pages appeared in both category searches I ran. The lists are also plain Markdown on a domain every crawler reads.
- **Inference:** this is the cheapest channel with an observed link to the category query. The descriptions in these lists become the sentence an LLM repeats, so the one-line description must be the same everywhere and must say that Oxide drives Claude Code, Codex and Antigravity CLI, not that it writes code.
- **Caution:** a PR opened by an agent breaks the awesome-claude-code rule. That one has to be filed by a person.

### 3. Hacker News (Show HN)

- **Requirements (evidence):** "Show HN is for something you've made that other people can play with." Off topic: "blog posts, sign-up pages, newsletters, lists, and other reading material", and landing pages. "Please make it easy for users to try your thing out, ideally without barriers such as signups or emails." If it is not ready, "please don't do a Show HN". "Please don't ask friends to upvote or comment." Sources: [Show HN rules](https://news.ycombinator.com/showhn.html), [HN guidelines](https://news.ycombinator.com/newsguidelines.html) ("Don't solicit upvotes, comments, or submissions").
- **Oxide:** not eligible until a build can be downloaded. That matches the map's launch rule (site and first release together).
- **Inference:** one shot, at launch, posted by the author, linking to the repository or the site with a visible download. No evidence found that measures HN's effect on LLM answers; its value is the stars and third-party write-ups that follow, which open channels 2 and 8.

### 4. Reddit

- **Evidence of effect:** Reddit is the most cited domain overall in Peec's 30M-source study and in the top five for every engine. A second tracker (LLM Pulse) disagrees on the numbers, so read this as "Reddit is consistently near the top", not as a share.
- **Requirements:** not verified. Reddit's policy pages refused automated access. Each subreddit has its own self-promotion rule; read the sidebar of r/ClaudeAI, r/ClaudeCode, r/codex, r/rust and r/tauri before posting.
- **Inference:** posts by the author count less than threads where other people name the tool. The useful work is answering existing "which GUI for Claude Code" threads honestly after launch, not a launch post in five subreddits.

### 5. YouTube

- **Evidence of effect:** YouTube is the most cited domain for Google AI Mode and AI Overviews and second overall in the Peec study.
- **Requirements:** none.
- **Inference:** one short real capture of the product, titled with the category words ("GUI for Claude Code and Codex"), with a full description and a link to the site. The map already requires real product captures, so the footage exists once the site visuals are made.

### 6. Third-party comparison articles and listicles

- **Evidence of effect:** they are what the category query returns (see the observed search above). The Fudan paper found one article on a high-preference platform outweighs more than 20 posts on low-preference ones.
- **Requirements:** none for dev.to or Medium. Being included in someone else's listicle cannot be requested by rule; it follows from being findable in channels 1 and 2.
- **Inference:** competitors publish these pages on their own sites. The map puts "Oxide vs X" pages out of scope, so the off-site version is the only one available: an honest first-person article on dev.to after launch. Mark it clearly as written by the author.

### 7. winget (Windows)

- **Requirements (evidence):** a pull request with a manifest to `microsoft/winget-pkgs`. "Installers must be MSIX, MSI, APPX, MSIXBundle, APPXBundle, or .exe application installers." "The installer supports non-interactive modes." "The installer comes directly from the publisher's website", over HTTPS, with a matching SHA-256. The installer is scanned by several antivirus engines, then "manually reviewed by a moderator". "Microsoft reserves the right to refuse a submission for any reason." No star or popularity threshold appears in the policies. Sources: [submission guide](https://learn.microsoft.com/en-us/windows/package-manager/package/repository), [repository policies](https://learn.microsoft.com/en-us/windows/package-manager/package/windows-package-manager-policies), [winget-pkgs README](https://github.com/microsoft/winget-pkgs/blob/master/README.md).
- **Oxide:** eligible on the first public release. The Windows bundle is an NSIS `.exe` (from `docs/devops.md` in the Oxide repo), which is an accepted type. It must install silently.
- **Evidence of effect:** indirect. Third-party sites generate a page per manifest; one (`wingetly.io`) appeared in the category search.

### 8. Homebrew (macOS)

- **Requirements for the official cask repository (evidence):**
  - Notability: "at least 30 forks, 30 watchers or 75 stars". For "a self-submission by the repository owner": "at least 90 forks, 90 watchers or 225 stars".
  - Age: "A code repository less than 30 days old is normally not eligible."
  - Gatekeeper: a cask "must not require System Integrity Protection or Gatekeeper to be disabled or bypassed". Homebrew 5.0.0 (2025-11-12): "Casks without codesigning are deprecated" and "We will disable all Homebrew/homebrew-cask casks that fail Gatekeeper checks in September 2026."
  - Sources: [Package Acceptance Policy](https://docs.brew.sh/Package-Acceptance-Policy), [Acceptable Casks](https://docs.brew.sh/Acceptable-Casks), [Homebrew 5.0.0](https://brew.sh/2025/11/12/homebrew-5.0.0/).
- **Oxide:** not eligible (1 star, 20 days old, no release). The bar is 225 stars if a maintainer submits it, 75 if an unrelated user does.
- **Open to Oxide now:** "Software that does not meet the official criteria can generally be maintained in a third-party tap." A tap is a GitHub repository named `homebrew-<something>` with a `Casks` directory. "Non-official taps require explicit trust by default." Source: [taps guide](https://docs.brew.sh/How-to-Create-and-Maintain-a-Tap).
- **Evidence of effect:** indirect. Comparable tools have official casks: `opcode`, `conductor`, `cc-switch`, `superset`, `nimbalyst`, `t3-code` all resolve on `formulae.brew.sh` with coding-agent descriptions. Each cask has a public page with a one-line description.
- **Inference:** ship an own tap with the first release so the site can show one install command, and submit the official cask when the star bar is met.

### 9. Directories: AlternativeTo and Product Hunt

- **AlternativeTo (evidence):** any registered user with a verified email can suggest an app. "Coming Soon, closed or private beta, invite-only, and Early Access apps are not accepted"; open betas probably are. "Thin wrappers around AI models" are declined. The queue holds several thousand apps with no date; paid priority review exists and does not guarantee approval. Links are generally nofollow. Source: [AlternativeTo FAQ](https://alternativeto.net/faq/).
- **Product Hunt (evidence):** a personal account is required ("Company accounts can't post products"). Featuring is "an editorial decision, not a checklist"; not featured: products people cannot try, and content about a product. "Never ask for upvotes." Sources: [how to post](https://help.producthunt.com/en/articles/479557-how-to-post-a-product), [what gets featured](https://help.producthunt.com/en/articles/17734341-2-what-kind-of-products-get-featured), [promotion rules](https://help.producthunt.com/en/articles/17734384-5-how-to-promote-your-launch-and-what-to-avoid).
- **Oxide:** both need a released, tryable build. On AlternativeTo the listing should be filed as an alternative to the tools already there, since that is the page people and crawlers land on.
- **Evidence of effect:** weak. Neither domain appears in the citation studies read, and neither appeared in the category search.

### 10. Wikidata

- **Requirements (evidence):** an item needs one of: a sitelink to a Wikimedia page; to refer to "an instance of a clearly identifiable conceptual or material entity" (the criterion continues with a sourcing requirement); or a structural need. Source: [Wikidata:Notability](https://www.wikidata.org/wiki/Wikidata:Notability).
- **Oxide:** borderline. Criterion 2 can be argued from the repository and releases, but the references would all be first-party.
- **Inference:** low value until independent sources exist. If done, do it after launch, with the repository, licence, website and release as statements, and expect that it may be deleted.

### 11. Wikipedia

- **Requirements (evidence):** the general notability guideline requires "significant coverage" that "addresses the topic directly and in detail", in sources with "editorial integrity", "independent of the subject", which "excludes works produced by the article's subject or someone affiliated with it". The software essay adds that self-published material, product listings, passing mentions and "inclusion in lists of similar software" do not establish notability. An author has a conflict of interest: "you should put new articles through the Articles for Creation (AfC) process" and "COI editors are strongly discouraged from editing affected articles directly." Sources: [WP:Notability](https://en.wikipedia.org/wiki/Wikipedia:Notability), [WP:Notability (software)](https://en.wikipedia.org/wiki/Wikipedia:Notability_(software)) (an essay, not policy), [WP:Conflict of interest](https://en.wikipedia.org/wiki/Wikipedia:Conflict_of_interest).
- **Oxide:** not eligible. There is no independent coverage.
- **Reference point:** title lookups on 2026-11-10 found articles for Claude Code, Cursor and Zed, and none under the obvious titles for Opcode, Vibe Kanban, OpenCode or Aider. Tools far larger than Oxide in this category do not have one.
- **Recommendation:** do not attempt. A deleted self-written article is worse than none.

## Recommendation

Three waves, tied to the gates above.

1. **Before launch (open now, under a day in total).** Fix the GitHub repository surface: homepage field, topics that name the Providers and the category, and one canonical one-line description reused everywhere. Prepare, but do not send, the list entries and package manifests.
2. **Launch day and the week after (needs the first downloadable release).** Show HN by the author. winget manifest. Own Homebrew tap. A person files the awesome-claude-code issue form. PRs to awesome-claude-code-toolkit, awesome-codex-cli, jqueryscript/awesome-claude-code, awesome-mac and open-source-mac-os-apps. One demo video on YouTube. AlternativeTo suggestion.
3. **When the star gates are met.** 5 stars: awesome-agent-orchestrators, the list closest to Oxide's category. 50 stars: awesome-rust. 75 stars (third-party submitter) or 225 (self-submitted), and 30 days of age: official Homebrew cask. After real use: Reddit answers, a first-person dev.to article, Product Hunt.

Skip: Wikipedia, awesome-tauri (closed to apps), awesome-cli-coding-agents (needs a CLI).

What this means for the site spec:

- The site must carry the same one-line description and the same category words as the off-site entries, because the off-site entries are what LLMs repeat.
- The download page should show `winget install` and `brew install` commands only once those exist; the tap command is available from the first release.
- A category page on the site that answers "GUI for Claude Code / Codex" is the on-site counterpart of the listicles that own the query. That decision belongs to the keyword and page-inventory tickets, not this one.

## Not verified

- **No study isolates developer tools.** The citation rankings are for all topics. GitHub's share of LLM citations is unknown; one figure found (12%) came from an undocumented personal test and is not used here.
- **Peec and LLM Pulse are vendors of AI-visibility tools** and disagree with each other on shares. Only the direction is used.
- **Both arXiv papers were read as abstracts only.**
- **Reddit's rules** could not be fetched; subreddit rules were not read.
- **Product Hunt:** the conditions for a new account to get posting access were not found.
- **Wikidata criterion 2** was read truncated; the exact sourcing wording was not captured.
- **macOS notarization:** Oxide's `docs/devops.md` says release builds are "signed", but I could not confirm from it that the macOS build is signed with a Developer ID and notarized by Apple. The official Homebrew cask depends on passing Gatekeeper.
- **Wikipedia absence** was checked by exact title only; an article under another title would be missed.
- **Cask identity:** the six comparable casks were matched by token and description, not by installing them.
- **The category search** was one query on one search backend on one day.
- **awesome-claude-code's 14-day rule** counts from the first commit on the default branch; I used the repository creation date as a stand-in.
