# Cookieless analytics and LLM-answer monitoring for a static site

Research for ticket #7 of the map "Oxide website spec" (#1). Checked on 2026-11-10.
Prices are the ones shown on each vendor's own pricing page that day. Script
weights were measured directly (`curl`, then `gzip -9`), not taken from marketing.

## Constraints that shape the answer

- The site is fully static and must not depend on Vercel-only services
  (inherited ADR-0001 of the reference site). Vercel Web Analytics is therefore
  out, whatever its merits. Anything that needs a proxy, rewrite, middleware or
  route handler on our side is out too.
- Oxide promises "no telemetry and no server" (Oxide `README.md`, `llms.txt`).
  That promise is about the app, but the site's audience will read the site the
  same way. The choice has to be explainable in one honest sentence.
- No releases exist yet on `getoxide/oxide` (GitHub API returned 0 releases), so
  where the download files will live is still open. It matters below.

## Part 1: analytics

### Comparison

| Option | Price (hosted) | Script, gzip (raw) | Where data lives | Source licence | Click events (downloads) | LLM referrers |
|---|---|---|---|---|---|---|
| **GoatCounter** | Free "for reasonable public usage", donation funded | 3.3 KB (9.2 KB) | Hetzner, Finland and Germany; operator in Ireland | Modified EUPL 1.2 | Yes: `data-goatcounter-click="name"` attribute | Raw referrer list; `utm_source`/`ref` read as source. No AI grouping |
| **Plausible** | Starter $9/mo at 10k pageviews, 1 site; 30-day trial, no free plan | 1.3 KB (2.8 KB); 1.7 KB with downloads + outbound links | EU, "infrastructure owned by European companies"; Estonian company | AGPL-3.0 (self-host edition exists) | Yes: automatic file downloads and outbound links, plus custom events | Yes: a built-in "AI Assistants" channel (ChatGPT, Claude, Perplexity, Gemini, Copilot "and others") |
| **Umami Cloud** | Hobby $0: 100k events/mo, 1 site, 6 months retention, no API. Pro $20/mo | 4.1 KB (9.2 KB) | Not stated on the features or pricing page | MIT | Yes: `data-umami-event="name"` attribute | Referrers reported; no AI grouping documented |
| **Cloudflare Web Analytics** | Free | 10.3 KB (31.9 KB) | Cloudflare (US company); 6 months of history, sampled | Closed | **No** custom events ("Not yet") | Top referrers only |
| Fathom | From $15/mo (100k pageviews), no free plan, 7-day trial | 2.1 KB (7.0 KB) | Not checked | Closed | Yes | Not checked |
| Simple Analytics | Free plan: 5 sites, 30 days retention, badge required. Paid from EUR 20/mo | 4.8 KB (9.6 KB) | Not checked | Closed | Not stated on pricing page | Not stated on pricing page |
| Pirsch | Standard $6/mo at 10k pageviews, 30-day trial | 3.5 KB (11.8 KB) | Germany | Not checked | Yes | Not checked |

All four main candidates work on a static site with one `<script>` tag pointing at
the vendor's host; none needs a server on our side. Cloudflare Web Analytics does
not require the site to be proxied by Cloudflare: its FAQ says it is "designed
primarily for customers who do not use Cloudflare's proxy" and DNS-only sites add
a manual snippet.

### Evidence per option

**GoatCounter**
- Free hosting: "GoatCounter.com is currently offered for free for reasonable
  public usage"; "Running your personal website or small-to-medium business on it
  is fine"; "sending millions of pageviews/day isn't". No numeric cap is published.
- Nothing stored in the browser (no cookies, localStorage or cache). It "doesn't
  store IP addresses, the full User-Agent header, or any tracker ID". Unique
  visits come from an in-memory mapping of `concat(siteID, User-Agent, IP)` to a
  random ID kept for 8 hours and never written to disk.
- Stores aggregates per day/hour by default (paths, referrers, browsers, systems,
  approximate location, language, screen width); each can be switched off.
- Events: any element with `data-goatcounter-click="..."` is counted on click, so
  it works the same for a download link on our domain or on GitHub.
- Campaign source is taken from `utm_source`, `ref`, `src` or `source`, falling
  back to the referrer.
- Its own FAQ estimates "about a third of pageviews are missed due to adblockers"
  and says a custom domain does not avoid this.
- Its GDPR page is candid: it "*probably* doesn't require a GDPR consent notice".
- JSON and CSV export exist; a no-JavaScript tracking pixel exists.

**Plausible**
- Pricing page: Starter $9/mo (10k pageviews, 1 site, goals and custom events),
  Growth $14, Business $19 at the same tier. Yearly billing saves two months.
  Custom properties, funnels and the Stats API are Business only.
