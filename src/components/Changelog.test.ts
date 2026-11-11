import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SNAPSHOT, type ChangelogEntry, type Snapshot } from "@/lib/snapshot";
import { Changelog } from "./Changelog";

// /changelog (Content #12, Changelog; Design system, Changelog entry),
// rendered from fixture Snapshots: the committed one has no release yet.

const RELEASES = "https://github.com/getoxide/oxide/releases";

function withChangelog(changelog: ChangelogEntry[]): Snapshot {
  return { ...SNAPSHOT, changelog };
}

function release(
  version: string,
  date: string,
  notes: Partial<Pick<ChangelogEntry, "breaking" | "features" | "fixes">> = {},
): ChangelogEntry {
  return {
    version,
    tag: `v${version}`,
    date,
    url: `${RELEASES}/tag/v${version}`,
    breaking: null,
    features: null,
    fixes: null,
    ...notes,
  };
}

const html = (snapshot: Snapshot) =>
  renderToStaticMarkup(createElement(Changelog, { snapshot }));

/** Visible text of some markup, tags dropped and whitespace collapsed. */
const text = (markup: string) =>
  markup
    .replace(/<\/(p|h\d|li|ul|div|section)>/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

describe("Changelog", () => {
  it("with no stable release, says so in one line linking GitHub Releases", () => {
    const markup = html(withChangelog([]));
    expect(markup).not.toMatch(/<h2/);
    expect(markup.match(/<p[ >]/g)).toHaveLength(1);
    expect(text(markup)).toBe(
      "No stable release yet. New versions will be listed here and on GitHub Releases.",
    );
    expect(markup).toContain(`<a href="${RELEASES}">GitHub Releases</a>`);
  });

  it("renders a release as an anchored version heading with its date, the three groups and its GitHub link", () => {
    const markup = html(
      withChangelog([
        release("0.4.0", "2026-12-10", {
          breaking: "- Settings moved to `~/.oxide`.",
          features: "- **Blind review** by a second Provider.",
          fixes: "- The Diff no longer flickers.",
        }),
      ]),
    );
    expect(markup).toMatch(
      /<h2 id="v0-4-0"[^>]*>0\.4\.0 · <time dateTime="2026-12-10">10 December 2026<\/time><\/h2>/,
    );
    expect(markup).toContain(
      'href="#v0-4-0" aria-label="Link to version 0.4.0"',
    );
    expect(text(markup)).toContain(
      "Breaking changes Settings moved to ~/.oxide. Features Blind review by a second Provider. Fixes The Diff no longer flickers.",
    );
    expect(markup.match(/<h3[^>]*>[^<]*<\/h3>/g)).toEqual([
      expect.stringContaining(">Breaking changes<"),
      expect.stringContaining(">Features<"),
      expect.stringContaining(">Fixes<"),
    ]);
    expect(markup).toMatch(
      new RegExp(
        `<a href="${RELEASES}/tag/v0\\.4\\.0"[^>]*>Full release notes on GitHub</a>`,
      ),
    );
    expect(text(markup)).not.toContain("No stable release yet");
  });

  it("lists stable releases only, newest first, and a release without groups as a maintenance release", () => {
    const markup = html(
      withChangelog([
        release("0.9.0", "2026-12-01", { fixes: "- A fix." }),
        release("0.10.0-rc.1", "2027-01-20", { features: "- Not yet." }),
        release("0.10.0", "2027-02-03", { features: "- New." }),
        release("0.9.1", "2026-12-15"),
      ]),
    );
    const ids = [...markup.matchAll(/<h2 id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids).toEqual(["v0-10-0", "v0-9-1", "v0-9-0"]);
    expect(markup).not.toContain("-rc");
    expect(text(markup)).not.toContain("Not yet.");

    const maintenance = markup.split('<h2 id="v0-9-1"')[1].split("<h2 ")[0];
    expect(maintenance).not.toMatch(/<h3/);
    expect(text(maintenance)).toContain(
      "Maintenance release: dependency and documentation updates. Full release notes on GitHub",
    );
    expect(maintenance).toContain(`href="${RELEASES}/tag/v0.9.1"`);
    expect(markup.match(/Maintenance release/g)).toHaveLength(1);
  });
});
