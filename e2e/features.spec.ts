import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { SNAPSHOT } from "./snapshot";

// /features (ticket #40; Copy deck, `/features` → The feature-name contract):
// one anchored section per README Features lead-in, with the deck's heading
// and anchor. The expectations come from the Copy deck table and the
// committed Snapshot, read independently of the site.

const DECK = readFileSync(
  new URL("../docs/spec/copy.md", import.meta.url),
  "utf8",
);
const CONTRACT = DECK.split("### The feature-name contract")[1]
  .split("Capture captions are constraints-only")[0]
  .split("\n")
  .filter((line) => line.startsWith("| ") && !/^\| (README|---)/.test(line))
  .map((line) => {
    const [leadIn, heading, anchor] = line
      .split("|")
      .slice(1, 4)
      .map((cell) => cell.trim());
    return { leadIn, heading, anchor: anchor.replace(/[`#]/g, "") };
  });

const key = (leadIn: string) => leadIn.trim().replace(/\.$/, "");
const inSnapshot = new Set(
  SNAPSHOT.readme.features.flatMap((g) => g.leadIns).map(key),
);
const rendered = CONTRACT.filter((c) => inSnapshot.has(key(c.leadIn)));
const absent = CONTRACT.filter((c) => !inSnapshot.has(key(c.leadIn)));

test("the Copy deck lists a section for every Snapshot lead-in", () => {
  expect(rendered).toHaveLength(inSnapshot.size);
});

test("every Snapshot lead-in has its section and anchor, with JavaScript off", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const { heading, anchor } of rendered) {
    await page.goto(`/features#${anchor}`);
    const h3 = page.locator(`main h3#${anchor}`);
    await expect(h3).toHaveText(heading);
    await expect(h3).toBeInViewport();
  }
  await expect(page.locator("main h3")).toHaveCount(rendered.length);
  await context.close();
});

test("a contract entry the Snapshot does not carry yet renders nothing", async ({
  page,
}) => {
  await page.goto("/features");
  for (const { anchor } of absent) {
    await expect(page.locator(`#${anchor}`)).toHaveCount(0);
    await expect(page.locator(`a[href="#${anchor}"]`)).toHaveCount(0);
  }
});

test("the groups follow the loop, and an empty capture slot draws no frame", async ({
  page,
}) => {
  await page.goto("/features");
  await expect(page.locator("main h2:not(#closing-cta)")).toHaveText([
    "One app, every agent CLI",
    "Review before you merge",
    "A full workspace around the conversation",
  ]);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Everything between the prompt and the merge",
  );
  // Only sections with a capture file get a figure.
  const figures = await page.locator("main figure").count();
  const images = await page.locator("main figure img").count();
  expect(figures).toBe(images);
});

test("the Verification Dossier and Blind review sections link their guides", async ({
  page,
}) => {
  await page.goto("/features");
  await expect(
    page
      .locator("#verification-dossier")
      .locator("xpath=ancestor::section[1]")
      .locator('a[href="/guides/review-ai-generated-code"]'),
  ).toBeVisible();
  await expect(
    page
      .locator("#blind-review")
      .locator("xpath=ancestor::section[1]")
      .locator('a[href="/guides/claude-code-and-codex-together"]'),
  ).toBeVisible();
});

test("the sections reveal without hiding anything in the server HTML", async ({
  request,
}) => {
  const html = await (await request.get("/features")).text();
  expect(html).not.toMatch(/opacity:\s*0/);
});
