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
});
