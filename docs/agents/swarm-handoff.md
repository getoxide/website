# Swarm hand-off (spec #29, Oxide website v1)

Integration branch: `feat/oxide-website-v1` (pushed). One PR for the whole spec.

## Merged on the integration branch
#30, #31, #32, #33, #34, #35, #36, #37, #38, #39, #40.

## In progress (pushed, unmerged)
- #41 Provider pages: branch `worktree-agent-a1afa877b0abaa52a`, last commit is a WIP save. Based on an older tip: merge `feat/oxide-website-v1` into it first.
- #42 Guides: branch `worktree-agent-a812fff3db130a017`, may hold no commits beyond the integration tip yet. `/features` already links `/guides/review-ai-generated-code` and `/guides/claude-code-and-codex-together`.

## Still to do
- #43 (blocked by #34, #39: now free once #41/#42 land, no real dependency on them), then #44 (needs everything), then one verifier run, `judge`, one fix pass, verifier again, cleanup.

## Known issues
- `check:lighthouse` fails on `/changelog` TBT (62-86 ms vs 50 ms ceiling). Implementers say it also fails without their changes; not investigated.
- `GOATCOUNTER_CODE` in `src/lib/measurement.ts` is a placeholder (`TODO(#38)`): needs the real GoatCounter site code from Lorenzo.
- Captures: `assets/captures/hero.png` is the prototype still; real captures come from Lorenzo (#15). Feature captions/alt texts are drafts to approve.
- `#pull-requests` section and proof-path steps 3-4 appear once the Snapshot has the oxide#416 lead-in (re-run `pnpm sync:oxide`).
- #33 workflow has never run on GitHub: dispatch it manually (changed ref, ref missing a marker, same ref twice).
- Add the release-day manual sync step to `docs/agents/engineering.md`.
- `pnpm typecheck` needs a prior `pnpm build` (generated `next-env.d.ts`).
