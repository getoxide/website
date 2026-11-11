import { CAPTURE_SLOTS } from "@/content/captures";
import { loadCaptureManifest } from "@/lib/capture-manifest";
import {
  captureFile,
  frameSizes,
  srcSetOf,
  type CaptureEntry,
  type CaptureManifest,
} from "@/lib/captures";
import { CaptureVideo } from "./CaptureVideo";
import styles from "./Capture.module.css";

const ALTS: Record<string, string> = Object.fromEntries(
  Object.entries(CAPTURE_SLOTS).map(([slot, { alt }]) => [slot, alt]),
);

/** The variant a still falls back to, and a video's poster: about 1280px. */
function middle(entry: CaptureEntry): number {
  return (
    entry.widths.find((w) => w >= 1280) ?? entry.widths[entry.widths.length - 1]
  );
}

/**
 * A real product capture in its frame (Design system, Capture frame; Budgets,
 * Product captures). A slot with no source file is not in the manifest and
 * renders nothing: never a placeholder or a mock-up. A still is a `<picture>`
 * with AVIF then WebP, an accurate `sizes` and the source's dimensions
 * reserved. A video is a muted loop with a poster that a client island plays
 * and pauses.
 * @param slot a key of `CAPTURE_SLOTS`
 * @param priority above the fold: not lazy-loaded
 */
export function Capture({
  slot,
  priority = false,
  sizes = frameSizes,
  manifest = loadCaptureManifest(),
  alts = ALTS,
}: {
  slot: string;
  priority?: boolean;
  sizes?: string;
  manifest?: CaptureManifest;
  alts?: Record<string, string>;
}) {
  const entry = manifest[slot];
  if (!entry) return null;
  const alt = alts[slot] ?? "";
  const fallback = captureFile(slot, middle(entry), "webp");

  if (entry.kind === "video") {
    return (
      <div className={styles.frame}>
        <CaptureVideo
          sources={entry.sources ?? []}
          poster={captureFile(slot, middle(entry), "avif")}
          width={entry.width}
          height={entry.height}
          label={alt}
        />
      </div>
    );
  }
  return (
    <div className={styles.frame}>
      <picture>
        <source
          type="image/avif"
          srcSet={srcSetOf(slot, entry, "avif")}
          sizes={sizes}
        />
        <source
          type="image/webp"
          srcSet={srcSetOf(slot, entry, "webp")}
          sizes={sizes}
        />
        <img
          className={styles.media}
          src={fallback}
          width={entry.width}
          height={entry.height}
          alt={alt}
          decoding="async"
          loading={priority ? undefined : "lazy"}
        />
      </picture>
    </div>
  );
}
