// Product captures (docs/spec/budgets.md, Product captures). Source PNGs live
// in `assets/captures/`; `scripts/build-captures.mjs` turns each into AVIF and
// WebP variants plus a manifest in `public/captures/` at build time (output not
// committed). This module is the shared, dependency-free part: the widths, the
// file names and the `srcset`, used by the pipeline and the Capture component.

export const CAPTURE_WIDTHS = [640, 960, 1280, 1920, 2560];
export const CAPTURE_FORMATS = ["avif", "webp"] as const;
export type CaptureFormat = (typeof CAPTURE_FORMATS)[number];

/** Where the pipeline writes, as a URL path. */
export const CAPTURES_URL = "/captures";

/** One slot as the manifest records it. */
export type CaptureEntry = {
  kind: "image" | "video";
  /** Intrinsic size of the source: the reserved box. */
  width: number;
  height: number;
  /** The variant widths actually generated (never above the source). */
  widths: number[];
  /** Video only: the files, in `<source>` order, with their MIME types. */
  sources?: { src: string; type: string }[];
};

export type CaptureManifest = Record<string, CaptureEntry>;

/** The widths to generate for a source: the listed ones it can fill. */
export function widthsFor(sourceWidth: number): number[] {
  const fit = CAPTURE_WIDTHS.filter((w) => w <= sourceWidth);
  return fit.length > 0 ? fit : [sourceWidth];
}

export const captureFile = (
  slot: string,
  width: number,
  format: CaptureFormat,
) => `${CAPTURES_URL}/${slot}-${width}.${format}`;

export const srcSetOf = (
  slot: string,
  entry: Pick<CaptureEntry, "widths">,
  format: CaptureFormat,
) =>
  entry.widths.map((w) => `${captureFile(slot, w, format)} ${w}w`).join(", ");

/**
 * `sizes` of a capture frame (Design system, Capture frame): at most
 * `--site-w-frame` (1160px), the page width minus the gutter
 * (`clamp(20px, 4vw, 56px)`) on each side below that.
 */
export const frameSizes =
  "(min-width: 1260px) 1160px, (min-width: 500px) 92vw, calc(100vw - 40px)";
