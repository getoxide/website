import { COPY } from "@/content/copy";
import type { ClickEvent } from "@/lib/measurement";
import { tokensOf, type Snapshot } from "@/lib/snapshot";

export type Platform = "macos" | "windows" | "linux";

/** The order without JavaScript: macOS first (Download experience #13). */
export const PLATFORMS: Platform[] = ["macos", "windows", "linux"];

/** The Measurement plan's click event of each platform's download. */
export const DOWNLOAD_EVENTS = {
  macos: "download-macos-arm",
  windows: "download-windows",
  linux: "download-linux",
} as const satisfies Record<Platform, ClickEvent>;

export type PlatformDownload = {
  platform: Platform;
  /** A direct file download, or the release page when the asset is missing. */
  url: string;
  /** "Apple Silicon · .dmg · 101.2 MB" (Copy deck, `/download` → Buttons). */
  sublabel: string;
  event: ClickEvent;
};

/**
 * The primary installer of each platform, in the no-JavaScript order, as the
 * Download block and the header Download menu link them; `null` while the
 * Snapshot has no release.
 */
export function platformDownloads(
  snapshot: Snapshot,
): PlatformDownload[] | null {
  const latest = snapshot.release.latest;
  if (snapshot.release.state === "none" || !latest) return null;
  const token = tokensOf(snapshot);
  return PLATFORMS.map((platform) => ({
    platform,
    url: latest.assets[platform].url,
    sublabel: [
      COPY.download.buttons.sublabel[platform],
      token(`asset-size:${platform}`),
    ]
      .filter(Boolean)
      .join(" · "),
    event: DOWNLOAD_EVENTS[platform],
  }));
}
