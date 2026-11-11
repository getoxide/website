import { COPY, GITHUB_REPO_URL } from "@/content/copy";
import { readmeUrl } from "@/lib/oxide";
import { OS_SCRIPT } from "@/lib/os";
import { SNAPSHOT, tokensOf, type Snapshot } from "@/lib/snapshot";
import { Button, type ClickEvent } from "./Button";
import { DeckText } from "./DeckText";
import styles from "./DownloadBlock.module.css";

type Platform = "macos" | "windows";

/** macOS is primary without JavaScript (Download experience #13). */
const PLATFORMS: Platform[] = ["macos", "windows"];

const EVENTS = {
  macos: "download-macos-arm",
  windows: "download-windows",
} as const satisfies Record<Platform, ClickEvent>;

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
  const latest = release.latest;
  if (release.state === "none" || !latest) {
    return (
      <div className={styles.block}>
        <div className={styles.buttons}>
          <Button
            href={GITHUB_REPO_URL}
            variant="primary"
            icon="mark-github"
            event="github-cta"
          >
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

  const token = tokensOf(snapshot);
  const prerelease = release.state === "prerelease-only";
  // A test pre-release names itself on the primary button; the secondary
  // button names its platform. Both labels are in the HTML and CSS shows the
  // one for the button's role, so detection swaps them without a reflow.
  const label = (platform: Platform) =>
    prerelease ? (
      <>
        <span className={styles.asPrimary}>
          {copy.buttons.prerelease(latest.version)}
        </span>
        <span className={styles.asSecondary}>{copy.buttons[platform]}</span>
      </>
    ) : (
      copy.buttons[platform]
    );
  return (
    <div className={styles.block}>
      {/* Runs while the page is parsed, before the buttons below exist, so
          they are ordered and styled at first paint (Download experience #13). */}
      <script dangerouslySetInnerHTML={{ __html: OS_SCRIPT }} />
      <div className={styles.buttons}>
        {PLATFORMS.map((platform, i) => {
          const size = token(`asset-size:${platform}`);
          const sublabel = [copy.buttons.sublabel[platform], size]
            .filter(Boolean)
            .join(" · ");
          const id = `download-${platform}-details`;
          return (
            <div
              key={platform}
              className={`${styles.option} ${styles[platform]}`}
            >
              <Button
                href={latest.assets[platform].url}
                variant={i === 0 ? "primary" : "ghost"}
                platform={platform}
                icon="download"
                describedBy={id}
                event={EVENTS[platform]}
              >
                {label(platform)}
              </Button>
              <p id={id} className={styles.sublabel}>
                {sublabel}
              </p>
            </div>
          );
        })}
      </div>
      <p className={styles.line}>
        <DeckText
          source={
            prerelease
              ? copy.lines.prerelease
              : copy.lines.stable(token("version")!, token("release-date")!)
          }
        />
      </p>
    </div>
  );
}
