// The one accessor for product facts (ADR-0003; Copy deck, Tokens). Every
// fact the site states about Oxide comes from the committed Snapshot written by
// `pnpm sync:oxide`; nothing here is typed by hand.
import data from "../../content/oxide/snapshot.json";
import releaseFixtures from "../../e2e/fixtures/releases.json";

export type ReleaseState = "stable" | "prerelease-only" | "none";

export type Installer =
  | { name: string; url: string; size: number }
  | { name: null; url: string; size: null };

export type InstallerKey =
  | "macos"
  | "windows"
  | "windowsArm64"
  | "linux"
  | "linuxDeb"
  | "linuxRpm"
  | "linuxArm64"
  | "linuxArm64Deb"
  | "linuxArm64Rpm";

export type Release = {
  version: string;
  tag: string;
  /** `YYYY-MM-DD` */
  date: string;
  url: string;
  prerelease: boolean;
  assets: Record<InstallerKey, Installer>;
};

export type Concept = { term: string; id: string; definition: string };

export type ChangelogEntry = {
  version: string;
  tag: string;
  date: string;
  url: string;
  breaking: string | null;
  features: string | null;
  fixes: string | null;
};

export type Snapshot = {
  source: {
    repo: string;
    /** The ref the sync was asked for: a stable tag, else `main`. */
    ref: string;
    /** The commit `ref` resolved to when the files were fetched. */
    commit: string;
    local?: { ref: string; commit: string };
  };
  /** Markdown of the README sections inside the `site:*` markers. */
  readme: {
    definition: string;
    features: { group: string; leadIns: string[] }[];
    install: string;
    requirements: string;
    quickStart: string;
    faq: string;
  };
  concepts: Concept[];
  release: {
    state: ReleaseState;
    releasesUrl: string;
    /** The newest stable release, else the newest pre-release. */
    latest: Release | null;
    platforms: string[];
    platformsFrom: "readme" | "release";
  };
  changelog: ChangelogEntry[];
};

/**
 * Test exports only: `SITE_RELEASE_FIXTURE=<key>` swaps the Release for one
 * of e2e/fixtures/releases.json, so Playwright can see every Release state
 * (`scripts/build-fixtures.mjs`). A deploy never sets it, and Cloudflare Workers Builds refuses.
 */
function withReleaseFixture(snapshot: Snapshot): Snapshot {
  const key = process.env.SITE_RELEASE_FIXTURE;
  if (!key) return snapshot;
  if (process.env.WORKERS_CI || process.env.CF_PAGES) {
    throw new Error("SITE_RELEASE_FIXTURE is for local test exports only");
  }
  const fixtures = releaseFixtures as Record<string, Snapshot["release"]>;
  if (!fixtures[key]) throw new Error(`No release fixture "${key}"`);
  return { ...snapshot, release: fixtures[key] };
}

/** The committed Snapshot. */
export const SNAPSHOT = withReleaseFixture(data as Snapshot);

export type TokenName =
  | "definition"
  | "platforms"
  | "requirements"
  | "version"
  | "release-date"
  | `asset-size:${InstallerKey}`;

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** A Snapshot date (`YYYY-MM-DD`) as the site writes it: "10 December 2026". */
export const formatDate = (date: string) =>
  DATE.format(new Date(`${date}T00:00:00Z`));

/** Installer size in SI megabytes, one decimal, as GitHub shows it. */
const megabytes = (bytes: number) => `${(bytes / 1_000_000).toFixed(1)} MB`;

/**
 * The token renderer for one Snapshot. `definition` and `requirements` are
 * Markdown (render them with `<Markdown>`); the rest is plain text. A token
 * with nothing to show yet (no stable release, an unresolved installer) is
 * `null`, and the caller renders its fallback.
 */
export function tokensOf(snapshot: Snapshot) {
  const { release, readme } = snapshot;
  const stable = release.state === "stable" ? release.latest : null;
  const size = (key: InstallerKey) => {
    const bytes = release.latest?.assets[key]?.size;
    return bytes == null ? null : megabytes(bytes);
  };
  return function token(name: TokenName): string | null {
    if (name.startsWith("asset-size:")) {
      return size(name.slice("asset-size:".length) as InstallerKey);
    }
    switch (name) {
      case "definition":
        return readme.definition;
      case "requirements":
        return readme.requirements;
      case "platforms": {
        const p = release.platforms;
        return p.length < 2
          ? p.join("")
          : `${p.slice(0, -1).join(", ")} and ${p.at(-1)}`;
      }
      case "version":
        return stable?.version ?? null;
      case "release-date":
        return stable ? formatDate(stable.date) : null;
      default:
        return null;
    }
  };
}

/** Renders a token from the committed Snapshot. */
export const token = tokensOf(SNAPSHOT);
