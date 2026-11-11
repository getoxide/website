# PROTOTYPE · Social and share assets

Throwaway. Answers [Social and share assets](https://github.com/getoxide/website/issues/23): what a pasted link looks like, which icons ship, how titles and descriptions render. Never merged; the decision lands in the spec.

## Run

```sh
pnpm proto:social          # http://localhost:4312/
pnpm proto:social:render   # re-renders assets/shader-still.png and out/*.png|jpg + out/sizes.json
```

`render.py` needs Python Playwright with Google Chrome installed (`channel="chrome"`) and Pillow.

## What's on the page

- **Bottom bar / `?variant=`**: the card design.
  - **A · Plate**: site-wide, static. Flat background, logo, frozen hero line, host.
  - **B · Passivation**: site-wide, static. A still of the direction-C shader, centred mark and hero line, like the live hero.
  - **C · Page title**: one card per page, generated at build from `PAGES`. Logo, the page's H1, URL. The shader fades in from the right.
  - **D · Capture**: site-wide. Hero line on the shader, the real capture rising off the bottom edge.
- **Top bar**: page (`?page=`), og:title mode (`?mode=bare|full|h1`), feed theme, icon option (`?icons=I1|I2|I3`).
- **Sections**:
  1. the card at 1200×630 with crop guides;
  2. approximate unfurl mocks (Slack, X, LinkedIn, iMessage, Discord, WhatsApp small preview, Google);
  3. the icons at real size (Chrome tabs, iOS home screen, raw 16/32/48);
  4. the exact `<head>` tags and the files the build would emit.

The shader still is one frame (t = 6 s) of the verbatim FRAG from `prototype/visual-direction`, rendered at 1200×630.

## Measured

PNG / JPEG q82 at 1200×630, from `out/sizes.json`:

| Card | PNG | JPEG |
| --- | --- | --- |
| A | 34 KB | 31 KB |
| B | 194 KB | 41 KB |
| C (each of 10) | 122–149 KB | 27–49 KB |
| D | 264 KB | 81 KB |

All are far below the platform limits: LinkedIn 5 MB and at least 1200×627, Next's `twitter-image` 5 MB, `opengraph-image` 8 MB.
