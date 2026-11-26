import { COPY, GITHUB_REPO_URL } from "@/content/copy";
import { platformDownloads } from "@/lib/downloads";
import { readmeUrl } from "@/lib/oxide";
import {
  SNAPSHOT,
  tokensOf,
  type InstallerKey,
  type Snapshot,
} from "@/lib/snapshot";
import type { ClickEvent } from "@/lib/measurement";
import { Button } from "./Button";
import { DeckText } from "./DeckText";
import styles from "./DownloadBlock.module.css";

const EXTRA_PACKAGES: {
  key: InstallerKey;
  label: string;
  event: ClickEvent;
}[] = [
  {
    key: "windowsArm64",
    label: "Windows arm64 (.exe)",
    event: "download-windows",
  },
  { key: "linuxDeb", label: "Linux x64 (.deb)", event: "download-linux" },
  { key: "linuxRpm", label: "Linux x64 (.rpm)", event: "download-linux" },
  {
    key: "linuxArm64",
    label: "Linux arm64 (AppImage)",
    event: "download-linux",
  },
  {
    key: "linuxArm64Deb",
    label: "Linux arm64 (.deb)",
    event: "download-linux",
  },
  {
    key: "linuxArm64Rpm",
    label: "Linux arm64 (.rpm)",
    event: "download-linux",
  },
];

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
  const platforms = platformDownloads(snapshot);
  if (!platforms || !latest) {
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
  const extras = EXTRA_PACKAGES.filter(
    (item) => latest.assets[item.key]?.name != null,
  );
  return (
    <div className={styles.block}>
      {/* The header's inline script has set `html[data-os]` by the time the
          buttons below are parsed, so they are ordered and styled at first
          paint (Download experience #13). */}
      <div className={styles.buttons}>
        {platforms.map(({ platform, url, sublabel, event }, i) => {
          const id = `download-${platform}-details`;
          return (
            <div
              key={platform}
              className={`${styles.option} ${styles[platform]}`}
            >
              <Button
                href={url}
                variant={i === 0 ? "primary" : "ghost"}
                platform={platform}
                icon="download"
                describedBy={id}
                event={event}
              >
                {copy.buttons[platform]}
              </Button>
              <p id={id} className={styles.sublabel}>
                {sublabel}
              </p>
            </div>
          );
        })}
        {/* Design system, Download block: a ghost GitHub button in every
            Release state, not only while there is no release. */}
        <div className={styles.github}>
          <Button
            href={GITHUB_REPO_URL}
            variant="ghost"
            icon="mark-github"
            event="github-cta"
          >
            {COPY.hero.github}
          </Button>
        </div>
      </div>
      {extras.length > 0 ? (
        <ul className={styles.extras} aria-label="Additional installers">
          {extras.map(({ key, label, event }) => {
            const size = token(`asset-size:${key}`);
            return (
              <li key={key}>
                <a href={latest.assets[key].url} data-goatcounter-click={event}>
                  {label}
                </a>
                {size ? (
                  <span className={styles.extraSize}> · {size}</span>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
      <p className={styles.line}>
        <DeckText
          source={
            prerelease
              ? copy.lines.prerelease(latest.version)
              : copy.lines.stable(token("version")!, token("release-date")!)
          }
        />
      </p>
    </div>
  );
}
