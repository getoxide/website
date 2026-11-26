import { createElement, type ReactElement } from "react";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PREVIEW, PREVIEW_PROJECTS } from "@/content/app-preview";
import { AppPreview } from "./AppPreview";

async function renderHtml(element: ReactElement): Promise<string> {
  const stream = await renderToReadableStream(element);
  await stream.allReady;
  return new Response(stream).text();
}

const render = () => renderHtml(createElement(AppPreview));

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

describe("AppPreview", () => {
  it("is a named group of real controls", async () => {
    const html = await render();
    expect(html).toMatch(
      /<figure[^>]*role="group"[^>]*aria-label="Interactive preview of Oxide"/,
    );
    expect(html.match(/<button/g)!.length).toBeGreaterThan(8);
    expect(html).toContain("<input");
  });

  it("is marked as product UI, so the copy gates skip it", async () => {
    expect(await render()).toContain('data-capture=""');
  });

  it("starts on the hero Capture's Project and Terminal with Command blocks", async () => {
    const t = text(await render());
    const [first] = PREVIEW_PROJECTS;
    expect(t).toContain(first.name);
    expect(t).toContain(first.terminals[0].blocks[0].command);
    expect(t).toContain(PREVIEW.pr.merge);
  });

  it("says under the frame that it can be explored", async () => {
    expect(await render()).toMatch(/<figcaption[^>]*>Interactive preview:/);
  });

  it("hides nothing inline", async () => {
    expect(await render()).not.toMatch(/opacity:\s*0/);
  });
});
