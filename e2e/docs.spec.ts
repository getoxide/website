import { expect, test } from "@playwright/test";
import { SNAPSHOT } from "./snapshot";
import { plainText } from "./markdown";
import { REGISTERED, urlOf } from "./pages";

// Derived docs pages (Content sourced from the Oxide repo #12; Design
// system, Prose and Code block). Expected text comes from the committed
// Snapshot, which the sync tests check against the README markers.

const DOCS = [
  ["Quick start", "/docs/quick-start"],
  ["Concepts", "/docs/concepts"],
] as const;

for (const [current, path] of DOCS) {
  test(`${path}: the two-link docs sub-nav marks the current page`, async ({
    page,
  }) => {
    await page.goto(path);
    const nav = page.getByRole("navigation", { name: "Docs" });
    await expect(nav.getByRole("link")).toHaveCount(2);
    for (const [name, href] of DOCS) {
      const link = nav.getByRole("link", { name, exact: true });
      await expect(link).toHaveAttribute("href", href);
      if (name === current) {
        await expect(link).toHaveAttribute("aria-current", "page");
      } else {
        await expect(link).not.toHaveAttribute("aria-current");
      }
    }
  });
}

test.describe("/docs/quick-start", () => {
  test("shows the Requirements prose under #requirements", async ({ page }) => {
    await page.goto("/docs/quick-start#requirements");
    const heading = page.locator("h2#requirements");
    await expect(heading).toHaveText("Requirements");
    await expect(heading).toBeInViewport();
    await expect(page.locator("main")).toContainText(
      plainText(SNAPSHOT.readme.requirements),
    );
  });

  test("shows the four Quick start steps verbatim, in order", async ({
    page,
  }) => {
    await page.goto("/docs/quick-start");
    const steps = SNAPSHOT.readme.quickStart
      .split("\n")
      .filter((l) => /^\d+\. /.test(l))
      .map((l) => plainText(l.replace(/^\d+\. /, "")));
    expect(steps).toHaveLength(4);
    await expect(page.locator("main ol > li")).toHaveText(steps);
  });

  test("is self-canonical", async ({ page }) => {
    await page.goto("/docs/quick-start");
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://getoxide.dev/docs/quick-start",
    );
  });
});

const NINE = [
  ["Project", "project"],
  ["Terminal", "terminal"],
  ["Command block", "command-block"],
  ["Surface", "surface"],
  ["Files view", "files-view"],
  ["Code workspace", "code-workspace"],
  ["Session restore", "session-restore"],
  ["In-app update", "in-app-update"],
  ["Package install", "package-install"],
];

test.describe("/docs/concepts", () => {
  test("lists exactly the nine terms as anchored h2s, each with its definition", async ({
    page,
  }) => {
    await page.goto("/docs/concepts");
    // The closing CTA block's heading follows the terms.
    const headings = page.locator("main h2:not(#closing-cta)");
    await expect(headings).toHaveText(NINE.map(([term]) => term));
    expect(await headings.evaluateAll((hs) => hs.map((h) => h.id))).toEqual(
      NINE.map(([, id]) => id),
    );
    for (const concept of SNAPSHOT.concepts) {
      await expect(page.locator(`#${concept.id}-definition`)).toHaveText(
        plainText(concept.definition),
      );
    }
  });

  test("each term has an anchor link that shows on focus and on hover", async ({
    page,
  }) => {
    await page.goto("/docs/concepts");
    const anchor = page.getByRole("link", { name: "Link to Terminal" });
    await expect(anchor).toHaveAttribute("href", "#terminal");
    await expect(anchor).toHaveCSS("opacity", "0");
    await anchor.focus();
    await expect(anchor).toHaveCSS("opacity", "1");
    await expect(anchor).toHaveCSS("outline-style", "solid");
    await page.locator("main").click({ position: { x: 1, y: 1 } });
    await page.locator("h2#command-block").hover();
    await expect(
      page.getByRole("link", { name: "Link to Command block" }),
    ).toHaveCSS("opacity", "1");
  });
});

test("/docs/concepts#terminal lands on the term with JavaScript off", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/docs/concepts#terminal");
  await expect(page.locator("h2#terminal")).toBeInViewport();
  await expect(page.locator("#terminal-definition")).toBeVisible();
  await context.close();
});

for (const entry of REGISTERED) {
  test(`${entry.path}: the footer shows the canonical definition from the Snapshot`, async ({
    page,
  }) => {
    await page.goto(urlOf(entry));
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByTestId("definition")).toHaveText(
      plainText(SNAPSHOT.readme.definition),
    );
  });
}

test("docs pages load no highlighting code in the browser", async ({
  page,
  request,
}) => {
  for (const [, path] of DOCS) {
    await page.goto(path);
    const scripts = (
      await page
        .locator("script[src]")
        .evaluateAll((els) => els.map((s) => s.getAttribute("src")!))
    ).filter((src) => src.startsWith("/"));
    for (const src of scripts) {
      const js = await (await request.get(src)).text();
      expect(js, src).not.toMatch(/shiki|createHighlighter|tokenizeLine/i);
    }
  }
});
