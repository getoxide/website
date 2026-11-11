import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PAGES } from "@/content/pages";
import { faqOf } from "@/lib/faq";
import { SNAPSHOT } from "@/lib/snapshot";
import { StructuredData } from "./StructuredData";

const render = (path: string) =>
  renderToStaticMarkup(
    createElement(StructuredData, {
      page: Object.values(PAGES).find((page) => page.path === path)!,
    }),
  );

const jsonOf = (html: string) => {
  const match =
    /^<script type="application\/ld\+json">([\s\S]*)<\/script>$/.exec(html);
  expect(match, html).not.toBeNull();
  return JSON.parse(match![1]);
};

describe("StructuredData", () => {
  it("renders one valid JSON-LD script on every page but the 404", () => {
    for (const page of Object.values(PAGES)) {
      const html = render(page.path);
      if (page.path === "/404") {
        expect(html).toBe("");
        continue;
      }
      expect(html.match(/<script/g), page.path).toHaveLength(1);
      expect(jsonOf(html)["@context"], page.path).toBe("https://schema.org");
    }
  });

  it("renders the home @graph and the FAQPage from the rendered list", () => {
    expect(jsonOf(render("/"))["@graph"]).toHaveLength(3);
    const faq = jsonOf(render("/faq"));
    expect(faq["@type"]).toBe("FAQPage");
    expect(faq.mainEntity.map((q: { name: string }) => q.name)).toEqual(
      faqOf(SNAPSHOT).map((entry) => entry.question),
    );
  });
});
