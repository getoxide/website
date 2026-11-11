// The one accessor for product facts (ADR-0003; Copy deck, Tokens). Every
// fact the site states about Oxide comes from the committed Snapshot written by
// `pnpm sync:oxide`; nothing here is typed by hand.
import data from "../../content/oxide/snapshot.json";

export type ReleaseState = "stable" | "prerelease-only" | "none";

export type Installer =
  | { name: string; url: string; size: number }
  | { name: null; url: string; size: null };

export type Release = {
  version: string;
  tag: string;
  /** `YYYY-MM-DD` */
  date: string;
  url: string;
  prerelease: boolean;
  assets: { macos: Installer; windows: Installer };
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
    ref: string;
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

/** The committed Snapshot. */
export const SNAPSHOT = data as Snapshot;

export type TokenName =
  | "definition"
  | "platforms"
  | "requirements"
  | "version"
  | "release-date"
  | "asset-size:macos"
  | "asset-size:windows";

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

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
  const size = (key: "macos" | "windows") => {
    const bytes = release.latest?.assets[key].size;
    return bytes == null ? null : megabytes(bytes);
  };
  return function token(name: TokenName): string | null {
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
        return stable
          ? DATE.format(new Date(`${stable.date}T00:00:00Z`))
          : null;
      case "asset-size:macos":
        return size("macos");
      case "asset-size:windows":
        return size("windows");
    }
  };
}

/** Renders a token from the committed Snapshot. */
export const token = tokensOf(SNAPSHOT);
