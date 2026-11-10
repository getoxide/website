# On-site signals that make search engines and LLMs cite a developer tool

Research for issue #4 of the Oxide website map. Sources fetched on 2026-11-10.

Scope: what on the site itself affects being indexed, ranked and cited by
Google, Bing and LLM assistants; what living on `oxide.cavallinilorenzo.com`
costs; how to register the site; how to keep a later domain move cheap.
Off-site signals (links, mentions, directories) are out of scope here.

Each claim is tagged:

- **[E]** evidence: stated by the party that owns the system, or measured in a documented study.
- **[O]** opinion: my inference from the evidence. Reasonable, not proven.
- **[F]** folklore: widely repeated, and either contradicted or unsupported by a primary source.

## Short answer

1. There is no AI-specific on-site trick with first-party support. Google says
   its AI features run on the normal Search index and ranking, and need no
   special file, markup or rewriting. Being crawlable, indexed, snippet-eligible
   and rendered as text in the HTML is the whole technical gate.
2. The one robots decision that matters is not blocking the *search* and
   *user-fetch* agents of each assistant (OAI-SearchBot, Claude-SearchBot,
   PerplexityBot, Bingbot, Googlebot). Blocking them removes the site from those
   answers by the vendors' own statements.
3. Structured data helps machines identify the entity and sets the site name;
   no first party says it improves ranking or AI citation. Oxide cannot earn the
   SoftwareApplication rich result without real ratings, and the FAQ rich result
   no longer exists on Google.
4. `llms.txt` is cheap and harmless, ignored by Google, and almost never
   fetched by AI search crawlers. Coding agents are the visible exception.
5. The subdomain has one concrete, documented cost: the site name. Without
   `WebSite` markup on the Oxide home page, Google may label the site with the
   parent domain's name. Everything else said about subdomain "authority" is
   unquantified.

## 1. How each system finds and uses a page

| System | Retrieval path | What gates inclusion | Source |
|---|---|---|---|
| Google AI Overviews / AI Mode | Core Search ranking over the Search index, with query fan-out | Page indexed and eligible to show with a snippet | [E] Google |
| Gemini app grounding | Search index; `Google-Extended` token controls training and grounding use | Not disallowing `Google-Extended` | [E] Google |
| Copilot / Bing AI summaries | Bing index | Being in Bing's index | [E] Microsoft |
| ChatGPT search | `OAI-SearchBot` index; `ChatGPT-User` for live fetches | Not disallowing `OAI-SearchBot` | [E] OpenAI |
| Claude | `Claude-SearchBot` index; `Claude-User` for live fetches | Not disallowing those agents | [E] Anthropic |
| Perplexity | `PerplexityBot` index; `Perplexity-User` for live fetches | Not disallowing `PerplexityBot` | [E] Perplexity |

Key first-party statements:

