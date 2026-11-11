import { describe, expect, it } from "vitest";
import { PAGES } from "@/content/pages";
import { pageMetadata } from "./metadata";
import { SHARE_CARD } from "./share";
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

  it("links the one site-wide share card on every indexable page", () => {
    for (const page of [guide, home]) {
      expect(pageMetadata(page).openGraph?.images).toEqual([
        {
          url: "https://oxide.cavallinilorenzo.com/og.png",
          width: 1200,
          height: 630,
          type: "image/png",
          alt: SHARE_CARD.alt,
        },
      ]);
      expect(pageMetadata(page).twitter?.images).toEqual([
        {
          url: "https://oxide.cavallinilorenzo.com/og.png",
          alt: SHARE_CARD.alt,
        },
      ]);
    }
  });

  it("derives the share-card alt from the hero H1", () => {
    expect(SHARE_CARD.alt).toBe(`Oxide: ${PAGES.home.h1}`);
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
    expect(meta.openGraph?.images).toHaveLength(1);
    expect(meta.twitter?.images).toHaveLength(1);
  });
});
