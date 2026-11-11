import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SNAPSHOT, type Snapshot } from "@/lib/snapshot";
import { ProofPath } from "./ProofPath";

const without: Snapshot = SNAPSHOT.readme.features.some((g) =>
  g.leadIns.some((l) => /^Pull requests, from review/.test(l)),
)
  ? {
      ...SNAPSHOT,
      readme: {
        ...SNAPSHOT.readme,
        features: [{ group: "Any", leadIns: ["Diff by Turn"] }],
      },
    }
  : SNAPSHOT;
const withLeadIn: Snapshot = {
  ...SNAPSHOT,
  readme: {
    ...SNAPSHOT.readme,
    features: [
      { group: "Any", leadIns: ["Pull requests, from review to merge"] },
    ],
  },
};

const render = (snapshot: Snapshot) =>
  renderToStaticMarkup(createElement(ProofPath, { snapshot }));
const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const headings = (html: string) =>
  [...html.matchAll(/<h3[^>]*>(.*?)<\/h3>/g)].map(([, h]) => text(h));
const links = (html: string) =>
  [...html.matchAll(/<a [^>]*href="(\/features[^"]*)"[^>]*>/g)].map(
    ([tag, href]) => ({
      href,
      name: tag.match(/aria-label="([^"]*)"/)?.[1],
    }),
  );

// Copy deck, Home → Proof points; Design system, Proof path.
describe("ProofPath", () => {
  it("is headed From prompt to merge", () => {
    const html = render(withLeadIn);
    expect(html).toMatch(
      /<h2[^>]*id="proof-path"[^>]*>From prompt to merge<\/h2>/,
    );
    expect(html).toContain('aria-labelledby="proof-path"');
  });

  it("renders all four steps, in order, once the README has the lead-in", () => {
    const html = render(withLeadIn);
    expect(headings(html)).toEqual([
      "Prompt",
      "Review",
      "Pull request",
      "Merge",
    ]);
    expect(html).toContain("<ol");
  });

  it("leaves out steps 3 and 4 while the README lacks the lead-in", () => {
    const html = render(without);
    expect(headings(html)).toEqual(["Prompt", "Review"]);
    expect(html).not.toContain("auto-merge");
    expect(html).not.toContain("Merge when GitHub");
    expect(html).not.toContain("/features#pull-requests");
  });

  it("ends each step with a Learn more link whose name includes the heading", () => {
    expect(links(render(withLeadIn))).toEqual([
      { href: "/features#multiple-providers", name: "Learn more about Prompt" },
      { href: "/features#diff-by-turn", name: "Learn more about Review" },
      {
        href: "/features#pull-requests",
        name: "Learn more about Pull request",
      },
      {
        href: "/features#verification-dossier",
        name: "Learn more about Merge",
      },
    ]);
    expect(text(render(withLeadIn))).toContain("Learn more");
  });

  it("links the first mention of each Concepts term, once", () => {
    const html = render(withLeadIn);
    for (const term of ["Thread", "Turn", "Verification Dossier", "Provider"]) {
      const hits = [
        ...html.matchAll(
          new RegExp(`href="/docs/concepts#[^"]+"[^>]*>${term}</a>`, "g"),
        ),
      ];
      expect(hits, term).toHaveLength(1);
    }
  });

  it("skips terms the page already linked", () => {
    const html = renderToStaticMarkup(
      createElement(ProofPath, {
        snapshot: withLeadIn,
        seen: new Set(["Thread"]),
      }),
    );
    expect(html).not.toMatch(/>Thread<\/a>/);
  });

  it("never ships a hidden start state in the HTML", () => {
    const html = render(withLeadIn);
    expect(html).not.toMatch(/opacity\s*:\s*0/);
    expect(html).not.toMatch(/\shidden[\s=>]/);
  });
});
