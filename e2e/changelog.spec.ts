import { expect, test } from "@playwright/test";
import { SNAPSHOT } from "./snapshot";

// /changelog (Content #12, Changelog). Vitest covers the rendering of
// releases on fixture Snapshots; here the exported page with the committed
// Snapshot, JavaScript off.

const STABLE = SNAPSHOT.changelog.filter((e) =>
  /^\d+\.\d+\.\d+$/.test(e.version),
);

test("/changelog with no stable release says so and links GitHub Releases, JavaScript off", async ({
  browser,
}) => {
  test.skip(STABLE.length > 0, "the Snapshot has a stable release");
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/changelog");
  await expect(page.locator("h1")).toHaveText("Changelog");
  await expect(page.locator("main h2")).toHaveCount(0);
  await expect(page.locator("main")).toContainText("No stable release yet.");
  await expect(
    page.getByRole("link", { name: "GitHub Releases", exact: true }),
  ).toHaveAttribute("href", SNAPSHOT.release.releasesUrl);
  await context.close();
});

// Skipped until getoxide/oxide publishes its first stable release.
test("/changelog#v… lands on the newest version with JavaScript off", async ({
  browser,
}) => {
  test.skip(STABLE.length === 0, "getoxide/oxide has no stable release yet");
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/changelog");
  const id = await page.locator("main h2").first().getAttribute("id");
  expect(id).toMatch(/^v\d+-\d+-\d+$/);
  await page.goto(`/changelog#${id}`);
  await expect(page.locator(`h2#${id}`)).toBeInViewport();
  await expect(
    page.getByRole("link", { name: "Full release notes on GitHub" }).first(),
  ).toBeVisible();
  await context.close();
});
