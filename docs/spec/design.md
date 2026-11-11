# Design system

How direction C · Passivation becomes the site's tokens and components. Decided in [Design system](https://github.com/getoxide/website/issues/21), on top of [Visual direction](https://github.com/getoxide/website/issues/11), [Motion approach](https://github.com/getoxide/website/issues/10) and [ADR-0001](../adr/0001-tiered-motion-toolset.md).

Build issues **cite** this file by section anchor; they never copy it. A change here is a PR to this file, approved by Lorenzo.

The reference implementation is the prototype at [`prototype/visual-direction@90559ae`](https://github.com/getoxide/website/tree/90559ae/prototypes/visual-direction) (`?variant=C`). Where this file and the prototype disagree, this file wins; where this file is silent, match the prototype. Performance and accessibility numbers live in [Performance and accessibility budgets](https://github.com/getoxide/website/issues/22), not here.

## Theme

**Dark only.** `color-scheme: dark` on `<html>`, no theme toggle, no `prefers-color-scheme` switch. A light theme is out of scope for v1.

## Tokens

Two families of CSS custom properties, and nothing else. No hex value, duration or easing appears in a component stylesheet.

| Family | Source | Holds |
| --- | --- | --- |
| `--ox-*` | The Oxide brand kit, synced (below) | Every colour, plus the font stacks |
| `--site-*` | `src/styles/tokens.css` in this repo | Type scale, spacing, radii, widths, motion |

### Colour: `--ox-*`, synced, used directly

- `assets/brand/oxide/palette/oxide-tokens.css` from the Oxide repo is copied **verbatim** into the content snapshot by the existing `pnpm sync:oxide` workflow ([Content sourced from the Oxide repo](https://github.com/getoxide/website/issues/12)), at the same ref as the rest of the snapshot. A missing file fails the sync like a missing marker does.
- The site imports that file once, globally, and component CSS uses the `--ox-*` names **directly**: no site aliases for colours.
- Its `[data-theme="light"]` block is imported but inert: the site never sets `data-theme="light"`.
- A Vitest test fails if any `var(--ox-…)` used in the site's CSS is not defined in the synced file.
- Contrast is the brand's guarantee: text, status and syntax colours reach 4.5:1 on background, surface and elevated surface.

Roles the components use:

| Use | Token |
| --- | --- |
| Page background | `--ox-background` |
| Capture frame fill, code block fill | `--ox-surface-background` |
| Hover fill (ghost and nav buttons) | `--ox-element-background` |
| Body text | `--ox-text` |
| Headings, current nav link | `--ox-text-bright` |
| Secondary text | `--ox-text-muted` |
| Footer, trust line, captions | `--ox-text-disabled` (the brand's "faint text") |
| Hairlines, section and header borders | `--ox-border` |
| Button and frame borders, proof-path line and nodes | `--ox-element-border` |
| Primary button fill / hover / pressed | `--ox-accent` / `--ox-accent-hover` / `--ox-accent-pressed` |
| Primary button text | `--ox-accent-foreground` |
| Links in prose, lit proof-path nodes | `--ox-text-accent` |
| Focus ring | `--ox-focus-ring` |
| Code syntax | `--ox-syntax-*` |

Blue is the action colour: it never tints the mark, and in the shader it stays restrained, as in the prototype.

### Typography

Three variable fonts, Latin subset, self-hosted with `next/font/local`, `font-display: swap`, all SIL OFL 1.1 (licence texts committed beside the files). Stacks come from `--ox-font-web-heading`, `--ox-font-web-body` and `--ox-font-code`.

- **Space Grotesk 500**, tracking −0.03 em: every heading and the wordmark. Never body text.
- **Inter 400**, 500 for buttons and nav.
- **JetBrains Mono 400**, ligatures off (`font-feature-settings: "calt" 0`).

| Token | Face | Size / line height | Use |
| --- | --- | --- | --- |
| `--site-text-display` | Space Grotesk | `clamp(40px, 5.3vw, 76px)` / 1.04 | Home hero H1 only; `text-wrap: balance`, max 14 em |
| `--site-text-h1` | Space Grotesk | `clamp(32px, 4vw, 52px)` / 1.1 | H1 on every other page |
| `--site-text-h2` | Space Grotesk | `clamp(28px, 3.2vw, 44px)` / 1.15 | Section headings |
| `--site-text-h3` | Space Grotesk | 22px / 1.2 | Proof-path steps, feature sub-heads |
| `--site-text-lead` | Inter | 18px / 1.55 | Hero sub-line, page intros |
| `--site-text-body` | Inter | 16px / 1.55 | Default |
| `--site-text-small` | Inter | 15px / 1.6 | Step descriptions, definition line |
| `--site-text-caption` | Inter | 13px / 1.5 | Footer, quiet lines under CTAs |
| `--site-text-mono` | JetBrains Mono | 14px / 1.6 | Code blocks, inline code |
| `--site-text-mono-xs` | JetBrains Mono | 12px / 1.5 | Trust line |

### Spacing

| Token | Value |
| --- | --- |
| `--site-space-1` … `--site-space-10` | 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px |
| `--site-gutter` | `clamp(20px, 4vw, 56px)`: horizontal page padding |
| `--site-section` | `clamp(72px, 9vw, 128px)`: vertical gap between home sections |

### Radii

| Token | Value | Use |
| --- | --- | --- |
| `--site-radius-pill` | 999px | Every button |
| `--site-radius-frame` | 12px | Capture frames (image and video) |
| `--site-radius-sm` | 8px | Code blocks, chips |

Round things (proof-path nodes) use `50%`. No other radius exists.

### Widths

| Token | Value | Use |
| --- | --- | --- |
| `--site-w-wide` | 1240px | Proof path, feature sections |
| `--site-w-frame` | 1160px | Capture frames |
| `--site-w-text` | 820px | Centred text blocks (definition line) |
| `--site-w-prose` | 68ch | Docs, guides, changelog, FAQ |

One breakpoint: **860px** (header collapses, proof path goes vertical). CSS custom properties cannot drive media queries, so it is a documented constant, not a token.

### Motion

| Token | Value | Use |
| --- | --- | --- |
| `--site-dur-fast` | 150ms | Hover and colour changes |
| `--site-dur-base` | 600ms | Fades, shader fade-in, step text |
| `--site-dur-slow` | 900ms | Capture reveal, proof-path line draw |
| `--site-dur-reduced` | 200ms | The only duration under reduced motion (opacity only) |
| `--site-stagger` | 220ms | Delay between proof-path steps |
| `--site-ease-out` | `cubic-bezier(.2, .7, .2, 1)` | Reveals, hero word fade |
| `--site-ease-in-out` | `cubic-bezier(.65, 0, .2, 1)` | Line draw |
| `--site-ease-fade` | `ease` | Opacity-only fades |

The mark's eye timings are **local to the animated mark**, not tokens. If Motion (tier 3) is ever installed, it reads these values from a small TS module with a test asserting parity with `tokens.css`; that module does not exist until then. Reduced-motion behaviour is fixed by Motion approach and not restated here.

## Components

Sixteen. Each is a React component with a CSS Module. All content renders without JavaScript; JS only adds motion and the copy button.

### Header

- Logo (`oxide-logo.svg`, 26px tall) left; nav right: Features · Docs · Guides · Changelog, then the **Download** nav button ([Page inventory](https://github.com/getoxide/website/issues/9)).
- **Not sticky** on any page.
- Home: absolutely positioned and transparent over the hero shader. Other pages: the same header in flow on `--ox-background`, with a bottom border in `--ox-border`.
- Current page link: `--ox-text-bright` and `aria-current="page"`.
- Below 860px: the four links collapse into a `<details>` menu (works without JS) that opens a full-width panel; the Download button stays visible.

### Button

Inter 500 15px, height 46px, padding 0 22px, `--site-radius-pill`, transitions `--site-dur-fast`.

| Variant | Look |
| --- | --- |
| `primary` | `--ox-accent` fill, hover and pressed accents, `--ox-accent-foreground` text |
| `ghost` | Translucent `--ox-background` fill, `--ox-element-border` border, `--ox-element-background` on hover |
| `nav` | The header pill: 14px, padding 8px 18px, ghost colours |

Icons inside buttons sit 8px from the label.

### Icon

GitHub **Octicons** (MIT), 16px, `fill: currentColor`, each imported as an inline SVG at build time. No sprite fetched at runtime, no icon library at runtime.

### Animated mark

The Braces mark inline as SVG, 120px, centred above the hero H1. The eyes blink and glance on two independent loops (11 s glance, 7 s blink), as in the prototype. **Home hero only**; static under reduced motion; never animated anywhere else. The exception is recorded in the Oxide brand guide (`assets/brand/oxide/README.md`, Motion section); this file does not restate it.

### Hero shader

The full-bleed raw-WebGL thin-film shader behind the home hero, tier 2 of ADR-0001. Its parameters and the performance settings are those of `c-shader.js` at the reference commit. A static radial-gradient fallback in `--ox-*` colours is always painted underneath, so the hero is complete without WebGL or JS; the canvas fades in over `--site-dur-base` once ready.

### Capture frame

A real product capture in a frame: `--site-w-frame`, `--site-radius-frame`, `--ox-surface-background`, `--ox-element-border` border with a lighter top edge, and a deep drop shadow, as in the prototype. Two variants: **image** and **video**, the latter behaving as decided in Motion approach. On the home it rises over the hero (−150px, −110px below 860px). Never a mock-up or a DOM recreation of the app.

### Definition line

The canonical definition (`⟨definition⟩`, centred, `--site-w-text`, `--site-text-small`, `--ox-text-muted`), followed by the trust line in `--site-text-mono-xs`, `--ox-text-disabled`.

### Proof path

The four-step "From prompt to merge" path: a hairline with a node per step. Each step has an icon, a `--site-text-h3` title and a `--site-text-small` description. Four columns at `--site-w-wide`; vertical below 860px. On reveal the line draws (`--site-dur-slow`, `--site-ease-in-out`) and the nodes light in `--ox-text-accent` one `--site-stagger` apart. Step order and text are in the Copy deck.

### Download block

The CTA block from [Download experience and pre-release state](https://github.com/getoxide/website/issues/13) and the Copy deck: a primary button for the detected OS, a ghost GitHub button, and the quiet line underneath, rendering each release state. Used on the home, the landing pages, the guides and `/download`.

### Page header

H1 (`--site-text-h1`) plus an optional lead paragraph, at the top of every page except the home.

### Feature section

An anchored section on `/features`: `<h2 id>`, the README lead-in, a capture frame. Anchors are fixed in the Copy deck.

### Prose

Styles for MDX and derived Markdown on docs, guides, changelog and FAQ, at `--site-w-prose`: heading rhythm from the type scale, links in `--ox-text-accent`, inline code in `--site-text-mono`, tables with `--ox-border` rules.

- `/docs/*`: under the page header, a two-link sub-nav (Quick start · Concepts). **No sidebar and no table of contents.**
- Concepts: each of the nine terms is an `<h2 id>` with an anchor link revealed on hover and focus.
- Guides: linear prose, ending with a link to the other guide and the download block.

### Code block

Highlighted **at build time** with Shiki, using a theme generated from the `--ox-syntax-*` tokens, so no highlighting JS reaches the browser. `--site-text-mono`, `--ox-surface-background`, `--site-radius-sm`. A **Copy** button appears only when JS is available.

### FAQ

Headings and visible answers, no JS. Each question is a heading with an `id` and an anchor link, revealed on hover and focus as on Concepts; each answer is Prose, visible text in the HTML, never collapsed (no `<details>`). Decided on [Oxide website v1](https://github.com/getoxide/website/issues/29); the page FAQs in the Copy deck follow the same rule.

### Changelog entry

One release on `/changelog`: version and date as a heading with an anchor, then the Breaking / Features / Fixes groups from the snapshot, in Prose.

### Concept link

The link on the first capitalised mention of a Concepts term, to `/docs/concepts#<term>`. Styled as a normal prose link; the rule for when it appears is in the Copy deck.

### Footer

Three columns as decided in Page inventory, with the disclaimers and the trust lines; `--site-text-caption`, `--ox-text-disabled`, a top border in `--ox-border`.

### 404

The page header and the locked 404 copy from the Copy deck, plus a link home. No shader.

## Focus and states

- `:focus-visible`: 2px solid `--ox-focus-ring`, 2px offset, on every interactive element.
- Hover never carries information that focus does not also show.
