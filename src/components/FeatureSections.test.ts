import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { featureSlot } from "@/content/features";
import type { CaptureManifest } from "@/lib/captures";
import { SNAPSHOT, type Snapshot } from "@/lib/snapshot";
import { FeatureSections } from "./FeatureSections";

const withPullRequests: Snapshot = {
  ...SNAPSHOT,
  readme: {
    ...SNAPSHOT.readme,
    features: [
      ...SNAPSHOT.readme.features,
      { group: "Review", leadIns: ["Pull requests, from review to merge"] },
    ],
  },
};

const render = (snapshot: Snapshot, manifest: CaptureManifest = {}) =>
  renderToStaticMarkup(createElement(FeatureSections, { snapshot, manifest }));

const ids = (html: string) =>
  [...html.matchAll(/<h3[^>]*id="([^"]+)"/g)].map(([, id]) => id);

// Copy deck, `/features`; Design system, Feature section.
describe("FeatureSections", () => {
  it("renders one anchored h3 per Snapshot lead-in, under three group h2s", () => {
    const html = render(SNAPSHOT);
    expect(ids(html)).toHaveLength(16);
    expect(ids(html)).toContain("verification-dossier");
    expect(
      [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map(([, h]) => h),
    ).toEqual([
      "One app, every agent CLI",
      "Review before you merge",
      "A full workspace around the conversation",
    ]);
  });

  it("has no #pull-requests, nor any link to it, until the Snapshot carries the lead-in", () => {
    const html = render(SNAPSHOT);
    expect(html).not.toContain("pull-requests");
    expect(html).not.toMatch(/auto-merge/);
    const after = render(withPullRequests);
    expect(ids(after)).toContain("pull-requests");
    expect(after).toContain('href="#pull-requests"');
    expect(after).toMatch(/auto-merge/);
  });

  it("links the Verification Dossier and Blind review guides", () => {
    const html = render(SNAPSHOT);
    expect(html).toContain('href="/guides/review-ai-generated-code"');
    expect(html).toContain('href="/guides/claude-code-and-codex-together"');
  });

  it("renders no frame, no figure and no caption for an empty slot", () => {
    const html = render(SNAPSHOT);
    expect(html).not.toMatch(/<figure|<img|<picture|<figcaption/);
  });

  it("renders the frame and its caption for a slot that has a capture", () => {
    const manifest: CaptureManifest = {
      [featureSlot("threads")]: {
        kind: "image",
        width: 2880,
        height: 1800,
        widths: [640, 960, 1280],
      },
    };
    const html = render(SNAPSHOT, manifest);
    expect(html.match(/<figure/g)).toHaveLength(1);
    expect(html).toContain("feature-threads-640.avif");
    expect(html).toMatch(/<figcaption[^>]*>The Threads of a Project/);
  });

  it("keeps all the text in the HTML, hidden by nothing", () => {
    expect(render(SNAPSHOT)).not.toMatch(/opacity:\s*0|display:\s*none/);
  });
});
