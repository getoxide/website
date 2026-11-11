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

const allLinks = (html: string) =>
  [...html.matchAll(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g)].map(
    ([, href, inner]) => ({ href, text: textOf(inner) }),
  );
const CONCEPT = "/docs/concepts#";
/** The CTA's buttons, without the Concept links in its copy. */
const links = (html: string) =>
  allLinks(html).filter((l) => !l.href.startsWith(CONCEPT));
const conceptLinks = (html: string) =>
  allLinks(html).filter((l) => l.href.startsWith(CONCEPT));

// Copy deck, Closing CTA block (locked).
describe("ClosingCta", () => {
  it("states the heading and the sentence", () => {
    const html = render("stable");
    const heading = html.match(/<h2[^>]*>(.*?)<\/h2>/)![1];
    expect(textOf(heading)).toBe(
      "Take your next Turn all the way to the merge.",
    );
    const sentence = html.match(/<p[^>]*>(.*?)<\/p>/)![1];
    expect(sentence.replace(/<[^>]+>/g, "")).toBe(
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

  // Content #12 addendum, point 4: on a page that mentions none of them
  // before, the CTA holds the first mentions of Turn, Project and Thread.
  it("links its first mention of Turn, Project and Thread", () => {
    expect(conceptLinks(render("stable"))).toEqual([
      { href: "/docs/concepts#turn", text: "Turn" },
      { href: "/docs/concepts#project", text: "Project" },
      { href: "/docs/concepts#thread", text: "Thread" },
    ]);
  });

  it("counts View on GitHub as the GitHub CTA", () => {
    expect(render("none")).toMatch(
      /<a [^>]*href="https:\/\/github.com\/getoxide\/oxide"[^>]*data-goatcounter-click="github-cta"/,
    );
  });
});