- File download tracking is a dashboard toggle. Default extensions include `.dmg`
  and `.exe` but **not `.msi`**. The docs also say: "Automatic file download
  tracking only works for files hosted on the same domain as the tracked site";
  files on another domain are "tracked as outbound link clicks instead". Downloads
  and outbound clicks "count towards your billable monthly pageviews".
- Data policy: "We do not use cookies or generate persistent visitor identifiers";
  daily identifier is `hash(daily_salt + website_domain + ip_address + user_agent)`
  with the salt "rotated and deleted every 24 hours"; "You retain full ownership
  and control of your website data".
- A site's stats can be made public from the Visibility setting.

**Umami Cloud**
- Hobby plan is free with 100k events/month, one website, 6 months retention, data
  export, community support; API access starts at Pro ($20/mo, 1M events).
- "Umami does not use any cookies so no annoying cookie banner is required."
- Event names are limited to 50 characters.

**Cloudflare Web Analytics**
- "does not use any client-side state, such as cookies or localStorage"; "We also
  don't 'fingerprint' individuals via their IP address, User Agent string, or any
  other data".
- Custom events: "Not yet, but we may add support for this in the future." It
  therefore cannot report download clicks, one of the two things the ticket asks
  for. Unsampled data is kept 7 days, then aggregated; queries are sampled.

### Downloads: the number that needs no script at all

If the installers are served as GitHub release assets, GitHub's REST API returns a
`download_count` per asset. That is a real download count (not a click count),
costs nothing, loads nothing on the site, and is not affected by ad blockers. It
cannot say which page or referrer led to the download; a click event on the
site's button is what links a download to its source.

### Referrals from LLM assistants

- Only Plausible documents a dedicated grouping (the "AI Assistants" channel). In
  the others, assistant traffic appears as ordinary referrer rows (for example
  `chatgpt.com`) or as a `utm_source` value.
- Every tool will undercount this traffic. Assistants running in native apps, and
  links marked `noreferrer`, arrive with no referrer and are counted as direct.
  The claim that ChatGPT appends `utm_source=chatgpt.com` to cited links is widely
  reported by third parties, but OpenAI's own help page returned HTTP 403 and
  could not be read, so this is **not verified** against a primary source.

### The consent question (evidence, then a caution)

- Each vendor says no banner is needed; these are vendors' statements about their
  own product. GoatCounter is the only one that hedges ("probably").
- CNIL (France) lists conditions for audience measurement to be exempt from
  consent: inform users, let them object, purpose limited to audience measurement,
  no cross-checking with other processing, scope limited to a single site.
- The EDPB adopted the final version of Guidelines 2/2023 on the technical scope
  of Article 5(3) ePrivacy on 16 October 2024. Only the landing page was read
  here, not the PDF, so how they treat cookieless counting is **not verified**.
- Not checked: the Italian Garante's position. This is not legal advice.

### Opinion and recommendation

1. **Use hosted GoatCounter.** It is the only candidate that is free, open source,
   EU hosted, and supports click events. For a product whose pitch includes "no
   telemetry", an open-source, donation-funded counter that stores aggregates and
   no visitor identifier is the easiest choice to defend, and it costs nothing
   while there is no budget for a domain.
2. **Count real downloads from GitHub's `download_count`**, and put a
   `data-goatcounter-click` event on each download button (one name per platform)
   so clicks can be tied to referrers. This works wherever the files are hosted.
3. **Fallback: Plausible Starter at $9/month** if the AI Assistants channel or the
   lighter script becomes worth paying for. It is the better product; the only
   reasons not to start there are the recurring cost and that `.msi` and
   GitHub-hosted files need extra setup. Moving later is a one-line script change;
   history does not migrate.
4. **Not recommended:** Cloudflare Web Analytics (no events, heaviest script,
   closed, sampled); Umami Cloud Hobby (fine technically, but data location is not
   stated and retention is 6 months); self-hosting anything (it adds a server to
   run, against the spirit of a zero-ops static site).
5. **Privacy wording for the site** (feeds the "Legal and trust pages" fog): say
   plainly that the app has no telemetry, and that the website counts page views
   and download clicks with GoatCounter, without cookies and without storing IP
   addresses. Consider making the stats page public. Do not write "we collect
   nothing" about the site: it would be false.
