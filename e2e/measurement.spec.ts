import { expect, test, type Page } from "@playwright/test";
import {
  CLICK_EVENTS,
  GOATCOUNTER_ENDPOINT,
  GOATCOUNTER_ORIGINS,
  GOATCOUNTER_SCRIPT,
} from "../src/lib/measurement";
import { REGISTERED, urlOf } from "./pages";

// Measurement plan (#16), Budgets > Third parties: GoatCounter is the only
// third-party origin, nothing sets a cookie, and the click events are frozen.

/**
 * A stand-in for GoatCounter's count.js, so the suite never depends on the
 * network. It follows the script's documented contract: the endpoint comes
 * from `data-goatcounter`, a page view is sent on load, and a click on an
 * element with `data-goatcounter-click` sends that name as an event.
 */
const COUNT_JS = `
  (() => {
    const script = document.currentScript;
    const endpoint = script.dataset.goatcounter;
    const send = (params) => new Image().src = endpoint + "?" + new URLSearchParams(params);
    send({ p: location.pathname });
    document.addEventListener("click", (e) => {
      const el = e.target.closest("[data-goatcounter-click]");
      if (el) send({ p: el.dataset.goatcounterClick, e: "true" });
    });
  })();
`;

async function stubGoatCounter(page: Page, requests: string[]) {
  await page.route(`${new URL(GOATCOUNTER_SCRIPT).origin}/**`, (route) =>
    route.fulfill({ contentType: "text/javascript", body: COUNT_JS }),
  );
  await page.route(`${new URL(GOATCOUNTER_ENDPOINT).origin}/**`, (route) => {
    requests.push(route.request().url());
    return route.fulfill({ status: 200, contentType: "image/gif", body: "" });
  });
  // A click must not leave the page (GitHub and release links are external).
  await page.addInitScript(() =>
    window.addEventListener("click", (e) => e.preventDefault(), true),
  );
}

test.describe("measurement on every page", () => {
  for (const entry of REGISTERED) {
    test(`${entry.path}: counts one page view, contacts only the site and GoatCounter, sets no cookie`, async ({
      page,
      context,
      baseURL,
    }) => {
      const counted: string[] = [];
      const origins = new Set<string>();
      page.on("request", (request) => {
        const { protocol, origin } = new URL(request.url());
        if (protocol === "http:" || protocol === "https:") origins.add(origin);
      });
      await stubGoatCounter(page, counted);

      await page.goto(urlOf(entry));
      await page.waitForLoadState("load");
      await expect.poll(() => counted.length).toBeGreaterThan(0);

      const allowed = new Set([
        new URL(baseURL!).origin,
        ...GOATCOUNTER_ORIGINS,
      ]);
      expect([...origins].filter((o) => !allowed.has(o))).toEqual([]);
      expect(await context.cookies()).toEqual([]);
      expect(
        await page.evaluate(() => document.cookie),
        "document.cookie",
      ).toBe("");
      expect(await page.evaluate(() => Object.keys(localStorage))).not.toEqual(
        expect.arrayContaining([expect.stringMatching(/goatcounter/i)]),
      );

      const script = page.locator(`script[src="${GOATCOUNTER_SCRIPT}"]`);
      await expect(script).toHaveCount(1);
      await expect(script).toHaveAttribute("async", "");
      await expect(script).toHaveAttribute(
        "data-goatcounter",
        GOATCOUNTER_ENDPOINT,
      );
    });

    test(`${entry.path}: only the agreed buttons carry a click event`, async ({
      page,
    }) => {
      await page.goto(urlOf(entry));
      const tagged = await page
        .locator("[data-goatcounter-click]")
        .evaluateAll((els) =>
          els.map((el) => ({
            tag: el.tagName,
            event: el.getAttribute("data-goatcounter-click"),
            href: el.getAttribute("href"),
          })),
        );
      for (const { tag, event, href } of tagged) {
        expect(tag).toBe("A");
        expect(CLICK_EVENTS as readonly string[]).toContain(event);
        if (event === "github-cta") {
          expect(href).toMatch(/^https:\/\/github\.com\/getoxide\/oxide/);
        } else {
          expect(href).toMatch(/^https:\/\/github\.com\/getoxide\/oxide\//);
          expect(event).toMatch(/^download-/);
        }
      }
    });
  }
});

test.describe("click events", () => {
  const eventsSent = (counted: string[]) =>
    counted
      .map((url) => new URL(url).searchParams)
      .filter((p) => p.get("e") === "true")
      .map((p) => p.get("p"));

  test("the GitHub link in the header sends github-cta from every page", async ({
    page,
  }) => {
    for (const entry of REGISTERED) {
      const counted: string[] = [];
      await stubGoatCounter(page, counted);
      await page.goto(urlOf(entry));
      await page
        .getByRole("banner")
        .locator('a[data-goatcounter-click="github-cta"]')
        .evaluate((el: HTMLElement) => el.click());
      await expect
        .poll(() => eventsSent(counted), entry.path)
        .toEqual(["github-cta"]);
      await page.unrouteAll();
    }
  });

  for (const path of ["/", "/download"]) {
    test(`${path}: every tagged button sends exactly its own event`, async ({
      page,
    }) => {
      const counted: string[] = [];
      await stubGoatCounter(page, counted);
      await page.goto(path);
      const events = await page
        .locator("main [data-goatcounter-click]")
        .evaluateAll((els) =>
          els.map((el) => el.getAttribute("data-goatcounter-click")),
        );
      expect(events.length).toBeGreaterThan(0);
      for (const [i, event] of events.entries()) {
        const before = eventsSent(counted).length;
        await page
          .locator("main [data-goatcounter-click]")
          .nth(i)
          .evaluate((el: HTMLElement) => el.click());
        await expect
          .poll(() => eventsSent(counted).slice(before), `${path} #${i}`)
          .toEqual([event]);
      }
    });
  }
});
