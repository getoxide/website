import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PREVIEW, PREVIEW_PROJECTS } from "@/content/app-preview";
import { AppPreview } from "./AppPreview";

const render = () => renderToStaticMarkup(createElement(AppPreview));

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

describe("AppPreview", () => {
  it("is a named group of real controls", () => {
    const html = render();
    expect(html).toMatch(
      /<figure[^>]*role="group"[^>]*aria-label="Interactive preview of Oxide"/,
    );
    expect(html.match(/<button/g)!.length).toBeGreaterThan(8);
    expect(html).toContain("<input");
  });

  it("is marked as product UI, so the copy gates skip it", () => {
    expect(render()).toContain('data-capture=""');
  });

  it("starts on the hero Capture's Project and Terminal with Command blocks", () => {
    const t = text(render());
    const [first] = PREVIEW_PROJECTS;
    expect(t).toContain(first.name);
    expect(t).toContain(first.terminals[0].blocks[0].command);
    expect(t).toContain(PREVIEW.pr.merge);
  });

  it("says under the frame that it can be explored", () => {
    expect(render()).toMatch(/<figcaption[^>]*>Interactive preview:/);
  });

  it("hides nothing inline", () => {
    expect(render()).not.toMatch(/opacity:\s*0/);
  });
});
