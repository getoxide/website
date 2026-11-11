import { COPY } from "@/content/copy";
import type { Snapshot } from "@/lib/snapshot";
import { Prose } from "./Prose";

/**
 * The releases on `/changelog` (Content #12, Changelog; Design system,
 * Changelog entry), derived from a Snapshot.
 */
export function Changelog({ snapshot }: { snapshot: Snapshot }) {
  const copy = COPY.changelog;
  return (
    <Prose>
      <p>
        {copy.empty.before}{" "}
        <a href={snapshot.release.releasesUrl}>{copy.empty.link}</a>
        {copy.empty.after}
      </p>
    </Prose>
  );
}
