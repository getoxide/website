// `pnpm check:lighthouse [path ...]`: Lighthouse against the static export
// served locally, mobile preset (simulated slow 4G, 4x CPU slowdown), median
// of 3 runs per page (docs/spec/budgets.md, Core Web Vitals; Enforcement in
// CI). LCP, TBT and CLS over the page's budget class and an accessibility
// score under 100 fail; the overall performance score only warns. Runs `/`
// and `/changelog` (the heaviest reading page) unless paths are given; each
// page's class comes from the PAGES registry.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { registry } from "./exported-pages.mjs";

/** Lab ceilings per budget class (Core Web Vitals table). */
export const VITALS = {
  showcase: { lcp: 2000, tbt: 150, cls: 0.05 },
  reading: { lcp: 1500, tbt: 50, cls: 0.02 },
};

/** Pages Lighthouse runs on in CI (Enforcement in CI). */
export const LIGHTHOUSE_PATHS = ["/", "/changelog"];

export const RUNS = 3;

/** Below this overall performance score, a warning (never a failure). */
const PERFORMANCE_WARNING = 0.9;

const median = (values) =>
  [...values].sort((a, b) => a - b)[values.length >> 1];

/** The numbers a run is judged on, from a Lighthouse result (`lhr`). */
export function metricsOf(lhr) {
  if (lhr.runtimeError) {
    throw new Error(
      `Lighthouse run failed: ${lhr.runtimeError.code}: ${lhr.runtimeError.message}`,
    );
  }
  return {
    lcp: lhr.audits["largest-contentful-paint"].numericValue,
    tbt: lhr.audits["total-blocking-time"].numericValue,
    cls: lhr.audits["cumulative-layout-shift"].numericValue,
    accessibility: lhr.categories.accessibility.score,
    performance: lhr.categories.performance.score,
  };
}

/**
 * Judges one page on the median of its runs, metric by metric.
 * @param {string} path
 * @param {keyof typeof VITALS} budgetClass
 * @param {ReturnType<typeof metricsOf>[]} runs
 */
export function assessLighthouse(path, budgetClass, runs) {
  if (runs.length !== RUNS) {
    throw new Error(
      `${path}: Lighthouse needs ${RUNS} runs, got ${runs.length}`,
    );
  }
  const m = Object.fromEntries(
    Object.keys(runs[0]).map((key) => [key, median(runs.map((r) => r[key]))]),
  );
  const ceiling = VITALS[budgetClass];
  const of = `median of ${RUNS}`;
  const failures = [];
  if (m.lcp > ceiling.lcp) {
    failures.push(
      `${path}: LCP ${Math.round(m.lcp)} ms > ${ceiling.lcp} ms (${of}, ${budgetClass})`,
    );
  }
  if (m.tbt > ceiling.tbt) {
    failures.push(
      `${path}: TBT ${Math.round(m.tbt)} ms > ${ceiling.tbt} ms (${of}, ${budgetClass})`,
    );
  }
  if (m.cls > ceiling.cls) {
    failures.push(
      `${path}: CLS ${m.cls.toFixed(3)} > ${ceiling.cls.toFixed(3)} (${of}, ${budgetClass})`,
    );
  }
  if (m.accessibility < 1) {
    failures.push(
      `${path}: accessibility score ${Math.round(m.accessibility * 100)} < 100 (${of})`,
    );
  }
  const warnings = [];
  if (m.performance < PERFORMANCE_WARNING) {
    warnings.push(
      `${path}: performance score ${Math.round(m.performance * 100)} < ${PERFORMANCE_WARNING * 100} (${of}, warning only)`,
    );
  }
  return { median: m, failures, warnings };
}

/** Serves `out/` like CI does and resolves once it answers. */
async function serve(port) {
  const server = spawn(
    process.execPath,
    [fileURLToPath(new URL("serve-out.mjs", import.meta.url)), "--port", port],
    { stdio: "ignore" },
  );
  const url = `http://localhost:${port}`;
  for (let i = 0; i < 100; i++) {
    try {
      await fetch(url);
      return { url, stop: () => server.kill() };
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  server.kill();
  throw new Error(`serve-out did not answer on ${url}`);
}

async function main() {
  const { default: lighthouse } = await import("lighthouse");
  const { launch } = await import("chrome-launcher");
  const { chromium } = await import("@playwright/test");

  const pages = await registry();
  const paths = process.argv.slice(2);
  const targets = (paths.length ? paths : LIGHTHOUSE_PATHS).map((path) => {
    const page = pages.find((p) => p.path === path);
    if (!page) throw new Error(`${path} is not in the PAGES registry`);
    return page;
  });

  // Never reuse a server: another worktree's export may hold the port.
  const port = process.env.LIGHTHOUSE_PORT ?? "3140";
  const server = await serve(port);
  const chrome = await launch({
    chromePath: process.env.CHROME_PATH ?? chromium.executablePath(),
    chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
  });

  const failures = [];
  const warnings = [];
  try {
    for (const { path, budgetClass } of targets) {
      const runs = [];
      for (let i = 0; i < RUNS; i++) {
        const result = await lighthouse(
          `${server.url}${path === "/404" ? "/this-page-does-not-exist" : path}`,
          {
            port: chrome.port,
            output: "json",
            logLevel: "error",
            onlyCategories: ["performance", "accessibility"],
          },
        );
        runs.push(metricsOf(result.lhr));
      }
      const verdict = assessLighthouse(path, budgetClass, runs);
      const m = verdict.median;
      const c = VITALS[budgetClass];
      console.log(
        `${path} (${budgetClass}), median of ${RUNS}: LCP ${Math.round(m.lcp)} ms (≤ ${c.lcp}), TBT ${Math.round(m.tbt)} ms (≤ ${c.tbt}), CLS ${m.cls.toFixed(3)} (≤ ${c.cls}), accessibility ${Math.round(m.accessibility * 100)}, performance ${Math.round(m.performance * 100)}`,
      );
      failures.push(...verdict.failures);
      warnings.push(...verdict.warnings);
    }
  } finally {
    await chrome.kill();
    server.stop();
  }

  for (const w of warnings) console.warn(`Warning: ${w}`);
  if (failures.length > 0) {
    console.error(
      "\nLighthouse failed (docs/spec/budgets.md, Core Web Vitals):",
    );
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log(`\nLighthouse passed: ${targets.length} pages.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
