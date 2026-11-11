import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PAGES, SITE_URL } from "./pages";

type DeckRow = { h1: string; title: string; description: string | null };

/**
 * The Copy deck's "Metadata: every page" table, read from the spec itself so
 * the registry is checked against an independent source.
 */
function copyDeckMetadata(): Map<string, DeckRow> {
  const deck = readFileSync(
    new URL("../../docs/spec/copy.md", import.meta.url),
    "utf8",
  );
  const section = deck.split("## Metadata: every page")[1].split("\n## ")[0];
  const rows = new Map<string, DeckRow>();
  for (const line of section.split("\n")) {
    if (!line.startsWith("| `/") && !line.startsWith("| 404")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.replace(/\*\([^)]*\)\*/g, "").trim());
    const [path, h1, title, description] = cells;
    rows.set(path === "404" ? "/404" : path.replace(/`/g, ""), {
      h1,
      title,
      description: description === "" ? null : description,
    });
  }
  return rows;
}

const deck = copyDeckMetadata();
const pages = Object.values(PAGES);

describe("PAGES registry", () => {
  it("reads the Copy deck table", () => {
    expect(deck.get("/")?.h1).toBe(
      "The complete desktop app for agentic coding.",
    );
    expect(deck.get("/404")?.description).toBeNull();
  });

  it("matches the Copy deck verbatim for every page the deck lists", () => {
    for (const page of pages) {
      const row = deck.get(page.path);
      if (!row) continue;
      expect({
        h1: page.h1,
        title: page.title,
        description: page.description,
      }).toEqual(row);
    }
  });

  it("covers the home and the 404 from the deck", () => {
    expect(PAGES.home.path).toBe("/");
    expect(PAGES.notFound.path).toBe("/404");
  });

  it("titles follow '%s · Oxide', the home being the exception", () => {
    expect(PAGES.home.title).not.toMatch(/ · Oxide$/);
    for (const page of pages.filter((p) => p.path !== "/")) {
      expect(page.title).toMatch(/^.+ · Oxide$/);
    }
  });

  it("indexable pages have unique descriptions of 120-160 characters", () => {
    const indexable = pages.filter((p) => p.indexable);
    for (const page of indexable) {
      expect(page.description, page.path).not.toBeNull();
      expect(page.description!.length, page.path).toBeGreaterThanOrEqual(120);
      expect(page.description!.length, page.path).toBeLessThanOrEqual(160);
    }
    const descriptions = indexable.map((p) => p.description);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("the 404 is not indexable and has no description", () => {
    expect(PAGES.notFound.indexable).toBe(false);
    expect(PAGES.notFound.description).toBeNull();
    expect(PAGES.notFound.llmsSection).toBeNull();
  });

  it("puts /privacy on the reading budget, the home on showcase", () => {
    expect(PAGES.home.budgetClass).toBe("showcase");
    expect(PAGES.privacy.budgetClass).toBe("reading");
    expect(PAGES.notFound.budgetClass).toBe("reading");
  });

  it("has unique paths without a trailing slash", () => {
    const paths = pages.map((p) => p.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const path of paths) {
      expect(path === "/" || !path.endsWith("/"), path).toBe(true);
    }
  });

  it("builds every URL from the production SITE_URL", () => {
    expect(SITE_URL).toBe("https://oxide.cavallinilorenzo.com");
  });
});
