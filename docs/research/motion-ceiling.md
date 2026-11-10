# Motion ceiling of platform-native web APIs

Research for issue #2. Date of inspection: 2026-11-10.

Question: which techniques produce the motion level of x.ai, which of them can be built with platform-native APIs in a fully static Next 16 site, and what is the smallest sufficient library for the rest.

## Short answer

The x.ai homepage reaches its level with **Motion (ex Framer Motion) for DOM animation, two small raw-WebGL shader canvases, `number-flow`, and plain CSS keyframes**. It uses no GSAP, no Lenis, no Three.js, no Lottie/Rive, no video, and no scroll-linked (scrubbed) animation. Every effect found there can be built with platform-native APIs. Motion buys convenience (exit choreography, layout animation, springs), not capability.

Recommendation: keep the platform-native baseline, add one hand-written WebGL fragment-shader component (no library) for ambient backgrounds, and treat Motion via `LazyMotion` as the only pre-approved escape hatch, to be added only when a concrete effect needs layout or exit animation that is costly by hand.

## How x.ai implements its effects (evidence)

### Method and limits

- `https://x.ai/` returns HTTP 403 (Cloudflare bot challenge) to non-browser clients, so the HTML was read from the Wayback Machine capture of 2026-11-08 (`web.archive.org/web/20261108075840id_/https://x.ai/`).
- The 36 JS and 4 CSS chunks that this HTML references were downloaded directly from `x.ai/_next/static/chunks/` (static assets are served without the challenge) and searched for library signatures and API calls.
- This is static analysis of minified code for the **homepage only**. Nothing was rendered or watched in a browser. Chunks loaded lazily at runtime and not referenced in the HTML were not inspected. Other x.ai pages were not inspected.

### Stack

- Next.js 16.4.2 with Turbopack, App Router (`window.next={version:"16.4.2",appDir:!0}`), Tailwind-style utility classes, Base UI, Shiki for code blocks.
- Total for the homepage: about 0.9 MB compressed and 3.2 MB uncompressed of JS and CSS. A large share is not motion: one 145 kB (compressed) chunk is session replay, plus Sentry and analytics.

### Effects found and how each is built

| Effect | Implementation found | Evidence |
| --- | --- | --- |
| Hero headline, word-by-word 3D reveal | Motion `motion.span` per word, from `{opacity:0, rotateX:-40, y:"45%"}` to `{opacity:1, rotateX:0, y:0}`, staggered by word index, parent with `perspective:1200px` | Chunk `0e4g4-tphni9c.js`; server HTML ships `opacity:0;transform:translateY(45%) rotateX(-40deg)` inline on each word |
| Rotating headline word | Motion `AnimatePresence mode="wait"` with per-character variants: `y:14, opacity:0, filter:blur(4px)` in, reverse out, `staggerChildren:.025`, 250 ms, ease `[.16,1,.3,1]`; then a CSS `hero-shimmer` gradient underline | Chunk `1w65-62gnxbn6.js` |
| Section and card reveals on scroll | Scroll-**triggered** only: in-view hook over IntersectionObserver, then opacity plus `translateY(6px…16px)` | Inline styles `opacity:0;transform:translateY(6px)` (12 occurrences), in-view hook in `3i0hv6ngz84hl.js` |
| Gradient backgrounds on cards | Paper Shaders mesh gradient on a WebGL2 canvas, mounted lazily by IntersectionObserver (`rootMargin:300px`), over a CSS `radial-gradient` placeholder. Rendered with `speed:0`, so it is a **still frame**, not an animation | Chunk `16lm5xx8hb_xm.js` (`getContext("webgl2")`, `@layer paper-shaders`) |
| "Agent orb" | Custom GLSL on raw WebGL 1 with instanced rendering, moved to a Worker through `OffscreenCanvas` when supported, paused by IntersectionObserver, frame-capped | Chunk `3ahyh7966khcn.js` (`[AgentOrb] worker failed … remounting orbs on the main thread`) |
| Animated statistics | `number-flow` custom element (Web Animations API plus CSS registered properties) | `<number-flow-react>` in HTML, chunk `0e4g4-tphni9c.js` |
| Scripted product demos (terminal, chat) | Step state advanced by `setTimeout`, CSS transitions for the visuals; the sequence does not run under reduced motion | Chunk `0uuhbh7bb6tnk.js` |
| Marquee, border beam, shimmer, loaders, tooltips, menus | Plain CSS `@keyframes` (`marquee`, `border-beam` animating a registered `--angle`, `hero-shimmer`, `border-shimmer`, `cli-dot-loader`, `waveform`, `pulse`, `tooltip-in/out`, `context-menu-in/out`) | CSS chunk `1ymij0depajxp.css`, 14 keyframes |
| Hover states | CSS transitions, 150 to 700 ms, ease `cubic-bezier(0.22,1,0.36,1)`, scale 1.02 to 1.03 on cards | Class names in HTML |
| Shared highlight in navigation | Motion layout animation (`layoutId`) | Chunk `0o7llt1mw3ti0.js` |

