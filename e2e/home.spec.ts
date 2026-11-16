import { expect, test } from "@playwright/test";

// Ticket #37: with JavaScript disabled every word is there, and the app
// preview shows its starting Thread (Design system, App preview; ADR-0004).
test("home with JavaScript off shows the app preview and the proof path", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  const preview = page.getByRole("group", {
    name: "Interactive preview of Oxide with Claude Code",
  });
  await expect(preview).toBeVisible();
  await expect(
    preview.getByRole("button", { name: "Commit & Push" }),
  ).toBeVisible();
  const path = page.getByRole("region", { name: "From prompt to merge" });
  await expect(path.locator("li").first()).toBeVisible();
  await expect(
    path.getByRole("link", { name: "Learn more about Review" }),
  ).toBeVisible();
  await context.close();
});

test("the app preview never moves by itself", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("load");
  const preview = page.getByRole("group", { name: /^Interactive preview/ });
  const before = await preview.innerHTML();
  await page.waitForTimeout(2500);
  expect(await preview.innerHTML()).toBe(before);
});

test("the app preview can be explored: push, merge, switch Threads, send", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("load");
  const preview = page.getByRole("group", { name: /^Interactive preview/ });
  await preview.scrollIntoViewIfNeeded();

  // Open a file's hunk from the Diff.
  const file = preview.getByRole("button", { name: /dispatcher\.ts/ });
  await file.click();
  await expect(file).toHaveAttribute("aria-expanded", "true");
  await expect(
    preview.getByText('"Idempotency-Key"', { exact: false }),
  ).toBeVisible();

  // Commit & Push, then Merge.
  await preview.getByRole("button", { name: "Commit & Push" }).click();
  await preview.getByRole("button", { name: "Merge" }).first().click();
  await expect(
    preview.getByRole("button", { name: "#143 · Merged" }),
  ).toBeVisible();

  // Another Thread waits on an Approval.
  await preview.getByRole("button", { name: /Upgrade Stripe SDK/ }).click();
  await preview.getByRole("button", { name: "Allow" }).click();
  await expect(preview.getByText(/Upgraded to stripe 18\.0\.0/)).toBeVisible();

  // The composer answers honestly.
  await preview.getByLabel("Send a follow-up…").fill("Bump the API version");
  await preview.getByRole("button", { name: "Send" }).click();
  await expect(preview.getByText(/no agent is attached/)).toBeVisible();
});

test("the reveal hides nothing in the server HTML", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).not.toMatch(/opacity:\s*0/);
});