6. Expect the numbers to be low by a wide margin: a developer audience blocks
   analytics hosts heavily (GoatCounter's own estimate is a third in general), and
   ADR-0001 rules out proxying the script. Treat the figures as trends, not counts.

## Part 2: checking what LLM assistants answer

### Options and cost

| Approach | Cost | What you get | Limits |
|---|---|---|---|
| **Manual protocol** | Free; roughly 30 to 45 minutes per run (estimate) | The real consumer answers, verbatim, with sources | Small sample; answers vary run to run |
| **Own script on vendor APIs** | Cents per run. OpenAI web search: $10 per 1,000 calls plus tokens. Gemini grounding with Google Search: 5,000 free requests/month on paid usage, then $14 per 1,000 | Repeatable, diffable, automatable | API answers are not the consumer product's answers; it is code to maintain |
| **Otterly.AI Lite** | EUR 29/mo | 16 prompts, 2,000 credits/mo, daily checks; ChatGPT, Perplexity, AI Overviews, AI Mode, Gemini, Copilot, Claude | 1 credit = 1 prompt on 1 engine once; Claude costs 3. 16 prompts daily on 4 engines uses 1,984 credits |
| **Peec AI Starter** | $95/mo | 50 prompts, 3 engines of choice, daily | Claude and Perplexity are Enterprise only |
| **Ahrefs Brand Radar custom prompts** | From EUR 46.7/mo (2,500 checks) | Own prompts tracked | Appears to sit on top of an Ahrefs plan (from EUR 119/mo); not confirmed |
| **Profound** | Free 7-day trial (50 prompts, 3 engines), then custom enterprise pricing | Widest engine coverage | No public self-serve price |

Evidence note: Peec labels some of its engines "(API)" and others not, which
supports the distinction between an API answer and what a person sees in the
app. The size of that difference for Oxide's questions was not measured.

Not verified: Perplexity Sonar and Anthropic web search API prices (the pages
read did not show them); trial lengths for Otterly and Peec.

### Recommended manual protocol (opinion)

- **Question set, fixed, about 10**, mirroring the map's three success levels:
  brand ("What is Oxide, the coding agent app?", "Is Oxide for Claude Code free?"),
  category ("Which GUI should I use for Claude Code?", "Best desktop app for
  Codex", "How do I review code written by an AI agent?"), and accuracy probes
  ("Does Oxide write code?", "Does Oxide have telemetry?").
- **Assistants:** ChatGPT, Claude, Gemini, Perplexity, and Google AI Mode.
- **Conditions:** new conversation each time, memory and personalisation off or
  logged out where possible, web search on, same wording every run, English.
- **Record per answer:** date, assistant and model shown, Oxide mentioned (y/n),
  position among alternatives, facts wrong (list), sources cited, full text saved.
- **Cadence:** once before launch as a baseline, then monthly, plus one extra run
  two weeks after launch. Keep results as dated files in the repo so changes show
  up as diffs.

### Recommendation

Start with the manual protocol: it is free, it measures the thing the map
actually names as success level 3, and at launch the expected answer is "Oxide is
not mentioned", which no paid tool measures better. Revisit a paid tracker
(Otterly Lite is the only one priced for a solo project) only after the monthly
runs show Oxide appearing and the manual run has become a chore. A small script
on the APIs is a reasonable middle step but is optional work, not a launch need.

## Sources

Analytics
- https://www.goatcounter.com/ , /help/terms , /help/privacy , /help/sessions ,
  /help/events , /help/campaigns , /help/gdpr , /help/faq
- https://github.com/arp242/goatcounter (LICENSE)
- https://plausible.io/#pricing , https://plausible.io/data-policy ,
  https://plausible.io/docs/subscription-plans ,
  https://plausible.io/docs/file-downloads-tracking ,
  https://plausible.io/docs/top-referrers , https://plausible.io/docs/visibility
- https://github.com/plausible/analytics (licence)
- https://umami.is/pricing , https://umami.is/features ,
  https://docs.umami.is/docs/track-events , https://github.com/umami-software/umami
- https://www.cloudflare.com/web-analytics/ ,
  https://developers.cloudflare.com/web-analytics/faq/
- https://usefathom.com/pricing , https://www.simpleanalytics.com/pricing ,
  https://pirsch.io/pricing
- https://docs.github.com/en/rest/releases/assets (`download_count`)
- Script weights: measured from each vendor's public script URL on 2026-11-10.

Consent
- https://www.cnil.fr/en/sheet-ndeg16-use-analytics-your-websites-and-applications
- https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-22023-technical-scope-art-53-eprivacy-directive_en

LLM monitoring
- https://otterly.ai/pricing , https://peec.ai/pricing ,
  https://www.tryprofound.com/pricing , https://ahrefs.com/pricing
- https://developers.openai.com/api/docs/pricing ,
  https://aistudio.google.com/docs/pricing

Project
- Oxide `README.md` and `llms.txt` (no-telemetry statement)
- `cavallinilorenzo.com/docs/adr/0001-fully-static-site.md`
