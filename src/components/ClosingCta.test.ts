import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import releases from "../../e2e/fixtures/releases.json";
import { SNAPSHOT, type Snapshot } from "@/lib/snapshot";
import { ClosingCta } from "./ClosingCta";

const render = (key: keyof typeof releases) =>
  renderToStaticMarkup(
    createElement(ClosingCta, {
      snapshot: {
        ...SNAPSHOT,
        release: releases[key] as Snapshot["release"],
      },
    }),
  );

const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const links = (html: string) =>
  [...html.matchAll(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g)].map(
    ([, href, inner]) => ({ href, text: textOf(inner) }),
  );

// Copy deck, Closing CTA block (locked).
describe("ClosingCta", () => {
  it("states the heading and the sentence", () => {
    const html = render("stable");
    expect(html).toMatch(
      /<h2[^>]*>Take your next Turn all the way to the merge\.<\/h2>/,
    );
    expect(textOf(html)).toContain(
      "Oxide drives the Claude Code, Codex or Antigravity CLI you already use. Open a Project, start a Thread and review what comes back.",
    );
  });

  it.each(["stable", "prerelease-only", "unresolved"] as const)(
    "reads Download Oxide when there is a release (%s)",
    (key) => {
      expect(links(render(key))).toEqual([
        { href: "/download", text: "Download Oxide" },
        { href: "https://github.com/getoxide/oxide", text: "View on GitHub" },
      ]);
    },
  );

  it("reads Get Oxide while there is no release at all", () => {
    expect(links(render("none"))).toEqual([
      { href: "/download", text: "Get Oxide" },
      { href: "https://github.com/getoxide/oxide", text: "View on GitHub" },
    ]);
  });

  it("counts View on GitHub as the GitHub CTA", () => {
    expect(render("none")).toMatch(
      /<a [^>]*href="https:\/\/github.com\/getoxide\/oxide"[^>]*data-goatcounter-click="github-cta"/,
    );
  });
});