### What x.ai does not use on the homepage

- No GSAP or ScrollTrigger, no Lenis or other smooth-scroll library, no Three.js or OGL, no Lottie or Rive: zero matches in all chunks.
- No scroll-linked animation: no `scrollYProgress`, no `animation-timeline` in CSS. Motion's feature test for `ScrollTimeline` is present in the bundle but nothing on the page calls `useScroll`.
- No `<video>` element and no video file references. The only canvas code besides the two shaders belongs to the session-replay recorder.
- No app-level View Transitions: `startViewTransition` and `addTransitionType` appear only inside React and the Next router, with no `view-transition-name` in the CSS.

### Reduced motion at x.ai

- A provider sets Motion's `MotionConfig reducedMotion="user"` (`0o7llt1mw3ti0.js`). Per the Motion docs this disables transform and layout animations and keeps opacity and colour animations.
- CSS uses `@media (prefers-reduced-motion: reduce)` to stop the beam, shimmer and loader keyframes, and Tailwind `motion-safe:` variants elsewhere.
- Safari gets a cheaper version: an `@supports (hanging-punctuation:first)` block removes blur filters and backdrop blur (`data-safari-no-blur`, `data-progressive-blur`).

## What platform-native APIs cover today

Browser versions are from MDN browser-compat-data 8.1.8 (2026-11-02).

| API | Chrome | Firefox | Safari | Note |
| --- | --- | --- | --- | --- |
| CSS scroll-driven animations (`animation-timeline`, `scroll()`, `view()`, `animation-range`) | 115 | 159 | 26 | MDN: "Baseline 2026, newly available since October 2026" |
| Same-document View Transitions (`startViewTransition`, `view-transition-name`) | 111 | 144 | 18 | |
| `view-transition-class` | 125 | 144 | 18.2 | |
| Cross-document View Transitions (`@view-transition`) | 126 | no | 18.2 | Not needed with the Next client router |
| `@starting-style` (enter animations from `display:none`) | 117 | 129 | 17.5 | |
| `linear()` easing (spring-like curves in CSS) | 113 | 112 | 17.2 | |
| `@property` (animatable custom properties) | 85 | 128 | 16.4 | Used by x.ai for the border beam |
| WebGL 2 | 56 | 51 | 15 | |
| `OffscreenCanvas` transfer to a Worker | 69 | 105 | 16.4 | |
| `prefers-reduced-motion` | 74 | 63 | 10.1 | |

React 19.3.1 (stable) exports `ViewTransition` and `addTransitionType`; the stack reference site already uses `<ViewTransition>` on Next 16.4 with no experimental flag in `next.config.ts`. The React docs state that React does not disable these animations under reduced motion, so that stays manual CSS.

### Technique by technique

| Technique | Native route | Verdict |
| --- | --- | --- |
| Word or character text reveal, 3D or blur | Split words in a server component, CSS keyframes, stagger through `animation-delay: calc(var(--i) * 40ms)` | Native, no JS needed |
| Reveal on scroll | `animation-timeline: view()` inside `@supports`, or IntersectionObserver toggling a class | Native |
| Scroll-linked sequences (parallax, progress, sticky scenes) | `position: sticky` plus `animation-timeline: scroll()/view()` with `animation-range`; runs off the main thread for transform and opacity | Native in current browsers; older Safari (before 26) and Firefox (before 159) need a static fallback |
| Page transitions and shared-element morphs | React `<ViewTransition>` | Native, already proven on the reference site |
| Rotating word with exit animation | CSS keyframes plus a small script that waits for `animationend` before swapping | Native, but this is where hand-written code starts to cost |
| Shared layout highlight (tabs, nav pill) | View Transitions, or a transform computed from `getBoundingClientRect` | Native, moderate effort |
| Marquee, beams, shimmer, loaders | CSS keyframes and `@property` | Native |
| Ambient shader background | One full-screen triangle and one fragment shader on raw WebGL, about 100 lines, IntersectionObserver pause, CSS gradient fallback | Native, no library |
| Number tickers | Web Animations API or CSS counters with `@property` | Native, or `number-flow` (MIT) |
| Scripted product demo | Timers plus CSS transitions, as x.ai does; or a real capture in `<video muted playsinline>` played and paused by IntersectionObserver | Native |
| Spring physics, interruptible gestures, drag | Not native beyond `linear()` approximations | Library territory |
| Pinned, scrubbed multi-step timelines with complex sequencing | Possible with scroll timelines, but orchestration across many elements becomes hard to maintain | Library territory if the design calls for it; x.ai does not do it |

## Libraries, if one is needed

