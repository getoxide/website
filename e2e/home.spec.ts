import { expect, test } from "@playwright/test";

// Ticket #37: with JavaScript disabled every word and every capture is there.
test("home with JavaScript off shows the hero capture and the proof path", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  const img = page.locator("main picture img").first();
  await expect(img).toBeVisible();
  await img.scrollIntoViewIfNeeded();
  await expect
    .poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  const path = page.getByRole("region", { name: "From prompt to merge" });
  await expect(path.locator("li").first()).toBeVisible();
  await expect(
    path.getByRole("link", { name: "Learn more about Review" }),
  ).toBeVisible();
  await context.close();
});

test("the reveal hides nothing in the server HTML", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).not.toMatch(/opacity:\s*0/);
});
