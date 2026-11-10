# Tiered motion toolset: native first, own shader, Motion only on demand

The site aims for x.ai's level of motion quality, so it does not inherit the personal site's "no animation library" rule (`cavallinilorenzo.com` ADR-0002). Research showed that x.ai reaches that level with Motion, two raw-WebGL shaders and CSS keyframes, and that all of it is reachable with platform-native APIs. Motion adds convenience, not capability. So motion is built in three tiers:

1. **Platform-native baseline**: CSS transitions and keyframes, scroll-driven animations only inside `@supports`, React `<ViewTransition>`, IntersectionObserver.
2. **One in-house raw-WebGL fragment-shader component**, no 3D library.
3. **Motion** (the library, ex Framer Motion), pre-approved but **not installed up front**. It comes in only when a chosen effect needs exit choreography, layout animation (`layoutId`) or springs and interruptible gestures, and the native version would be clearly more code or worse. Even then it is used only as `LazyMotion` + `m` + `domAnimation` (`domMax` only for real drag or layout needs, never the full `motion` import), it loads only on the pages that use it, and the PR adding it names the effect that justifies it.

GSAP, Lenis or any smooth-scroll library, Three.js/OGL, Lottie/Rive, Paper Shaders and `number-flow` are rejected for v1. GSAP's licence is also free but proprietary. Bringing any of them in takes a new decision.

## Rules that follow

- **Content is visible by default.** All text and product captures are in the static HTML and visible without JavaScript. Animation only enhances: the server HTML never carries `opacity:0`, and no content waits for hydration. The hero headline reveal is CSS-only, replays on every full load of the home (not on client navigation), lasts about 1 s at most, and never delays the download CTA.
- **Scroll is never hijacked.** Native scrolling only. Scroll-triggered reveals play once per page view and do not reverse. They are never used above the fold, and their hidden start state applies only when JavaScript runs and motion is allowed. No pinned or scrubbed scroll scenes in v1.
- **Where motion lives.** The home hero, section reveals on the home and landing pages, product captures, page transitions and micro-interactions (hover, focus, copy, navigation). Reading pages (FAQ, changelog, docs, legal) get only page transitions and micro-interactions.
- **Product captures are real recordings** (`<video muted playsinline loop>` with a poster, played and paused by IntersectionObserver) or real stills, never DOM re-creations of the app UI.
- **Shader.** At most one animated shader per page. It mounts lazily over a CSS gradient placeholder and pauses when off-screen or when the tab is hidden.
- **Reduced motion** (`prefers-reduced-motion: reduce`) is handled by hand, because React does not do it for `<ViewTransition>`. Only opacity fades of up to 200 ms remain. Reveals become instant, the shader shows one still frame, videos show the poster and a play button instead of autoplaying, page transitions become a cross-fade, and marquee and shimmer stop. When Motion is used, it also gets `MotionConfig reducedMotion="user"`.
- **No polyfills.** An unsupported feature means the static version: an instant page swap without View Transitions, the CSS gradient without WebGL.

## Considered options

- **Native only**, as on the personal site: rejected because a shader background and occasional exit or layout choreography are part of the motion bar.
- **Motion from day one**: rejected because it costs about 30 kB on every page for effects that tiers 1 and 2 already cover.

Numeric budgets (Core Web Vitals, kB per page) and shared duration and easing tokens are left to the performance and design-system work.
