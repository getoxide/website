# Performance and accessibility budgets

The numbers the site commits to and the checks that hold it to them. Decided in [Performance and accessibility budgets](https://github.com/getoxide/website/issues/22), for direction C ([Visual direction](https://github.com/getoxide/website/issues/11)) and the tiered motion toolset ([ADR-0001](../adr/0001-tiered-motion-toolset.md)).

Build issues **cite** this file; they never copy it. Changing a number is a PR to this file, approved by Lorenzo. Reduced-motion behaviour is fixed by [Motion approach](https://github.com/getoxide/website/issues/10) and is not restated here. Visual styling (colours, focus-ring token, components) lives in the design system.

## Budget classes

Every page belongs to one class. The class is the `budgetClass` field of its entry in the `PAGES` registry, the same registry that feeds metadata, sitemap and llms.txt.

| Class | Pages | Why |
| --- | --- | --- |
| `showcase` | `/`, `/features`, `/claude-code-gui`, `/codex-gui` | Captures, section reveals and, on the home only, the shader |
| `reading` | `/faq`, `/changelog`, `/docs`, both guides, `/download`, the 404 | Only page transitions and micro-interactions. `/download` adds just its OS detection |

A new page picks a class when it enters `PAGES`.

## Core Web Vitals

The site has too little traffic for field data to exist for months, and the [Measurement plan](https://github.com/getoxide/website/issues/16) allows no second analytics script. The targets are therefore **lab** targets: Lighthouse, mobile preset (simulated slow 4G, 4× CPU slowdown), median of 3 runs. INP cannot be measured in the lab, so TBT stands in for it.

| Class | LCP | TBT (INP proxy) | CLS |
| --- | --- | --- | --- |
| `showcase` | ≤ 2.0 s | ≤ 150 ms | ≤ 0.05 |
| `reading` | ≤ 1.5 s | ≤ 50 ms | ≤ 0.02 |

**Field.** No RUM script. Once CrUX (PageSpeed Insights) has data for a page, it must sit in Google's "good" band at p75: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.

**Home LCP.**
- The LCP element is the hero H1. It is text in the static HTML, so it does not wait for the capture.
- The shader mounts after first paint (on idle or after `load`) and is never on the critical path.
- The capture rising over the shader has its box reserved (`width`/`height` or `aspect-ratio`), so it causes no layout shift.

## Per-page ceilings

Counting rules:
- JS, CSS and HTML are counted **gzip-compressed**. Vercel serves brotli, which is slightly smaller, so these numbers are conservative.
- Fonts, images and video are counted at **file size**, because they are already compressed.
- **Initial** means everything requested up to the page's `load`. Lazily loaded assets below the fold are not initial; they count only toward the page total.

| Class | JS | CSS | HTML (incl. inline RSC payload) | Fonts (of which preloaded) | Initial images | Page total, excluding video |
| --- | --- | --- | --- | --- | --- | --- |
| `showcase` | ≤ 160 kB | ≤ 25 kB | ≤ 50 kB | ≤ 120 kB (≤ 75 kB) | ≤ 300 kB | ≤ 1 MB |
| `reading` | ≤ 130 kB | ≤ 15 kB | ≤ 50 kB | ≤ 120 kB (≤ 75 kB) | ≤ 100 kB | ≤ 400 kB |

**JS.**
- Next 16's App Router and React weigh about 100–110 kB gzip on their own; the ceilings sit on top of that floor.
- The `showcase` ceiling includes the shader (~2.5 kB gzip), reveals, the video controller, the animated mark, GoatCounter and, if a page uses it, the tier-3 Motion escape hatch (`LazyMotion` + `m` + `domAnimation`, about 20 kB gzip). Motion gets **no extra allowance**: an effect that does not fit under the ceiling does not ship.
- **One-off calibration.** The first build issue measures an empty page. If its JS exceeds 110 kB gzip, both JS ceilings move up by the difference, once, and that change is recorded in this file.

**HTML.** `/changelog` grows with every release and is the page most at risk. If it exceeds the ceiling, the page paginates or keeps only the latest N releases; the ceiling does not move.

## Fonts

- The three variable, Latin-subset WOFF2 files of the prototype: Space Grotesk (~22 kB), Inter (~48 kB), JetBrains Mono (~40 kB). About 111 kB in total.
- Loaded with `next/font`: self-hosted at build time, with its automatic metric-matched fallback to keep the swap from shifting layout. `display: swap`.
- **Preload only Space Grotesk and Inter** (~70 kB, needed by the H1 and body). JetBrains Mono loads normally.
- No italics, no extra static weights.

## Product captures

### Stills

- **Formats.** AVIF primary with a WebP fallback, inside `<picture>`. PNG is never served. Pick the AVIF quality by eye on the UI's small text (start around q60): below that, text blurs.
- **Widths.** 640, 960, 1280, 1920 and 2560 px, with an accurate `sizes`. Dedicated mobile crops are allowed through `<picture media>`. The shot list in [Real product visuals: shot list and capture](https://github.com/getoxide/website/issues/15) decides which captures get one.
- **Pipeline.**
  - Source PNGs are committed in `assets/captures/`.
  - An in-house `sharp` script generates the variants and a manifest (with `width`/`height`) into `public/` at build time. The output is not committed.
  - A `<Capture>` component reads the manifest.
  - `next/image` is not used: under `output: 'export'` it does not optimize.
- **Ceiling.** The hero capture weighs ≤ 200 kB for the variant served at 2×. Initial-image ceilings per class are in the table above.

### Video loops (6–8 s)

- MP4 with two `<source>` elements: AV1 first, H.264 as the fallback (Safari decodes AV1 only on recent chips). No audio track, 30 fps, at most 1920 px wide.
- `preload="none"`. Playback starts and stops through IntersectionObserver.
- The poster is an AVIF of the first frame. It counts toward the image ceilings.
- **Ceiling ≤ 1.5 MB per loop** (H.264 file). Video sits outside the initial and page-total ceilings; this per-loop ceiling is its budget.

## Shader

These rules come from the prototype measurements on [Performance and accessibility budgets](https://github.com/getoxide/website/issues/22#issuecomment-6779023253): the original version used ~44% GPU time on an M1, the fixed one ~3.6%, with no visible difference.

1. The drawing buffer is sized in CSS pixels × 0.5, never from `devicePixelRatio`, with a hard cap of 360,000 pixels.
2. Every animated canvas is capped at 30 fps.
3. No `mix-blend-mode` or `backdrop-filter` on or over an animated layer.
4. **No GPU or frame-time threshold in CI.** GitHub runners render WebGL in software (SwiftShader), so the number would be noise. In its place:
   - a Playwright test asserts the drawing buffer is ≤ 360,000 px and that the shader draws ≤ ~62 frames in 2 s;
   - a lint rule forbids `mix-blend-mode` and `backdrop-filter` in animated components.
5. **Manual check.** Any PR that touches the shader reports its GPU time per frame, measured on real hardware, in the PR description.

## Accessibility

The bar is **WCAG 2.2 AA** on every page.

- **Contrast.** 4.5:1 for text. 3:1 for large text, UI components and the focus indicator.
  - Text over the shader is checked against the **brightest** frame the shader can produce, not an average.
  - axe cannot see text over a `<canvas>`, so this check is **manual**. Repeat it whenever the shader or the hero changes, and record the result in the PR.
- **Focus.** Always visible: 2 px outline with a 2 px offset. Never `outline: none` without a replacement. The token and colour are in the design system.
- **Keyboard.** A "Skip to content" link, every control reachable and operable from the keyboard, tab order matching visual order.
- **Targets.** ≥ 24×24 CSS px.
- **Structure.** `lang="en"`, one H1 per page, landmarks (`header`, `nav`, `main`, `footer`). Capture alt text says what the app shows, never "screenshot".
- **Pause, stop, hide (WCAG 2.2.2).** This applies to every visitor, not only under reduced motion.
  - Every looping video has a visible pause/play button.
  - The home hero has a small "Pause animation" toggle that freezes the shader and the mark's eyes. The choice persists in `localStorage`.

## Third parties

GoatCounter is the only allowed third-party origin; it loads async and counts toward the JS ceiling. No font CDNs, embeds, live GitHub star widgets or external video players. Adding an origin takes a new decision.

## Enforcement in CI

Everything runs against the static export served locally in CI, never against a Vercel preview.

| Check | Scope | Effect |
| --- | --- | --- |
| axe (`@axe-core/playwright`), tags WCAG 2.2 A and AA, zero violations | Every page in `PAGES` | **Fails the build** |
| `scripts/check-budgets.mjs` | Every exported page, against its class's ceilings | **Fails the build** |
| Lighthouse CI, median of 3: LCP, TBT and CLS from the table above; accessibility score = 100 | `/` and `/changelog` | **Fails the build** |
| Shader structure tests (buffer cap, frame cap, blend/backdrop lint) | Home | **Fails the build** |
| Lighthouse overall performance score | `/` and `/changelog` | Warning only |

`scripts/check-budgets.mjs` is in-house rather than `size-limit`, because `size-limit` works per bundle, not per page. It reads each exported HTML file, sums the JS, CSS and preloaded fonts it references (gzip for text), checks the images and videos in `public/`, and fails if any page exceeds its class's ceilings.

`/changelog` is the Lighthouse reading page because it is the heaviest one.
