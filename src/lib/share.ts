// Social and share assets #23, resolution: one site-wide 1200×630 PNG, the
// same on every page, set once through `pageMetadata` rather than Next's
// `opengraph-image` file convention (undocumented under `output: 'export'`).
import { SITE_URL } from "@/content/pages";

export const SHARE_CARD = {
  path: "/og.png",
  url: `${SITE_URL}/og.png`,
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "Oxide: The complete desktop app for agentic coding.",
} as const;

/** `og:image`, with the dimensions and alt a card debugger reads. */
export function shareCardOpenGraph() {
  return [
    {
      url: SHARE_CARD.url,
      width: SHARE_CARD.width,
      height: SHARE_CARD.height,
      type: SHARE_CARD.type,
      alt: SHARE_CARD.alt,
    },
  ];
}

/** `twitter:image`; the card is already a large summary image. */
export function shareCardTwitter() {
  return [{ url: SHARE_CARD.url, alt: SHARE_CARD.alt }];
}
