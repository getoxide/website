# Swarm hand-off (spec #29, Oxide website v1)

Integration branch: `feat/oxide-website-v1`. One PR for the whole spec.

## Merged

#30–#43 are merged on the integration branch. #44 is the production launch:
its code-side work is done, the remaining steps need Lorenzo and are listed in
[`launch-checklist.md`](./launch-checklist.md).

## Verified locally

The full recipe in [`engineering.md`](./engineering.md) passes at the tip:
format, lint, typecheck, unit tests, build, budgets, copy-lint, Concept links,
e2e (278 passed, 1 skipped) and Lighthouse (`/` and `/changelog`, four
repeated 3-run medians). The verification receipt is outside the diff.

## Needs Lorenzo before launch

- `NEXT_PUBLIC_GOATCOUNTER_CODE`: the real GoatCounter site code, set in
  Vercel. Unset warns; explicitly setting the placeholder fails a production
  build.
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`: the Search Console token, set in
  Vercel. Same guard.
- Real product captures (#15). `assets/captures/hero.png` is still the
  prototype still; feature capture slots are empty, so no frame renders.
- The `getoxide/website` repository must be public (Vercel Hobby cannot deploy
  a private organization repository), and the first stable Oxide release must
  exist.
- The GitHub workflows have never run: dispatch `content-sync.yml` and watch
  `ci.yml` on the PR and on `main`.

## Notes

- The Snapshot is pinned to an Oxide commit (`source.commit`) while no stable
  tag exists; links use the tag when there is one.
- Reading pages ship no client runtime; showcase pages defer their hydration
  to `load`. Both are post-export steps guarded by tests.
- `#pull-requests` and proof-path steps 3–4 render because the synced Snapshot
  carries the oxide#416 lead-in.
- `pnpm typecheck` needs a prior `pnpm build` (generated `next-env.d.ts`).
