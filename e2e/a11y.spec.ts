import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { REGISTERED, urlOf } from "./pages";

// Budgets, Accessibility: WCAG 2.2 A and AA, zero violations, every page in
// PAGES. The 404 is checked through an unknown path.
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const page of REGISTERED) {
  test(`axe: ${page.path} has no WCAG 2.2 A/AA violations`, async ({
    page: tab,
  }) => {
    await tab.goto(urlOf(page));
    const results = await new AxeBuilder({ page: tab })
      .withTags(TAGS)
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