- [E] Google: "There are no additional requirements to appear in AI Overviews
  or AI Mode, nor other special optimizations necessary." A page "must be
  indexed and eligible to be shown in Google Search with a snippet."
  ([AI features and your website](https://developers.google.com/search/docs/appearance/ai-features))
- [E] Google's generative AI features use retrieval-augmented generation over
  the Search index and "query fan-out": the model issues several related
  queries and cites pages retrieved for them.
  ([AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), added 2026-05-15)
- [E] The same guide lists things to ignore for Google: `llms.txt` and special
  markup ("Google Search itself doesn't use them"), chunking content into small
  pieces, rewriting for AI, seeking inauthentic mentions, and over-focusing on
  structured data ("Structured data isn't required for generative AI search,
  and there's no special schema.org markup you need to add").
- [E] Microsoft: "Traditional SEO is still essential" as the baseline for AI
  answers; assistants parse pages into smaller pieces that are ranked and
  assembled.
  ([Microsoft Advertising blog, Krishna Madhavan, 2025-10-08](https://about.ads.microsoft.com/en/blog/post/october-2025/optimizing-your-content-for-inclusion-in-ai-search-answers))

[O] Consequence for the map's success criteria: levels 1 and 2 (brand and
category queries) and level 3 (LLM answers) are mostly the same work on-site.
An assistant that searches the web cites what ranks for the fan-out queries.

## 2. AI crawler user agents and robots policy

All entries below are from the vendors' own crawler documentation.

| Vendor | Token | Purpose | Obeys robots.txt | Effect of blocking |
|---|---|---|---|---|
| OpenAI | `OAI-SearchBot` | ChatGPT search index | Yes | "will not be shown in ChatGPT search answers, though can still appear as navigational links" |
| OpenAI | `GPTBot` | Training data | Yes | Content not used for training |
| OpenAI | `ChatGPT-User` | User-initiated fetch | "robots.txt rules may not apply" | Not a search-inclusion control |
| OpenAI | `OAI-AdsBot` | Ad landing page checks | Not stated | Irrelevant here |
| Anthropic | `Claude-SearchBot` | Search index | Yes | Not indexed; "may reduce visibility" in user search results |
| Anthropic | `Claude-User` | User-initiated fetch | Yes | Claude cannot retrieve the page for a user query |
| Anthropic | `ClaudeBot` | Training data | Yes | Future content excluded from training |
| Perplexity | `PerplexityBot` | Search index, not training | Yes | Not surfaced in Perplexity results |
| Perplexity | `Perplexity-User` | User-initiated fetch | "generally ignores robots.txt rules" | None via robots.txt |
| Google | `Googlebot` | Search, AI Overviews, AI Mode | Yes | Removed from Search and its AI features |
| Google | `Google-Extended` | Gemini training and grounding; robots token only, no own user agent | Yes | No effect on Search inclusion or ranking |
| Microsoft | `Bingbot` | Bing index, Copilot | Yes | Removed from Bing and Copilot |

Sources:
[OpenAI bots](https://developers.openai.com/api/docs/bots),
[Anthropic crawler article](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler),
[Perplexity bots](https://docs.perplexity.ai/guides/bots),
[Google common crawlers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers).

Other facts:

- [E] OpenAI and Perplexity both say a robots.txt change takes about 24 hours
  to take effect in their systems.
- [E] Anthropic honours the non-standard `Crawl-delay`. Robots rules must be
  repeated per subdomain, so `oxide.cavallinilorenzo.com/robots.txt` is its own
  file and inherits nothing from the parent domain.
- [E] Vercel's "AI bots" managed ruleset and "Bot protection" ruleset are both
  inactive by default on all plans; bot protection, if turned on, exempts
  verified bots.
  ([Vercel bot management](https://vercel.com/docs/bot-management))

[O] Recommendation: allow everything, including the training crawlers
(`GPTBot`, `ClaudeBot`, `Google-Extended`). Success level 3 includes the
question "what is Oxide", which an assistant may answer without searching, and
the only on-site lever on that is letting training crawlers read accurate
copy. No vendor states that allowing training crawlers improves answers about
a product; this is inference. A plain `User-agent: * / Allow: /` plus a
`Sitemap:` line is enough; naming each bot adds nothing.

## 3. Structured data

General:

- [E] Google uses structured data to understand a page and to enable rich
  results, and recommends JSON-LD. Its documentation makes no ranking claim.
  ([Intro to structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data))
- [E] Markup must match the visible text on the page.
  ([AI features](https://developers.google.com/search/docs/appearance/ai-features))
- [E] Microsoft recommends JSON-LD schema so machines can label content, with
  no measured effect given.
- [F] "Schema markup makes LLMs cite you." No first party says so, and Google
  says the opposite for its own AI features. I found no documented study that
  isolates the effect.

### SoftwareApplication

- [E] Google's software app rich result requires `name`, `offers.price` and
  **one of `aggregateRating` or `review`**. For a free app, "set `offers.price`
  to `0`". Recommended: `applicationCategory` (the list includes
  `DeveloperApplication`) and `operatingSystem`.
  ([Software app structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app))
- [E] schema.org offers further properties that fit Oxide: `downloadUrl`,
  `softwareVersion`, `releaseNotes`, `screenshot`, `softwareRequirements`,
  `featureList`.
  ([schema.org/SoftwareApplication](https://schema.org/SoftwareApplication))
- [O] Oxide has no genuine ratings or reviews, so it is **not eligible** for
  the rich result. Do not invent ratings: that breaks Google's structured data
  policies and the map's honesty rule. Still ship the JSON-LD, without rating
  fields, as an entity description. Expect the Rich Results Test to flag the
  missing rating; that is correct and acceptable.

### FAQPage

- [E] Google deprecated the FAQ rich result: "This feature will no longer
  appear in Google Search starting May 7, 2026", and removed its documentation
  on 2026-06-15.
  ([Search documentation updates](https://developers.google.com/search/updates))
- [E] Microsoft still recommends visible question-and-answer content and FAQ
  sections for AI answers (see section 5).
- [O] Write the FAQ as visible content. `FAQPage` JSON-LD has no remaining
  Google feature behind it; adding it is harmless and optional. Do not count it
  as a deliverable.

### Organization and WebSite

- [E] Organization markup helps Google "disambiguate your organization in
  search results" and choose a logo. No property is required; Google recommends
  placing it on the home page. `sameAs` points to profiles on other sites.
  ([Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization))
- [E] Site names: "`WebSite` structured data is most important, if you want to
  specify a preference." Site names are supported "for domain-level and
  subdomain-level sites". If a subdomain's home page has no structured data,
  "the domain-level site name may be used for the subdomain as a fallback."
  Generic names are unlikely to be selected; `alternateName` lists fallbacks in
  order of preference. Google also reads `og:site_name`, `<title>` and
  headings of the home page.
  ([Site names](https://developers.google.com/search/docs/appearance/site-names))
- [O] This is the most important structured data on the site. Without it,
  results for `oxide.cavallinilorenzo.com` may be labelled with the personal
  site's name. "Oxide" alone is generic and collides with other products, so
  Google may reject it. Declare `name: "Oxide"` and ordered `alternateName`
  values that are distinctive (the map's positioning ticket should choose them;
  candidates in the spirit of the brand queries are "Oxide app" and
  "getoxide"), and keep `og:site_name`, the home `<title>` and the H1
  consistent with it.

## 4. llms.txt

- [E] It is a proposal by Jeremy Howard (2024-09-03), not a standard: one
  Markdown file with an H1, a blockquote summary, and H2 link lists, with an
  "Optional" section. It also proposes a Markdown twin of each page at
  `page.md`. The author expected it to be used at inference time, not for
  training. ([llmstxt.org](https://llmstxt.org/))
- [E] Google: these files "aren't needed for Google Search (and won't
  negatively or positively impact your visibility or rankings)".
  ([Search documentation updates, 2026-06-15](https://developers.google.com/search/updates))
- [E] Ahrefs log study, 137,210 domains, May 2026: 28% publish a valid
  `llms.txt` (the authors call this an upper bound, since their customers skew
  technical); 97% of those files got zero requests in the month. Of the
  requests that did occur, AI retrieval bots were 1.1%, AI assistants 2.5%, AI
  training crawlers 5.3%, AI agents and agentic infrastructure 10.5%.
  `Claude-Code` ranked above every retrieval bot and assistant. No AI bot
  requested an `llms.txt` that did not exist.
  ([Ahrefs, 2026-06-15](https://ahrefs.com/blog/llmstxt-study/))
- [E] None of the OpenAI, Anthropic or Perplexity crawler pages read for this
  note mentions `llms.txt`.
- [F] "llms.txt gets you cited in ChatGPT / AI Overviews." Contradicted by
  Google for its products and unsupported by the log data for the others.

[O] Publish it anyway. The Oxide repo already has an `llms.txt`; a site
version generated at build time costs minutes. Its plausible readers are
coding agents asked "what is Oxide" or "set up Oxide", which is exactly the
product's audience. Point its links at site pages rather than only at GitHub.
Treat it as a convenience for agents, not as a search or citation lever, and
do not spend effort on per-page Markdown twins in v1.

## 5. Content shapes that get extracted

First-party guidance (Microsoft):

- [E] "Clear headings, tables, and FAQ sections help surface key
  information"; examples, data and sources "help build trust when content is
  reused in AI-generated answers"; keep content fresh.
  ([Bing Webmaster blog, 2026-02-10](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview))
- [E] Titles, H1 and description should agree. Headings "define clear content
  slices". "Direct questions with clear answers mirror the way people search".
  Lists and tables "break complex details into clean, reusable segments".
  Give one- to two-sentence answers that stand alone when lifted out.
- [E] Avoid: "long walls of text"; "Don't hide important answers in tabs or
  expandable menus"; "Avoid relying on PDFs for core information"; "Avoid
  putting key information only in images".
  ([Microsoft Advertising blog, 2025-10-08](https://about.ads.microsoft.com/en/blog/post/october-2025/optimizing-your-content-for-inclusion-in-ai-search-answers))

First-party guidance (Google), partly in tension with the above:

- [E] No need to chunk content or rewrite it for AI; organise it with
  paragraphs and headings for readers; offer non-commodity content with a
  first-hand point of view; no ideal page length.

Measured (academic):

- [E] GEO paper (Aggarwal et al., KDD 2024): on a benchmark with a GPT-3.5
  based engine, adding quotations, statistics and source citations to a page
  raised its visibility in generated answers by roughly 30 to 40% on the
  word-count metric; fluency edits helped by about 28%; keyword stuffing
  reduced it (about -9%). On Perplexity (200 queries) quotations gave about
  +22%. Pages ranked fifth gained most (up to +115% for citing sources) while
  top-ranked pages lost share.
  ([arXiv 2311.09735](https://arxiv.org/abs/2311.09735))
- Limits of that study: two engines, 2023-era models, synthetic edits, search
  ranking not modelled. It shows direction, not a number to expect today.

[O] What this means for Oxide's pages:

- Put a one-sentence definition of Oxide near the top of the home page, in
  plain text, true on its own ("Oxide is a free, open-source desktop app
  that..."), consistent with the repo's `llms.txt` and README. Keep the honesty
  line in it: it drives Claude Code, Codex and Antigravity CLI and does not
  write code.
- State concrete, checkable facts: licence, platforms, supported Providers,
  version, no telemetry. The GEO result favours specific facts over adjectives.
- A requirements or Provider-support table and a visible FAQ whose questions
  match the category queries ("Is Oxide a GUI for Claude Code?").
- Key content must not exist only inside screenshots, video, or collapsed
  UI. Product captures need real alt text and a text caption. This matters for
  the motion ticket: text revealed by animation must already be in the HTML.

## 6. Static rendering

- [E] Google renders JavaScript in a deferred queue and still says server-side
  or pre-rendering "makes your website faster for users and crawlers" and that
  "not all bots can run JavaScript".
  ([JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics))
- [E] Google AI features guidance: keep important content available in text
  form.
- Not verified: whether OpenAI, Anthropic and Perplexity crawlers execute
  JavaScript. Their documentation is silent. The common claim that they do not
  comes from third-party log analyses that I did not audit.

[O] The inherited fully static stack already satisfies this. The rule to
carry into the build spec: every sentence that should be citable is present in
the initial HTML response, including text that animates in and FAQ answers. A
test can assert this with a no-JavaScript fetch of each page.

## 7. Sitemaps, canonical, discovery

- [E] Google ignores `<priority>` and `<changefreq>`, and uses `<lastmod>`
  only if it is "consistently and verifiably" accurate. Submission is "merely
  a hint". Submit through Search Console or a `Sitemap:` line in robots.txt;
  use absolute URLs.
  ([Build a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap))
- [E] Canonical signals by strength: redirect, then `rel="canonical"`, then
  sitemap inclusion. Use absolute URLs and a self-referential canonical on each
  page; do not use robots.txt for canonicalisation.
  ([Consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls))
- [E] IndexNow notifies Bing, Yandex, Seznam, Naver, Yep, Internet Archive and
  Amazonbot of changed URLs; it needs a key file on the host and a POST per
  deploy. It does not guarantee indexing. Google does not take part.
  ([IndexNow](https://www.bing.com/indexnow/getstarted),
  [participants](https://www.indexnow.org/searchengines.json))
- [E] "The vast majority of the new pages Google finds every day are through
  links."
  ([SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide))

[O] For a site of a handful of pages the sitemap is hygiene, not a lever.
Generate it at build time with a real `lastmod` (from git or the changelog),
omit `priority` and `changefreq`. Make sure Vercel preview and `*.vercel.app`
URLs carry the production canonical or `noindex`. IndexNow is worth a small
post-deploy step because Copilot depends on Bing's index and the changelog
will change often.

## 8. The subdomain

What is documented:

- [E] Google: on subdomains versus subdirectories, "do whatever makes sense
  for your business." Keywords in a domain name "have hardly any effect".
  ([SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide))
- [E] Site names work per subdomain, with the fallback to the parent domain's
  name described in section 3.
- [E] robots.txt, sitemap and Search Console verification are per host.

What is not documented:

- [F] "A subdomain inherits (or fails to inherit) the parent domain's
  authority." Google publishes no such mechanism in either direction. I found
  no primary source that quantifies a ranking cost or benefit.
- Not verified: how LLMs resolve the entity "Oxide" from a host name. No
  vendor documents it.

[O] Realistic costs, in order:

1. Site name and attribution. The host name reads as a person's project, and
   the parent site is about a person. Mitigated by `WebSite` + `Organization`
   markup, consistent naming, and `sameAs` to the GitHub organisation.
2. Name collision. "Oxide" is shared with other companies and projects. This
   is not caused by the subdomain, but a brandable domain would help
   disambiguation and the subdomain does not. On-site mitigation is to always
   pair the name with its category in titles and the definition sentence
   ("Oxide, the desktop app for agentic engineering").
3. A later move costs a migration (section 10). Low if prepared.

The subdomain is not, on the evidence, a reason for worse indexing or ranking
by itself.

## 9. Registering the site

Google Search Console:

- [E] A Domain property (verified by DNS only) includes "all protocol
  (http/https) and subdomain variations". Verifying a root domain by DNS
  verifies its subdomains. A subdomain can also be verified on its own as a
  URL-prefix property (HTML file, HTML tag), which does not verify the parent.
  ([Verify site ownership](https://support.google.com/webmasters/answer/9008080))
- [E] AI Overviews and AI Mode traffic is counted in the Performance report
  under "Web". A separate generative AI performance report (impressions, pages,
  countries) was announced 2026-06-03 and, per a note on the post, rolled out
  to all sites by 2026-08-31.
  ([Search Central blog](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports))

[O] Add a URL-prefix property for `https://oxide.cavallinilorenzo.com/` even
if a Domain property for `cavallinilorenzo.com` exists or is added. It keeps
Oxide's data separate from the portfolio's and is the property the Change of
Address tool will later act on. Verify with a DNS TXT record or the HTML tag
in the static head; submit the sitemap there.

Bing Webmaster Tools:

- [E] The AI Performance report (public preview since 2026-02-10) shows total
  citations, cited pages and "grounding queries" for Copilot and Bing AI
  summaries, as a sample, without clicks.
  ([Bing Webmaster blog](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview))
- Not verified: the exact verification methods and the "import from Google
  Search Console" flow. Bing's help pages returned no readable content to the
  fetcher. From general knowledge the options are GSC import, an XML file, a
  meta tag, or a DNS CNAME; confirm in the tool.

[O] Register on both on launch day, submit the sitemap to both. These two
reports are the only first-party measurement of AI visibility; third-party
"AI visibility" tools have no access to the engines' internals (Google says so
explicitly).

## 10. Keeping a later domain move cheap

What Google prescribes for a move:

- [E] Permanent server-side redirects from each old URL to its new URL, no
  chains; permanent redirects "don't cause a loss in PageRank". Keep them "for
  as long as possible, generally at least 1 year". Self-referential canonicals
  and a sitemap on the new site. "Expect temporary fluctuation in site ranking
  during the move"; a small site takes a few weeks.
  ([Site move with URL changes](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes))
- [E] The Change of Address tool applies when moving "from one domain or
  subdomain to another", needs ownership of both properties in the same
  account, requires the 301 from the old home page first, and its effect lasts
  180 days. It does not move subdomains below a domain automatically; a
  subdomain needs its own property.
  ([Change of Address tool](https://support.google.com/webmasters/answer/9370220))

[O] Build rules that make the move a one-line change:

1. One source of truth for the origin (a `SITE_URL` constant or env value)
   used by canonicals, `metadataBase`, Open Graph URLs, JSON-LD `url` and
   `@id`, the sitemap, robots.txt and `llms.txt`. No hard-coded host elsewhere.
2. Root-relative internal links only.
3. Paths designed to survive unchanged (`/download`, `/changelog`, ...), so the
   redirect is host-only and path-preserving, which a Vercel domain redirect
   does without per-URL rules.
4. After a move, keep the subdomain attached to the project as a permanent
   redirect for at least a year; the subdomain is free to keep indefinitely.
5. A written list of every external place that holds the URL (GitHub repo
   "website" field, README, the in-app links, the portfolio card, release
   notes, directory listings), so they can be updated in one pass.
6. Keep the existing URL-prefix property in Search Console; it is what the
   Change of Address request is filed from.

Not verified: how fast ChatGPT, Claude and Perplexity indexes follow a 301 to
a new host. No vendor documents it.

## Recommendation for the decisions this unblocks

| Decision | Recommendation | Basis |
|---|---|---|
| robots.txt | Allow all agents, training crawlers included; one `Sitemap:` line; leave Vercel bot rulesets off | [E] vendor docs, [O] on training crawlers |
| Rendering | Every citable sentence in the initial HTML; nothing important only in images, video, tabs or accordions | [E] Google, Microsoft |
| JSON-LD | Home page: `WebSite` (name + ordered `alternateName`), `Organization` (logo, `sameAs` to GitHub), `SoftwareApplication` (free, `DeveloperApplication`, OS, version, download URL, screenshots), no ratings | [E] site names; [O] for the rest |
| FAQ | Visible FAQ answering the category queries; `FAQPage` markup optional | [E] rich result removed; [E] Microsoft on Q&A |
| llms.txt | Ship one generated at build, linking to site pages; no Markdown twins in v1 | [E] ignored by Google, rarely fetched; [O] cheap, agents read it |
| Copy shape | Standalone one-sentence definition, concrete facts, one comparison or requirements table, question headings | [E] Microsoft, GEO paper direction |
| Sitemap / canonical | Build-time sitemap with true `lastmod`; absolute self-canonical on every page; previews not indexable | [E] Google |
| Registration | GSC URL-prefix property for the subdomain, Bing Webmaster Tools, sitemap in both, IndexNow on deploy | [E] |
| Subdomain | Accept it; neutralise the site-name fallback with markup; always pair "Oxide" with its category | [E] site names; [O] |
| Future move | Single origin constant, relative links, stable paths, redirect kept one year, Change of Address | [E] Google |

## What I could not verify

- Bing Webmaster Tools help pages (verification methods, the current Bing
  Webmaster Guidelines text on AI answers and on `nosnippet` / `noarchive`
  handling in Copilot) did not render for the fetcher.
- OpenAI's help article on ChatGPT search returned 403, so nothing here states
  which third-party search providers ChatGPT search uses, or how it ranks
  sources.
- Whether non-Google AI crawlers execute JavaScript.
- Any quantified effect of structured data, `llms.txt` or FAQ markup on LLM
  citation. I found claims, not controlled measurements.
- Any quantified ranking or entity-recognition cost of a subdomain.
- The Ahrefs study is a vendor study on its own customer base, not peer
  reviewed; the methodology is documented and its limits are stated above.
- Pages were read through a summarising fetcher. Quotes were returned as
  verbatim by it but were not re-checked character by character against the
  live pages, and page dates come from the pages' own changelogs.
- That Next 16 static output emits `robots.txt`, `sitemap.xml` and JSON-LD as
  described was not tested here; it is a build-time check for the spec.
