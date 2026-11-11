import { readFileSync } from "node:fs";
import type { Snapshot } from "../src/lib/snapshot";

/** The committed Snapshot, read from disk (Playwright's loader cannot import
 * JSON modules without import attributes). */
export const SNAPSHOT = JSON.parse(
  readFileSync(
    new URL("../content/oxide/snapshot.json", import.meta.url),
    "utf8",
  ),
) as Snapshot;

/** `content/oxide/source.json`: the same source the site's links use. */
export const SOURCE = JSON.parse(
  readFileSync(
    new URL("../content/oxide/source.json", import.meta.url),
    "utf8",
  ),
) as { repo: string; ref: string; commit: string };

const STABLE_TAG = /^v\d+\.\d+\.\d+$/;

/** A tag never moves; a branch does, so link at the synced commit. */
export const OXIDE_LINK_REF = STABLE_TAG.test(SOURCE.ref)
  ? SOURCE.ref
  : SOURCE.commit;

/** A GitHub file URL of the Oxide repo, at the synced ref (mirrors
 * `src/lib/oxide.ts` without importing its JSON module). */
export function oxideFileUrl(path: string): string {
  return `https://github.com/${SOURCE.repo}/blob/${OXIDE_LINK_REF}/${path}`;
}
