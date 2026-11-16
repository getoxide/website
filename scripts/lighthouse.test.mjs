import { describe, expect, it } from "vitest";
import { assessLighthouse, metricsOf, verdictOfRounds } from "./lighthouse.mjs";

/** One Lighthouse run, as `metricsOf` reads it. */
const run = (lcp, tbt, cls, accessibility = 1, performance = 0.99) => ({
  lcp,
  tbt,
  cls,
  accessibility,
  performance,
});

describe("assessLighthouse", () => {
  it("passes a reading page whose medians sit within its class", () => {
    const runs = [run(1400, 40, 0.01), run(1450, 30, 0), run(1300, 50, 0.02)];
    expect(assessLighthouse("/changelog", "reading", runs)).toEqual({
      median: run(1400, 40, 0.01),
      failures: [],
      warnings: [],
    });
  });

  it("takes the median of each metric, so one slow run does not fail the page", () => {
    const runs = [run(1400, 40, 0), run(3900, 400, 0.3), run(1450, 45, 0)];
    expect(assessLighthouse("/changelog", "reading", runs).failures).toEqual(
      [],
    );
  });

  it("fails a regression on LCP, TBT and CLS against the class ceilings", () => {
    const runs = [
      run(1600, 60, 0.03),
      run(1700, 70, 0.04),
      run(1650, 65, 0.05),
    ];
    expect(assessLighthouse("/changelog", "reading", runs).failures).toEqual([
      "/changelog: LCP 1650 ms > 1500 ms (median of 3, reading)",
      "/changelog: TBT 65 ms > 50 ms (median of 3, reading)",
      "/changelog: CLS 0.040 > 0.020 (median of 3, reading)",
    ]);
  });

  it("holds the home to the showcase ceilings", () => {
    const runs = [run(1900, 140, 0.05), run(1950, 150, 0.04), run(2100, 90, 0)];
    expect(assessLighthouse("/", "showcase", runs).failures).toEqual([]);
    const slow = [
      run(2100, 160, 0.06),
      run(2200, 170, 0.07),
      run(2050, 155, 0.06),
    ];
    expect(assessLighthouse("/", "showcase", slow).failures).toHaveLength(3);
  });

  it("fails an accessibility score below 100", () => {
    const runs = [
      run(1000, 0, 0, 0.98),
      run(1000, 0, 0, 1),
      run(1000, 0, 0, 0.98),
    ];
    expect(assessLighthouse("/", "showcase", runs).failures).toEqual([
      "/: accessibility score 98 < 100 (median of 3)",
    ]);
  });

  it("only warns about the overall performance score", () => {
    const runs = [
      run(1000, 0, 0, 1, 0.8),
      run(1000, 0, 0, 1, 0.85),
      run(1000, 0, 0, 1, 0.82),
    ];
    expect(assessLighthouse("/", "showcase", runs)).toMatchObject({
      failures: [],
      warnings: ["/: performance score 82 < 90 (median of 3, warning only)"],
    });
  });

  it("refuses to judge anything but three runs", () => {
    expect(() =>
      assessLighthouse("/", "showcase", [run(1, 1, 0), run(1, 1, 0)]),
    ).toThrow(/3 runs, got 2/);
  });
});

describe("verdictOfRounds", () => {
  const busyRunner = [run(1064, 168, 0), run(2041, 179, 0), run(1061, 164, 0)];
  const quietRunner = [run(1057, 73, 0), run(1057, 73, 0), run(1056, 77, 0)];

  it("passes a page on a re-measure after a round a busy runner made slow", () => {
    const rounds = [
      assessLighthouse("/", "showcase", busyRunner),
      assessLighthouse("/", "showcase", quietRunner),
    ];
    expect(rounds[0].failures).toEqual([
      "/: TBT 168 ms > 150 ms (median of 3, showcase)",
    ]);
    expect(verdictOfRounds(rounds).failures).toEqual([]);
  });

  it("fails a regression that breaks every round, reporting the last", () => {
    const rounds = [
      assessLighthouse("/", "showcase", busyRunner),
      assessLighthouse("/", "showcase", busyRunner),
    ];
    expect(verdictOfRounds(rounds).failures).toEqual([
      "/: TBT 168 ms > 150 ms (median of 3, showcase)",
    ]);
  });

  it("judges a passing first round on its own", () => {
    const rounds = [assessLighthouse("/", "showcase", quietRunner)];
    expect(verdictOfRounds(rounds)).toEqual(rounds[0]);
  });

  it("refuses to judge no rounds at all", () => {
    expect(() => verdictOfRounds([])).toThrow(/no Lighthouse round/);
  });
});

describe("metricsOf", () => {
  const lhr = {
    audits: {
      "largest-contentful-paint": { numericValue: 1234.5 },
      "total-blocking-time": { numericValue: 12 },
      "cumulative-layout-shift": { numericValue: 0.001 },
    },
    categories: { accessibility: { score: 1 }, performance: { score: 0.97 } },
  };

  it("reads the metrics a run is judged on from a Lighthouse result", () => {
    expect(metricsOf(lhr)).toEqual(run(1234.5, 12, 0.001, 1, 0.97));
  });

  it("fails loudly on a run Lighthouse could not complete", () => {
    expect(() =>
      metricsOf({
        ...lhr,
        runtimeError: { code: "NO_FCP", message: "No paint" },
      }),
    ).toThrow(/NO_FCP: No paint/);
  });
});
