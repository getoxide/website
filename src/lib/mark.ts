// The Oxide Braces mark's geometry, shared by the home hero's inline SVG
// (`OxideMark`) and the generated share card, so the card is the site's own
// mark rather than a redrawn copy. The geometry is the brand's (the mark
// inside `oxide-logo.svg`, synced from getoxide/oxide).
export const MARK_VIEWBOX = "232 232 560 560";

/** The two brace strokes, drawn as one ink gradient. */
export const MARK_BRACES = [
  "M424 291H384A62 62 0 0 0 322 353V450A62 62 0 0 1 260 512A62 62 0 0 1 322 574V671A62 62 0 0 0 384 733H424",
  "M600 291H640A62 62 0 0 1 702 353V450A62 62 0 0 0 764 512A62 62 0 0 0 702 574V671A62 62 0 0 1 640 733H600",
] as const;

/** The two eye strokes, drawn in the site's text colour. */
export const MARK_EYES = ["M448 472V552", "M576 472V552"] as const;
