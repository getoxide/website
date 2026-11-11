import { describe, expect, it } from "vitest";
import { findViolations } from "./check-static.mjs";

const ok = {
  appPaths: {
    "/page": "app/page.js",
    "/privacy/page": "app/privacy/page.js",
    "/_not-found/page": "app/_not-found/page.js",
    "/icon.svg/route": "app/icon.svg/route.js",
  },
  prerendered: ["/", "/privacy", "/_not-found", "/icon.svg"],
  dynamicRoutes: [],
  middleware: {},
  functions: {},
  serverActions: { node: {}, edge: {} },
  sourceFiles: ["src/app/page.tsx", "src/app/privacy/page.tsx"],
};

const text = (input) => findViolations(input).join("\n");

describe("findViolations", () => {
  it("accepts a fully static build", () => {
    expect(findViolations(ok)).toEqual([]);
  });

  it("flags a page that is not prerendered", () => {
    const appPaths = { ...ok.appPaths, "/changelog/page": "x" };
    expect(text({ ...ok, appPaths })).toContain("/changelog");
  });

  it("flags dynamic routes", () => {
    expect(text({ ...ok, dynamicRoutes: ["/guides/[slug]"] })).toContain(
      "dynamic",
    );
  });

  it("flags middleware / proxy output", () => {
    expect(text({ ...ok, middleware: { "/": {} } })).toContain("proxy");
    expect(text({ ...ok, functions: { "/": {} } })).toContain("proxy");
  });

  it("flags server actions", () => {
    const serverActions = { node: { abc: {} }, edge: {} };
    expect(text({ ...ok, serverActions })).toContain("server action");
  });

  it("flags route handler and proxy source files", () => {
    expect(text({ ...ok, sourceFiles: ["src/app/api/x/route.ts"] })).toContain(
      "route handler",
    );
    expect(text({ ...ok, sourceFiles: ["src/proxy.ts"] })).toContain("proxy");
    expect(text({ ...ok, sourceFiles: ["src/middleware.ts"] })).toContain(
      "proxy",
    );
  });

  it("accepts an export with one HTML file per page and the 404", () => {
    const exported = ["index.html", "privacy.html", "404.html", "icon.svg"];
    expect(findViolations({ ...ok, exported })).toEqual([]);
  });

  it("flags a page missing from the export", () => {
    const exported = ["index.html", "404.html"];
    expect(text({ ...ok, exported })).toContain("/privacy");
  });

  it("flags a missing 404 page in the export", () => {
    const exported = ["index.html", "privacy.html"];
    expect(text({ ...ok, exported })).toContain("404.html");
  });
});
