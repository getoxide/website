import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Icon } from "./Icon";

// The start of the 16px `mark-github` path in @primer/octicons 19.
const GITHUB_PATH_START = "M6.766 11.328c-2.063-.25-3.516-1.734";

describe("Icon", () => {
  it("renders the Octicon inline as a 16px decorative SVG in currentColor", () => {
    const html = renderToStaticMarkup(
      createElement(Icon, { name: "mark-github" }),
    );
    expect(html).toMatch(/^<svg /);
    expect(html).toContain('viewBox="0 0 16 16"');
    expect(html).toContain('width="16"');
    expect(html).toContain('height="16"');
    expect(html).toContain('fill="currentColor"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('focusable="false"');
    expect(html).toContain(GITHUB_PATH_START);
    expect(html).not.toMatch(/<use|href=/);
  });

  it("fails the build on an icon name Octicons does not have", () => {
    expect(() =>
      renderToStaticMarkup(createElement(Icon, { name: "no-such-icon" })),
    ).toThrow(/no-such-icon/);
  });
});
