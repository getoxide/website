import { expect, test } from "@playwright/test";
import { REGISTERED, urlOf } from "./pages";

// With JavaScript disabled every page shows all of its text (ADR-0001,
// content is visible by default).
for (const page of REGISTERED) {
  test(`${page.path} shows the same text with JavaScript off`, async ({
    browser,
  }) => {
    const withJs = await browser.newPage();
    await withJs.goto(urlOf(page));
    const expected = await withJs.locator("body").innerText();

    const context = await browser.newContext({ javaScriptEnabled: false });
    const noJs = await context.newPage();
    await noJs.goto(urlOf(page));
    await expect(noJs.locator("h1")).toHaveText(page.h1);
    expect(await noJs.locator("body").innerText()).toBe(expected);
    await context.close();
  });
}
