import { COPY, GITHUB_REPO_URL } from "@/content/copy";
import { readmeUrl } from "@/lib/oxide";
import { SNAPSHOT, type Snapshot } from "@/lib/snapshot";
import { Button } from "./Button";
import { DeckText } from "./DeckText";
import styles from "./DownloadBlock.module.css";

/**
 * The download buttons and the quiet line under them (Design system, Download
 * block; Copy deck, `/download` → Buttons), rendered from the Release state in
 * the Snapshot. Every link is in the static HTML.
 */
export function DownloadBlock({
  snapshot = SNAPSHOT,
}: {
  snapshot?: Snapshot;
}) {
  const copy = COPY.download;
  const { release } = snapshot;
  if (release.state === "none" || !release.latest) {
    return (
      <div className={styles.block}>
        <div className={styles.buttons}>
          <Button href={GITHUB_REPO_URL} variant="primary" icon="mark-github">
            {copy.buttons.followGithub}
          </Button>
          <Button href={readmeUrl("build-from-source")} variant="ghost">
            {copy.buttons.buildFromSource}
          </Button>
        </div>
        <p className={styles.line}>
          <DeckText source={copy.lines.none} />
        </p>
      </div>
    );
  }
  return null;
}
