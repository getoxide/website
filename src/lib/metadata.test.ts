import { describe, expect, it } from "vitest";
import { pageMetadata } from "./metadata";
import type { Page } from "@/content/pages";

const guide: Page = {
  path: "/guides/review-ai-generated-code",
  h1: "How to review AI-generated code before you merge",
  title: "How to review AI-generated code · Oxide",
  description: "A four-step method.",
  budgetClass: "reading",
  structuredData: "TechArticle",
  indexable: true,
  llmsSection: "Guides",
};

const home: Page = {
  ...guide,
  path: "/",
  title: "Oxide: the complete desktop app for Claude Code and Codex",
  structuredData: "HomeGraph",
};

describe("pageMetadata", () => {
  it("renders the registry title as is, never through a template", () => {
    expect(pageMetadata(guide).title).toEqual({
      absolute: "How to review AI-generated code · Oxide",
    });
  });

  it("uses an absolute canonical without a trailing slash", () => {
    expect(pageMetadata(guide).alternates?.canonical).toBe(
      "https://oxide.cavallinilorenzo.com/guides/review-ai-generated-code",
    );
    expect(pageMetadata(home).alternates?.canonical).toBe(
      "https://oxide.cavallinilorenzo.com",
    );
  });

  it("drops ' · Oxide' from og:title and keeps the home title whole", () => {
    expect(pageMetadata(guide).openGraph).toMatchObject({
      title: "How to review AI-generated code",
      siteName: "Oxide",
      description: "A four-step method.",
      url: "https://oxide.cavallinilorenzo.com/guides/review-ai-generated-code",
    });
    expect(pageMetadata(home).openGraph?.title).toBe(
      "Oxide: the complete desktop app for Claude Code and Codex",
    );
  });

  it("marks guides as articles and other pages as websites", () => {
    expect(pageMetadata(guide).openGraph).toMatchObject({ type: "article" });
    expect(pageMetadata(home).openGraph).toMatchObject({ type: "website" });
    const guidesIndex = { ...guide, path: "/guides", title: "Guides · Oxide" };
    expect(pageMetadata(guidesIndex).openGraph).toMatchObject({
      type: "website",
    });
  });

  it("asks for a large summary card", () => {
    expect(pageMetadata(guide).twitter).toMatchObject({
      card: "summary_large_image",
    });
  });

  it("keeps non-indexable pages out of search and without a canonical", () => {
    const notFound: Page = {
      ...guide,
      path: "/404",
      title: "Page not found · Oxide",
      description: null,
      indexable: false,
    };
    const meta = pageMetadata(notFound);
    expect(meta.robots).toEqual({ index: false });
    expect(meta.alternates).toBeUndefined();
    expect(meta.description).toBeUndefined();
  });
});
