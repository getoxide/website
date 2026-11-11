import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PROVIDER_PAGES } from "./provider-pages";

// The Provider landing pages are checked against the Copy deck itself, an
// independent source: locked strings verbatim, outline headings and the
// required links present.
const DECK = readFileSync(
  new URL("../../docs/spec/copy.md", import.meta.url),
  "utf8",
);

/** A `## ` section of the deck, up to the next one. */
const section = (heading: string) =>
  DECK.split(`\n## ${heading}`)[1].split("\n## ")[0];

const DECK_SECTIONS = {
  claudeCode: section("`/claude-code-gui`"),
  codex: section("`/codex-gui`"),
} as const;

describe.each(Object.entries(DECK_SECTIONS))("%s page", (key, deck) => {
  const copy = PROVIDER_PAGES[key as keyof typeof PROVIDER_PAGES];

  it("opens with the deck's intro key sentence, verbatim", () => {
    expect(deck).toContain(`key sentence "${copy.intro}"`);
  });

  it("has the outline's section headings, in order", () => {
    const outline = [...deck.matchAll(/^\| ([^|]+) \| [^|]+ \|$/gm)]
      .map((m) => m[1].trim())
      .filter((h) => h !== "Section heading" && !h.startsWith("---"));
    expect(copy.sections.map((s) => s.heading)).toEqual(outline);
  });

  it("has the locked page FAQ, verbatim and in order", () => {
    const faq = deck.split("### Page FAQ")[1];
    const entries = [
      ...faq.matchAll(/^\*\*(.+?)\*\* `#([a-z0-9-]+)`\n(.+)$/gm),
    ].map((m) => ({ question: m[1], id: m[2], answer: m[3] }));
    expect(entries.length).toBeGreaterThan(0);
    expect(copy.faq).toEqual(entries);
  });

  it("links the verification dossier, the blind review and both guides", () => {
    const text = copy.sections.flatMap((s) => s.paragraphs).join("\n");
    for (const href of [
      "/features#verification-dossier",
      "/features#blind-review",
      "/guides/review-ai-generated-code",
      "/guides/claude-code-and-codex-together",
    ]) {
      expect(text, href).toContain(`](${href})`);
    }
  });

  it("section anchors are unique and distinct from the FAQ's", () => {
    const ids = [
      ...copy.sections.map((s) => s.id),
      ...copy.faq.map((q) => q.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });
});

describe("landing page copy", () => {
  it("uses ⟨platforms⟩ in the Windows answers, never a typed platform", () => {
    for (const copy of Object.values(PROVIDER_PAGES)) {
      const windows = copy.faq.find((q) => q.id === "windows")!;
      expect(windows.answer).toContain("⟨platforms⟩");
    }
  });
});
