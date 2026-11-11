// Ports of the static servers Playwright starts: `out/` on E2E_PORT, and one
// fixture export per Release state on the ports after it.
export const PORT = Number(process.env.E2E_PORT ?? 3130);

/** Release states built from e2e/fixtures/releases.json. */
export const FIXTURES = [
  "stable",
  "prerelease-only",
  "unresolved",
  "none",
] as const;

export type Fixture = (typeof FIXTURES)[number];

export const fixturePort = (fixture: Fixture) =>
  PORT + 1 + FIXTURES.indexOf(fixture);

/** The origin of the export built with that fixture's Release. */
export const fixtureOrigin = (fixture: Fixture) =>
  `http://localhost:${fixturePort(fixture)}`;
