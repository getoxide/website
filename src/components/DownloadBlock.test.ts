import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import releases from "../../e2e/fixtures/releases.json";
import { readmeUrl } from "@/lib/oxide";
import { SNAPSHOT, type Snapshot } from "@/lib/snapshot";
import { DownloadBlock } from "./DownloadBlock";

// Fixture Snapshots in each Release state (Copy deck, `/download` → Buttons).
const snapshotIn = (key: keyof typeof releases): Snapshot => ({
  ...SNAPSHOT,
  release: releases[key] as Snapshot["release"],
});

const render = (key: keyof typeof releases) =>
  renderToStaticMarkup(
    createElement(DownloadBlock, { snapshot: snapshotIn(key) }),
  );

/** Visible text, tags stripped and whitespace collapsed. */
const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const links = (html: string) =>
  [...html.matchAll(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g)].map(
    ([, href, inner]) => ({ href, text: textOf(inner) }),
  );

describe("DownloadBlock, no release (`none`)", () => {
  it("offers Follow on GitHub and Build from source, and no download button", () => {
    const html = render("none");
    expect(links(html)).toEqual([
      { href: "https://github.com/getoxide/oxide", text: "Follow on GitHub" },
      {
        href: readmeUrl("build-from-source"),
        text: "Build from source",
      },
    ]);
    expect(textOf(html)).toContain(
      "No release yet. Oxide is pre-release software; follow the repository to hear about the first one.",
    );
    expect(textOf(html)).not.toMatch(/Download/);
  });
});
