import { describe, expect, it } from "vitest";
import { extractSection } from "./sync-oxide.mjs";

describe("extractSection", () => {
  it("returns the text between the exact site markers, trimmed", () => {
    const readme = [
      "## What is Oxide?",
      "",
      "<!-- site:definition -->",
      "",
      "Oxide is a desktop app.",
      "",
      "<!-- /site:definition -->",
      "",
      "Most agent tools…",
    ].join("\n");
    expect(extractSection(readme, "definition")).toBe(
      "Oxide is a desktop app.",
    );
  });

  it("ignores a bare `site:` mention, such as the README's top note", () => {
    const readme = [
      "<!-- The site:* markers below feed the Oxide website.",
      "     Do not remove site:definition or rename it. -->",
      "",
      "Intro site:definition text.",
      "<!-- site:definition -->",
      "The real definition.",
      "<!-- /site:definition -->",
    ].join("\n");
    expect(extractSection(readme, "definition")).toBe("The real definition.");
  });

  it("does not take a longer key for a shorter one", () => {
    const readme = [
      "<!-- site:quick-start-extra -->",
      "Wrong.",
      "<!-- /site:quick-start-extra -->",
      "<!-- site:quick-start -->",
      "Right.",
      "<!-- /site:quick-start -->",
    ].join("\n");
    expect(extractSection(readme, "quick-start")).toBe("Right.");
  });

  it("fails loudly when a marker is missing", () => {
    expect(() => extractSection("no markers", "faq")).toThrow(
      /site:faq.*missing/,
    );
    expect(() => extractSection("<!-- site:faq -->\nQ?\n", "faq")).toThrow(
      /\/site:faq.*missing/,
    );
  });

  it("fails when a marker appears twice", () => {
    const readme =
      "<!-- site:faq -->a<!-- /site:faq -->\n<!-- site:faq -->b<!-- /site:faq -->";
    expect(() => extractSection(readme, "faq")).toThrow(/more than once/);
  });

  it("fails when the marked section is empty", () => {
    expect(() =>
      extractSection("<!-- site:faq -->\n\n<!-- /site:faq -->", "faq"),
    ).toThrow(/empty/);
  });
});
