Closes #<n>

## Why
The problem and approach, in 1-3 short sentences.

## What changed
1-3 bullets. Add the smallest diagram, diff sketch or call tree that makes the change clear.

## Scope
What this covers and what it deliberately leaves out.

## Risk
**Level:** <low|medium|high> (<reason>)
**Door:** <one-way|two-way>
**Blast radius:** <who or what it touches, and why that is safe or risky>

## Verification
**Commit:** `<full sha>`
- `<command>`: <result>
- <criterion>: <observed behaviour> (certainty <1-5>)

**Not verified:** <list, or None>

## Manual budget checks
CI cannot measure these (docs/spec/budgets.md, Shader and Accessibility). Fill them in, or write "n/a" when the PR touches neither the shader nor the hero.
- [ ] **Shader GPU time per frame** (any PR that touches the shader): <ms per frame, device and browser, measured on real hardware>
- [ ] **Text contrast over the shader's brightest frame** (any PR that touches the shader or the hero): <ratio per text element, ≥ 4.5:1, or ≥ 3:1 for large text>

## Screenshots
<before/after images, only if the UI changed>