| Library | Licence | Size | Browser support | Reduced motion |
| --- | --- | --- | --- | --- |
| Motion 14.12 | MIT | Motion docs: `motion` component cannot go below 43 kb; `m` + `LazyMotion` just over 5 kb, plus `domAnimation` +24 kb or `domMax` (layout, drag) +38 kb; `useAnimate` mini 3.3 kb. Bundlephobia whole package: 63 kB gzip. x.ai's Motion chunk: 46 kB compressed | Uses WAAPI and native `ScrollTimeline` where available, JS fallback otherwise | `MotionConfig reducedMotion="user"`: disables transform and layout animation, keeps opacity; `useReducedMotion` hook |
| GSAP 3.15 | "Standard no charge license", proprietary, owned by Webflow; commercial use and all plugins free; prohibited in tools competing with Webflow's animation builder | Bundlephobia core: 27 kB gzip, plugins extra | All modern browsers, main-thread JS | Manual, `gsap.matchMedia()` |
| Lenis 1.3 | MIT | 5.5 kB gzip | Main-thread smooth scroll | Manual |
| Three.js 0.187 | MIT | Bundlephobia whole package: 186 kB gzip | WebGL 2 | Manual |
| OGL 1.0 | Unlicense | Bundlephobia whole package: 34 kB gzip | WebGL | Manual |
| `@paper-design/shaders-react` 0.0.82 | Apache-2.0 | Whole package 83 kB gzip; x.ai's tree-shaken chunk with one shader: 12 kB compressed | WebGL 2 | Manual; `speed={0}` gives a still frame |
| `@number-flow/react` 0.6 | MIT | 6 kB gzip | WAAPI | Built in: reads `prefers-reduced-motion` |

Bundlephobia figures are for the whole package before tree-shaking; real cost depends on imports. The Motion docs do not say whether their figures are gzip.

## Recommendation (opinion)

1. **Baseline stays platform-native**: CSS keyframes and transitions, scroll-driven animations as progressive enhancement inside `@supports (animation-timeline: view())`, React `<ViewTransition>`, IntersectionObserver. This already covers every effect on the x.ai homepage except the convenience cases below.
2. **Add raw WebGL, not a 3D library**: one small in-house fragment-shader canvas component with a CSS gradient placeholder, lazy mount, off-screen pause and a still frame under reduced motion. This mirrors what x.ai ships. Three.js and OGL are not justified for full-screen shaders.
3. **Motion is the smallest sufficient library** if the visual direction needs layout animations, exit choreography on many components, or springs. Add it as `LazyMotion` + `m` + `domAnimation` (about 5 + 24 kb by its docs), scoped to the components that need it, never the full `motion` import. Do not add it up front.
4. **Reject GSAP, Lenis and Three.js for v1**: x.ai reaches the bar without them. GSAP is only worth reopening if the design demands pinned scrubbed timelines, and its licence is free but not open source. Native scroll stays untouched.
5. **Do better than x.ai on first paint**: x.ai's server HTML ships hero words with inline `opacity:0`, so the headline is invisible until hydration. With CSS-only reveals the text can be visible by default and animated only when motion is allowed, which suits a site whose goal is search and LLM visibility.
6. **Budget consequence**: tier 1 and 2 add 0 kB of third-party JS. The escape hatch costs roughly 30 kb on the pages that use it.

## Not verified

- The effects were not observed in a browser; descriptions come from code, not from watching the page.
- Only the homepage of x.ai was inspected. Product pages may use video, scroll-linked sequences or other libraries.
- The Motion version x.ai ships, and any chunk loaded only at runtime (for example the orb worker script).
- Whether x.ai uses View Transitions between pages; no evidence was found in the homepage code.
- The claim in point 5 about first-paint and LCP impact is inference from the HTML, not a measurement.
- No prototype was built on the Oxide stack, so the effort estimates ("about 100 lines", "moderate effort") are judgement.

## Sources

- x.ai homepage HTML, Wayback Machine capture 2026-11-08: https://web.archive.org/web/20261108075840/https://x.ai/
- x.ai static chunks under `https://x.ai/_next/static/chunks/` (deployment `c8cde9879172b45e024b98519707caaad447f3c9`), fetched 2026-11-10
- MDN browser-compat-data 8.1.8: https://github.com/mdn/browser-compat-data
- MDN `animation-timeline`: https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline
- React `<ViewTransition>`: https://react.dev/reference/react/ViewTransition
- Motion, reduce bundle size: https://motion.dev/docs/react-reduce-bundle-size
- Motion, scroll animations: https://motion.dev/docs/react-scroll-animations
- Motion, accessibility: https://motion.dev/docs/react-accessibility
- GSAP standard licence: https://gsap.com/community/standard-license/
- npm registry (versions and licences) and Bundlephobia (sizes) for `motion`, `gsap`, `lenis`, `three`, `ogl`, `@paper-design/shaders-react`, `@number-flow/react`
- Stack reference site: `docs/adr/0002-platform-native-motion.md`, `next.config.ts`, `package.json`, `src/app/projects/overload/page.tsx`
