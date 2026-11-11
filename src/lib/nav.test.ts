import { describe, expect, it } from "vitest";
import { isCurrent } from "./nav";

describe("isCurrent", () => {
  it("marks a link to the page being viewed", () => {
    expect(isCurrent("/features", "/features")).toBe(true);
    expect(isCurrent("/privacy", "/privacy")).toBe(true);
    expect(isCurrent("/", "/")).toBe(true);
  });

  it("does not mark links to other pages", () => {
    expect(isCurrent("/features", "/")).toBe(false);
    expect(isCurrent("/", "/features")).toBe(false);
    expect(isCurrent("/faq", "/features")).toBe(false);
  });

  it("marks the section link on every page of the section", () => {
    expect(isCurrent("/docs/quick-start", "/docs/concepts")).toBe(true);
    expect(isCurrent("/guides", "/guides/review-ai-generated-code")).toBe(true);
    expect(isCurrent("/guides", "/guides")).toBe(true);
  });

  it("keeps a section link from matching a page that only shares a prefix", () => {
    expect(isCurrent("/guides", "/guidesx")).toBe(false);
    expect(isCurrent("/docs/quick-start", "/docsx/a")).toBe(false);
  });

  it("never marks an external link or a root file", () => {
    expect(isCurrent("https://github.com/getoxide/oxide", "/")).toBe(false);
    expect(isCurrent("/llms.txt", "/")).toBe(false);
  });
});
