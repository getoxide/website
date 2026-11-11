# Engineering config

Read by `/verify`, `/judge`, `/build`, `/ship`, `/ui` and `/release`.

## Risk

- floor: low
- sensitive: no
- high-risk paths:
  - .github/workflows/\*\*: CI, the gate every merge and every content sync passes
  - vercel.json: redirects and the `X-Robots-Tag: noindex` rule for non-production hosts (ADR-0002); a wrong rule de-indexes production or exposes previews
  - scripts/sync-oxide.mjs, content/oxide/\*\*, src/app/icon.svg, src/app/favicon.ico, src/app/apple-icon.png: the content sync from the Oxide repo and its committed output

## Recipe

- setup: `pnpm install --frozen-lockfile && pnpm exec playwright install chromium`
- checks:
  - `pnpm format:check` (Prettier)
  - `pnpm lint` (ESLint)
  - `pnpm typecheck`
  - `pnpm test` (Vitest: `src/**/*.test.ts` and `scripts/**/*.test.mjs`; includes the Copy deck parity, route coverage, token usage and `vercel.json` tests)
  - `pnpm build` (`next build` with `output: 'export'` into `out/`; every route must be `○ Static`, and `scripts/check-static.mjs` runs after it and fails on dynamic routes, route handlers, server actions, proxy, or a page missing from `out/`)
  - `pnpm check:budgets` (per-page ceilings of `docs/spec/budgets.md` for every page in `PAGES`, read from `out/`; run `pnpm build` first)
  - `pnpm check:copy` (copy-lint over the visible text of every exported page: canonical definition equal to the Snapshot's, banned phrases, "GUI" only where Copy deck rule 3 allows it; the footer definition's "GUI" is a pinned exception until getoxide/oxide#416, see `GUI_EXCEPTION_DEFINITION` in `scripts/copy-lint.mjs`)
  - `pnpm check:concept-links` (the first capitalised mention of each Concepts term in `<main>` links to `/docs/concepts#<term>`; derived Markdown gets the links from `seenBefore` + `<Markdown conceptLinks>`, site copy places them by hand)
  - `pnpm e2e` (Playwright and axe, WCAG 2.2 A/AA, against `out/` served by `scripts/serve-out.mjs` on :3130; run `pnpm build` first; set `E2E_PORT` if :3130 is busy)
  - `pnpm check:lighthouse [path ...]` (Lighthouse, mobile preset, median of 3, on `/` and `/changelog` by default against `out/` served on :3140, Chromium from Playwright; Core Web Vitals per budget class and accessibility 100 fail, the performance score warns; takes a few minutes, CI runs it as the separate `lighthouse` job; set `LIGHTHOUSE_PORT` if :3140 is busy)
  - The gate scripts import `src/content/pages.ts` directly, so they need Node 22.18 or later (type stripping on by default).
- run: `pnpm dev`, available at `http://localhost:3000`. For the static export: `pnpm build && pnpm serve --port 3130`, at `http://localhost:3130`
- exercise: browser or curl against the served export, e.g. `curl -sI http://localhost:3130/nope` must answer `404`. The `X-Robots-Tag: noindex` header exists only on Vercel: `curl -sI <preview URL> | grep -i x-robots-tag`
- measure: `pnpm measure:js [page.html ...]` prints the gzip JS of exported pages (default: the home)
- sync: `pnpm sync:oxide [--ref <ref>]` refreshes the brand tokens, the icons and the content Snapshot (`content/oxide/snapshot.json`, ADR-0003) from `getoxide/oxide` at the latest stable tag (`main` while none exists); network, builds never touch it. Dev only: `--local-source <git-dir>:<ref>` reads the Oxide files from a local clone for a ref not pushed yet and records its ref and commit in the Snapshot
- test data: none needed, the site has no user data

## Review

- second_opinion: none

## Release

- release: none (Vercel deploys from `main`; previews per PR)
