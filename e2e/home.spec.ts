import { expect, test } from "@playwright/test";

test("home with JavaScript off shows the app preview and the proof path", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  const preview = page.getByRole("group", {
    name: "Interactive preview of Oxide",
  });
  await expect(preview).toBeVisible();
  await expect(
    preview.getByRole("button", { name: "Squash and merge" }),
  ).toBeVisible();
  const path = page.getByRole("region", {
    name: "From Project to pull request",
  });
  await expect(path.locator("li").first()).toBeVisible();
  await expect(
    path.getByRole("link", { name: "Learn more about Terminals" }),
  ).toBeVisible();
  await context.close();
});

test("the app preview never moves by itself", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("load");
  const preview = page.getByRole("group", {
    name: "Interactive preview of Oxide",
  });
  await expect(preview).toHaveAttribute("data-ready", "");
  const before = await preview.innerHTML();
  await page.waitForTimeout(2500);
  expect(await preview.innerHTML()).toBe(before);
});

test("the app preview can be explored: terminals, files/code, issues, PR merge, command", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("load");
  const preview = page.getByRole("group", {
    name: "Interactive preview of Oxide",
  });
  await preview.scrollIntoViewIfNeeded();
  await expect(preview).toHaveAttribute("data-ready", "");

  // Open Project palette and switch back
  await preview.getByRole("button", { name: "Open a Project" }).click();
  const palette = preview.getByRole("dialog", { name: "Project palette" });
  await expect(palette).toBeVisible();
  await palette.getByRole("button", { name: /oxide-docs/ }).click();
  await expect(preview.getByText("pnpm check:copy")).toBeVisible();
  await preview
    .getByRole("button", { name: "acme-billing", exact: true })
    .click();

  // Switch Terminal to tests
  await preview.getByRole("button", { name: "tests" }).click();
  await expect(preview.getByText("pnpm test --watch")).toBeVisible();

  // Open Files view and open retry.ts in Code workspace
  await preview.getByRole("button", { name: "Files of acme-billing" }).click();
  await preview.getByRole("button", { name: "src/webhooks/retry.ts" }).click();
  await expect(preview.getByText("deliverWithRetry")).toBeVisible();

  // Merge the PR in the right dock
  await preview.getByRole("button", { name: "Squash and merge" }).click();
  await expect(preview.getByText("Merged into main")).toBeVisible();

  // Switch to Issues Surface
  await preview.getByRole("tab", { name: "Issues" }).click();
  await expect(
    preview.getByText("Invoice webhooks are lost when the endpoint is down"),
  ).toBeVisible();

  // Run a command in the terminal input
  await preview
    .getByLabel("Run a command in this terminal…")
    .fill("cargo check");
  await preview.getByRole("button", { name: "Run" }).click();
  await expect(preview.getByText(/no shell is attached/)).toBeVisible();
});

test("the reveal hides nothing in the server HTML", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).not.toMatch(/opacity:\s*0/);
});
