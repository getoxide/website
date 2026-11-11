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
