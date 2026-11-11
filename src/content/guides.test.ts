import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SNAPSHOT } from "@/lib/snapshot";
import { featureSections } from "@/lib/features";
import { GUIDE_INDEX, GUIDES, guideSources } from "./guides";
import { PAGES } from "./pages";

// The two guides (ticket #42): the Copy deck's outlines are binding, the
// running text is build-written. The expectations below come from the deck,
// an independent source, and from what `/features` actually renders.

const DECK = readFileSync(
  new URL("../../docs/spec/copy.md", import.meta.url),
  "utf8",
);

/** A `## \`/path\` *(outline)*` section of the deck. */
function outlineSection(path: string): string {
  return DECK.split("## `" + path + "` *(outline)*")[1].split("\n## ")[0];
}

type OutlineRow = { heading: string; keySentences: string };

/** The outline table rows: heading and key sentences, in order. */
function outline(path: string): OutlineRow[] {
  return outlineSection(path)
    .split("\n")
    .filter(
      (line) =>
        line.startsWith("| ") && !/^\| (Section heading|---)/.test(line),
    )
    .map((line) => {
      const [heading, keySentences] = line
        .split("|")
        .slice(1, 3)
        .map((cell) => cell.trim());
      return { heading, keySentences };
    });
}

/** The deck's `**Intro key sentence**`, verbatim. */
function introOf(path: string): string {
  return outlineSection(path)
    .split("**Intro key sentence**: ")[1]
    .split("\n")[0]
    .trim();
}

/** A whole-word, case-sensitive mention, as the concept-link gate matches. */
const termPattern = (term: string) => new RegExp(`(?<!\\w)${term}s?(?!\\w)`);
const mentioned = (text: string) =>
  SNAPSHOT.concepts
    .filter((concept) => termPattern(concept.term).test(text))
    .map((concept) => concept.term);

describe("the guide pages", () => {
  it("covers exactly the two deck guides, in the deck's order", () => {
    expect(GUIDES.map((guide) => guide.page.path)).toEqual([
      "/guides/review-ai-generated-code",
      "/guides/claude-code-and-codex-together",
    ]);
  });

  it("puts the index and both guides on the reading budget, under Guides", () => {
    for (const page of [PAGES.guides, ...GUIDES.map((g) => g.page)]) {
      expect(page.budgetClass, page.path).toBe("reading");
      expect(page.llmsSection, page.path).toBe("Guides");
    }
  });

  it("gives the guides article structured data and the index a WebPage", () => {
    expect(PAGES.guides.structuredData).toBe("WebPage");
    for (const guide of GUIDES) {
      expect(guide.page.structuredData, guide.page.path).toBe("TechArticle");
    }
  });

  it("gives the index a lead and every guide a one-line summary", () => {
    expect(GUIDE_INDEX.lead.length).toBeGreaterThan(40);
    for (const guide of GUIDES) {
      expect(guide.summary.length, guide.page.path).toBeGreaterThan(40);
      expect(guide.summary, guide.page.path).not.toMatch(/[.!?]\s/);
    }
  });
});

describe.each(GUIDES.map((guide) => [guide.page.path, guide] as const))(
  "%s follows its Copy deck outline",
  (path, guide) => {
    it("renders the intro key sentence verbatim", () => {
      expect(guide.intro).toBe(introOf(path));
    });

    it("has the deck's section headings, in order", () => {
      expect(guide.sections.map((section) => section.heading)).toEqual(
        outline(path).map((row) => row.heading),
      );
    });

    it("renders every outline section's key sentences", () => {
      const rows = outline(path);
      guide.sections.forEach((section, i) => {
        const { keySentences } = rows[i];
        // The closing section of a guide is described, not quoted.
        if (keySentences.startsWith("One paragraph")) return;
        expect(section.body, section.heading).toContain(keySentences);
      });
    });

    it("does not restate the locked Blind review sentence", () => {
      const section = guide.sections.find(
        (s) => s.id === "why-the-reviewer-works-blind",
      );
      if (!section) return;
      expect(
        section.body.match(/That is a \[Blind review\]/g),
        section.heading,
      ).toHaveLength(1);
      expect(section.body, section.heading).not.toMatch(
        /that is a Blind review/,
      );
    });

    it("gives every section an anchor id and running text", () => {
      for (const section of guide.sections) {
        expect(section.id, section.heading).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
        expect(section.body.trim().length, section.heading).toBeGreaterThan(80);
      }
      expect(new Set(guide.sections.map((s) => s.id)).size).toBe(
        guide.sections.length,
      );
    });
  },
);

describe("the guides link to each other and to /features", () => {
  const [review, codex] = GUIDES;

  it("ends the review guide with a pointer to the other guide", () => {
    const last = review.sections.at(-1)!;
    expect(last.heading).toBe("Going further: a second reviewer");
    expect(last.body).toContain(`](${codex.page.path})`);
  });

  it("ends the second guide with a pointer to the review guide", () => {
    expect(codex.closing).toContain(`](${review.page.path})`);
  });

  it("links only /features anchors that /features renders", () => {
    const rendered = new Set(
      featureSections().flatMap((group) => group.features.map((f) => f.anchor)),
    );
    for (const guide of GUIDES) {
      for (const source of guideSources(guide)) {
        for (const [, anchor] of source.matchAll(/\/features#([\w-]+)/g)) {
          expect(rendered.has(anchor), `${guide.page.path} → ${anchor}`).toBe(
            true,
          );
        }
      }
    }
  });

  it("links no guide path that is not in the registry", () => {
    const paths = new Set(GUIDES.map((guide) => guide.page.path));
    for (const guide of GUIDES) {
      for (const source of guideSources(guide)) {
        for (const [, href] of source.matchAll(/\]\((\/guides\/[^)#]+)\)/g)) {
          expect(paths.has(href), `${guide.page.path} → ${href}`).toBe(true);
        }
      }
    }
  });
});

describe("Concepts links in the guides", () => {
  // `pnpm check:concept-links` scans headings too, and a heading is never a
  // link: a term's first mention must be in the intro or in a section body.
  it("never introduces a Concepts term in a heading", () => {
    for (const guide of GUIDES) {
      const seen = new Set(mentioned(guide.intro));
      for (const section of guide.sections) {
        for (const term of mentioned(section.heading)) {
          expect(
            seen.has(term),
            `${guide.page.path}: "${term}" first appears in the heading "${section.heading}"`,
          ).toBe(true);
        }
        for (const term of mentioned(section.heading)) seen.add(term);
        for (const term of mentioned(section.body)) seen.add(term);
      }
    }
  });
});
