import { Fragment } from "react";
import { COPY } from "@/content/copy";
import { mentionedIn, seenBefore } from "@/lib/concept-links";
import { formatDate, type Snapshot } from "@/lib/snapshot";
import { AnchoredHeading } from "./AnchoredHeading";
import { Markdown } from "./Markdown";
import { Prose } from "./Prose";
import styles from "./Changelog.module.css";

const GROUPS = ["breaking", "features", "fixes"] as const;

/** A stable version (Content #12: stable only, no `-rc`, like the updater). */
const STABLE = /^\d+\.\d+\.\d+$/;

/** Newest first, by version number. */
const byVersionDesc = (a: string, b: string) => {
  const [x, y] = [a, b].map((v) => v.split(".").map(Number));
  return y[0] - x[0] || y[1] - x[1] || y[2] - x[2];
};

/**
 * Releases the page shows, newest first (Budgets, HTML: past the ceiling the
 * page keeps the latest N releases; the ceiling does not move). Lower it if
 * `/changelog` ever exceeds its HTML ceiling.
 */
const LATEST = 30;

/** Anchor of a version's heading: `0.4.0` → `v0-4-0`. */
const anchorOf = (version: string) => `v${version.replace(/\./g, "-")}`;

/**
 * The releases on `/changelog` (Content #12, Changelog; Design system,
 * Changelog entry), derived from a Snapshot.
 */
/** Stable releases, newest first. */
const stableOf = (snapshot: Snapshot) =>
  snapshot.changelog
    .filter((entry) => STABLE.test(entry.version))
    .sort((a, b) => byVersionDesc(a.version, b.version));

/** The release notes the page shows, in reading order. */
function sectionsOf(snapshot: Snapshot) {
  return stableOf(snapshot)
    .slice(0, LATEST)
    .flatMap((entry) =>
      GROUPS.flatMap((group) =>
        entry[group]
          ? [{ key: `${entry.version}/${group}`, notes: entry[group] }]
          : [],
      ),
    );
}

/** The Concepts terms the page's release notes mention (`mentionedIn`). */
export const changelogConcepts = (snapshot: Snapshot) =>
  mentionedIn(sectionsOf(snapshot).map((s) => s.notes));

export function Changelog({ snapshot }: { snapshot: Snapshot }) {
  const copy = COPY.changelog;
  const stable = stableOf(snapshot);
  const entries = stable.slice(0, LATEST);
  // Release notes in reading order, for the first-mention Concept links.
  const sections = sectionsOf(snapshot);
  const seen = new Map(
    seenBefore(sections.map((s) => s.notes)).map((before, i) => [
      sections[i].key,
      before,
    ]),
  );
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
              {GROUPS.every((group) => !entry[group]) ? (
                <p>{copy.maintenance}</p>
              ) : null}
              {GROUPS.map((group) => {
                const notes = entry[group];
                return notes ? (
                  <Fragment key={group}>
                    <h3>{copy.groups[group]}</h3>
                    <Markdown
                      source={notes}
                      conceptLinks={seen.get(`${entry.version}/${group}`)}
                    />
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
      {stable.length > entries.length ? (
        <div className={styles.older}>
          <Prose>
            <p>
              {copy.older.before}{" "}
              <a href={snapshot.release.releasesUrl}>{copy.older.link}</a>
              {copy.older.after}
            </p>
          </Prose>
        </div>
      ) : null}
    </>
  );
}
