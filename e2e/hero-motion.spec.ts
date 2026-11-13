import { expect, test, type Page } from "@playwright/test";

// Ticket #39 (Budgets, Shader and Accessibility; ADR-0001). GPU frame time is
// manual (SwiftShader in CI makes it noise); here: the drawing buffer cap, the
// 30 fps cap, reduced motion and the no-WebGL fallback.

// Counts the shader's draw calls without touching production code.
const countDraws = (page: Page) =>
  page.addInitScript(() => {
    const w = window as unknown as { __draws: number };
    w.__draws = 0;
    const draw = WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.drawArrays = function (
      ...args: Parameters<typeof draw>
    ) {
      w.__draws++;
      return draw.apply(this, args);
    };
  });
const draws = (page: Page) =>
  page.evaluate(() => (window as unknown as { __draws: number }).__draws);

const canvas = (page: Page) => page.locator("section[data-hero] canvas");

test("the shader draws behind the hero within the buffer and frame caps", async ({
  page,
}) => {
  await countDraws(page);
  await page.goto("/");
  await expect(canvas(page)).toHaveCSS("opacity", "1", { timeout: 10_000 });
  const size = await canvas(page).evaluate((c: HTMLCanvasElement) => ({
    w: c.width,
    h: c.height,
  }));
  expect(size.w * size.h).toBeGreaterThan(0);
  expect(size.w * size.h).toBeLessThanOrEqual(360_000);

  const before = await draws(page);
  await page.waitForTimeout(2000);
  const frames = (await draws(page)) - before;
  expect(frames).toBeGreaterThan(10);
  expect(frames).toBeLessThanOrEqual(62);
  // the H1 and the buttons stay above it
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("the drawing buffer ignores devicePixelRatio and stays capped on a large viewport", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 2560, height: 1440 },
    deviceScaleFactor: 3,
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(canvas(page)).toHaveCSS("opacity", "1", { timeout: 10_000 });
  const size = await canvas(page).evaluate((c: HTMLCanvasElement) => ({
    w: c.width,
    h: c.height,
  }));
  expect(size.w * size.h).toBeLessThanOrEqual(360_000);
  await context.close();
});

test("without WebGL the static gradient stays and the hero is complete", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...rest: unknown[]
    ) {
      if (type.includes("webgl")) return null;
      return (get as (...a: unknown[]) => unknown).call(this, type, ...rest);
    } as typeof get;
  });
  await page.goto("/");
  await page.waitForTimeout(500);
  await expect(canvas(page)).toHaveCSS("opacity", "0");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page
      .locator("section[data-hero]")
      .getByRole("link", { name: /Download Oxide|Get Oxide/ }),
  ).toBeVisible();
});

test("under reduced motion the mark is static, one still frame", async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await countDraws(page);
  await page.goto("/");
  await expect(canvas(page)).toHaveCSS("opacity", "1", { timeout: 10_000 });
  await page.waitForTimeout(1000);
  expect(await draws(page)).toBeLessThanOrEqual(3);
  expect(
    await page
      .locator("section[data-hero] svg path[d='M448 472V552']")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  // only opacity fades of up to 200 ms remain
  await expect(canvas(page)).toHaveCSS("transition-duration", "0.2s");
  const word = page.locator("section[data-hero] h1 span").first();
  await expect(word).toHaveCSS("animation-duration", "0.2s");
  await expect(word).toHaveCSS("animation-name", /fade/);
  await context.close();
});

test("the headline reveal is about a second at most and never touches the buttons", async ({
  page,
}) => {
  await page.goto("/");
  const words = page.locator("section[data-hero] h1 span");
  const count = await words.count();
  const last = words.nth(count - 1);
  const total = await last.evaluate((el) => {
    const cs = getComputedStyle(el);
    const t = (v: string) => parseFloat(v) * (v.endsWith("ms") ? 1 : 1000);
    return t(cs.animationDelay) + t(cs.animationDuration);
  });
  expect(total).toBeLessThanOrEqual(1100);
  const btn = page
    .locator("section[data-hero]")
    .getByRole("link", { name: /Download Oxide|Get Oxide/ });
  expect(await btn.evaluate((el) => getComputedStyle(el).animationName)).toBe(
    "none",
  );
});
