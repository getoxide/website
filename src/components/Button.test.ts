import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";

const render = (props: Parameters<typeof Button>[0]) =>
  renderToStaticMarkup(createElement(Button, props));

describe("Button", () => {
  it("is a link with its label, so it works without JavaScript", () => {
    const html = render({
      href: "/download",
      variant: "primary",
      children: "Download Oxide",
    });
    expect(html).toMatch(
      /^<a [^>]*href="\/download"[^>]*>Download Oxide<\/a>$/,
    );
  });

  it("gives each variant its own look", () => {
    const classOf = (variant: "primary" | "ghost" | "nav") =>
      render({ href: "/", variant, children: "x" }).match(
        /class="([^"]+)"/,
      )![1];
    const classes = [classOf("primary"), classOf("ghost"), classOf("nav")];
    expect(new Set(classes).size).toBe(3);
  });

  it("puts an Octicon before the label", () => {
    const html = render({
      href: "https://github.com/getoxide/oxide",
      variant: "ghost",
      icon: "mark-github",
      children: "View on GitHub",
    });
    expect(html).toMatch(
      /<a [^>]*><svg [^>]*aria-hidden="true"[^>]*>.*<\/svg>View on GitHub<\/a>/,
    );
  });

  it("marks the link to the current page", () => {
    expect(
      render({
        href: "/download",
        variant: "nav",
        current: true,
        children: "Download",
      }),
    ).toContain('aria-current="page"');
    expect(
      render({ href: "/download", variant: "nav", children: "Download" }),
    ).not.toContain("aria-current");
  });
});
