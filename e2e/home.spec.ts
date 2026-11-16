import { expect, test } from "@playwright/test";

// Ticket #37: with JavaScript disabled every word is there, and the live app
// preview shows its finished scene (Design system, App preview; ADR-0004).
test("home with JavaScript off shows the app preview and the proof path", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  const preview = page.getByRole("img", {
    name: /^Oxide running a Claude Code Thread/,
  });
  await expect(preview).toBeVisible();
  await expect(preview.getByText("#143 · Merged")).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause preview" })).toHaveCount(
    0,
  );
  const path = page.getByRole("region", { name: "From prompt to merge" });
  await expect(path.locator("li").first()).toBeVisible();
  await expect(
    path.getByRole("link", { name: "Learn more about Review" }),
  ).toBeVisible();
  await context.close();
});

test("the app preview plays, can be paused, and never shifts the page", async ({
  page,
}) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Pause preview" });
  await toggle.scrollIntoViewIfNeeded();
  await expect(toggle).toBeVisible();
  // It started from the empty Thread, so the merged pull request is gone.
  const stage = page.locator("[data-capture]");
  await expect
    .poll(() =>
      stage.evaluate((el) => getComputedStyle(el).getPropertyValue("--beat")),
    )
    .not.toBe("12");
  await toggle.click();
  await expect(
    page.getByRole("button", { name: "Play preview" }),
  ).toBeVisible();
  const beat = await stage.evaluate((el) =>
    el.style.getPropertyValue("--beat"),
  );
  await page.waitForTimeout(1500);
  expect(
    await stage.evaluate((el) => el.style.getPropertyValue("--beat")),
  ).toBe(beat);
  const shift = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as unknown as {
            value: number;
            hadRecentInput: boolean;
          }[]) {
            if (!e.hadRecentInput) total += e.value;
          }
        }).observe({ type: "layout-shift", buffered: true });
        setTimeout(() => resolve(total), 100);
      }),
  );
  expect(shift).toBe(0);
});

test("under reduced motion the app preview stays on its finished scene", async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  await page.waitForLoadState("load");
  await page.waitForTimeout(800);
  await expect(page.getByRole("button", { name: /preview$/ })).toHaveCount(0);
  await expect(page.getByText("#143 · Merged")).toBeVisible();
  await context.close();
});

test("the reveal hides nothing in the server HTML", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).not.toMatch(/opacity:\s*0/);
});
