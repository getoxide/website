import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { featureSlot } from "@/content/features";
import type { CaptureManifest } from "@/lib/captures";
import { SNAPSHOT, type Snapshot } from "@/lib/snapshot";
import { FeatureSections } from "./FeatureSections";

const render = (snapshot: Snapshot, manifest: CaptureManifest = {}) =>
  renderToStaticMarkup(createElement(FeatureSections, { snapshot, manifest }));

const ids = (html: string) =>
  [...html.matchAll(/<h3[^>]*id="([^"]+)"/g)].map(([, id]) => id);

describe("FeatureSections", () => {
  it("renders one anchored h3 per Snapshot lead-in, under two group h2s", () => {
    const html = render(SNAPSHOT);
    expect(ids(html)).toEqual([
      "open-projects",
      "many-terminals",
      "command-blocks",
      "issues",
      "pull-requests",
      "files",
    ]);
    expect(
      [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map(([, h]) => h),
    ).toEqual(["Projects and plain terminals", "GitHub at hand"]);
  });

  it("links the running-agents guide from Many terminals", () => {
    const html = render(SNAPSHOT);
    expect(html).toContain('href="/guides/running-agents-in-oxide"');
  });

  it("renders no frame, no figure and no caption for an empty slot", () => {
    const html = render(SNAPSHOT, {});
    expect(html).not.toMatch(/<figure|<img|<picture|<figcaption/);
  });

  it("renders the frame and its caption for a slot that has a capture", () => {
    const manifest: CaptureManifest = {
      [featureSlot("many-terminals")]: {
        kind: "image",
        width: 1920,
        height: 1200,
        widths: [640, 960, 1280, 1920],
      },
    };
    const html = render(SNAPSHOT, manifest);
    expect(html.match(/<figure/g)).toHaveLength(1);
    expect(html).toContain("feature-many-terminals-640.avif");
    expect(html).toMatch(/<figcaption[^>]*>Multiple Terminals nested under/);
  });

  it("keeps all the text in the HTML, hidden by nothing", () => {
    expect(render(SNAPSHOT)).not.toMatch(/opacity:\s*0|display:\s*none/);
  });
});
