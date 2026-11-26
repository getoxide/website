# Launch checklist (#44)

The site goes live on `getoxide.dev` with the first downloadable
Oxide release. The code side is merged and verified locally; the steps below
are Lorenzo's, in order. Tick each one on #44 as it is observed on production.

## 0. Before touching production

- [ ] The first stable Oxide release is published, and oxide#416 is merged.
- [ ] Real captures are in `assets/captures/` (#15), at least the hero still;
      captions and alt texts are approved. An empty slot renders no frame.
- [ ] `pnpm build` on `main` is green and `git status` is clean.

## 1. Cloudflare Workers project

- [ ] The Cloudflare Workers project connects to `getoxide/website` (`main`
      branch), builds with `pnpm build` on Node 22.18+, and deploys with
      `npx wrangler deploy` (reading `wrangler.jsonc`); PR previews run
      `npx wrangler preview`, which fails without the (empty) `previews`
      block in the same file.
- [ ] `NEXT_PUBLIC_GOATCOUNTER_CODE` is set to the real GoatCounter site code.
      Leaving it unset warns; setting it to `oxide` in production fails.
- [ ] `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` is set to the Search Console
      token. Same guard.
- [ ] A preview answers `X-Robots-Tag: noindex`:
      `curl -sI https://<preview>.workers.dev | grep -i x-robots-tag`.

## 2. Domain and headers

- [ ] `getoxide.dev` is bound to the Worker as a Custom Domain on Cloudflare;
      the certificate is valid.
- [ ] Production answers without the noindex header:
      `curl -sI https://getoxide.dev | grep -i x-robots-tag`
      returns nothing.
- [ ] `/docs` answers `308` to `/docs/quick-start`; `/foo/` normalises without
      a trailing slash; `/nope` answers `404`.
- [ ] `robots.txt`, `sitemap.xml`, `llms.txt` and `og.png` are served.

## 3. Content and download

- [ ] Right after the release, dispatch the sync:
      `gh workflow run content-sync.yml -f ref=vX.Y.Z`, or locally
      `pnpm sync:oxide --ref vX.Y.Z` and push the one `chore(content)` commit.
- [ ] `/download` shows the real version, date and installer sizes, with
      direct asset links for macOS arm64 and Windows x64; no dead button.
- [ ] The changelog lists the stable release newest first, with Breaking,
      Features and Fixes, or the empty state when there is none.
- [ ] The proof path shows the Pull requests and Merge steps, and `/features`
      shows `#pull-requests`.

## 4. Measurement

- [ ] The GoatCounter site exists on Lorenzo's account and page views appear
      from production.
- [ ] `download-macos-arm`, `download-windows`, `download-linux` and
      `github-cta` appear as events; no other event does.
- [ ] No cookie is set and no origin other than `gc.zgo.at` and
      `<code>.goatcounter.com` is contacted.
- [ ] `/privacy` still matches what ships.

## 5. Search and LLMs

- [ ] The URL-prefix Search Console property is verified on production and the
      sitemap is submitted.
- [ ] Bing Webmaster Tools is imported from Search Console.
- [ ] The home's JSON-LD validates (WebSite, Organization, SoftwareApplication,
      no rating) and `/faq` alone carries FAQPage.
- [ ] A shared link shows the single share card with the right title and alt.

## 6. Workflow first runs

- [ ] `ci.yml` runs on the PR and on `main` after merge.
- [ ] `content-sync.yml` is dispatched with a ref that changes the Snapshot:
      one `chore(content)` commit lands on `main` and Cloudflare Workers deploys it.
- [ ] Dispatched with a ref missing a marker: the run fails and `main` is
      untouched.
- [ ] Dispatched twice with the same ref: the second run commits nothing.
- [ ] If `main` requires pull requests or status checks, the bot push is
      adjusted first (an App token or a PR-based sync).

## 7. Hand-over

- [ ] The `getoxide/oxide` repository's website field is
      `https://getoxide.dev` and its README links to the site.
- [ ] The portfolio's Oxide card points at `https://getoxide.dev`.

## 8. Production smoke over #29

- [ ] Every acceptance criterion on #29 is checked on production and ticked.
- [ ] Manual checks that CI cannot do: GPU time per frame for the shader, and
      text contrast of at least 4.5:1 against the shader's brightest frame.
- [ ] Keyboard pass and a screen-reader pass over the home, `/download`,
      `/features` and one guide.

## Known deferred items

- The design document's download-block placement and the feature-section
  heading level conflict with the implementation; the spec was left untouched.
- The Antigravity install link renders as text because the Snapshot's README
  has no URL for it.
- The optional Concept-link counter refactor and the Lighthouse port-reuse
  guard are deferred.
