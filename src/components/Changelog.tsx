import { Fragment } from "react";
import { COPY } from "@/content/copy";
import { formatDate, type Snapshot } from "@/lib/snapshot";
import { AnchoredHeading } from "./AnchoredHeading";
import { Markdown } from "./Markdown";
import { Prose } from "./Prose";
import styles from "./Changelog.module.css";

const GROUPS = ["breaking", "features", "fixes"] as const;

/** Anchor of a version's heading: `0.4.0` → `v0-4-0`. */
const anchorOf = (version: string) => `v${version.replace(/\./g, "-")}`;

/**
 * The releases on `/changelog` (Content #12, Changelog; Design system,
 * Changelog entry), derived from a Snapshot.
 */
export function Changelog({ snapshot }: { snapshot: Snapshot }) {
  const copy = COPY.changelog;
  const entries = snapshot.changelog;
  if (!entries.length) {
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
  return (
    <>
      {entries.map((entry) => {
        const id = anchorOf(entry.version);
        return (
          <section key={id} className={styles.entry} aria-labelledby={id}>
            <AnchoredHeading id={id} label={copy.anchorLabel(entry.version)}>
              {entry.version} ·{" "}
              <time dateTime={entry.date}>{formatDate(entry.date)}</time>
            </AnchoredHeading>
            <Prose>
              {GROUPS.map((group) => {
                const notes = entry[group];
                return notes ? (
                  <Fragment key={group}>
                    <h3>{copy.groups[group]}</h3>
                    <Markdown source={notes} />
                  </Fragment>
                ) : null;
              })}
              <p>
                <a href={entry.url} aria-describedby={id}>
                  {copy.fullNotes}
                </a>
              </p>
            </Prose>
          </section>
        );
      })}
    </>
  );
}
