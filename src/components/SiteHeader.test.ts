import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "./SiteHeader";

describe("SiteHeader measurement", () => {
  const html = renderToStaticMarkup(createElement(SiteHeader, { path: "/" }));

  it("counts the GitHub link as github-cta", () => {
    expect(html).toMatch(
      /<a [^>]*href="https:\/\/github.com\/getoxide\/oxide"[^>]*data-goatcounter-click="github-cta"/,
    );
  });

  it("carries no other click event", () => {
    expect([
      ...html.matchAll(/data-goatcounter-click="([^"]+)"/g),
    ]).toHaveLength(1);
  });
});
