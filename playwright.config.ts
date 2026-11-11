import { defineConfig, devices } from "@playwright/test";
import { FIXTURES, PORT, fixturePort } from "./e2e/ports";

// Runs against the static export served locally: `pnpm build` first, then
// `pnpm e2e`. Never against a Vercel preview (Budgets, Enforcement in CI).
// Set E2E_PORT if :3130 is busy; the fixture exports take the next ports.

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `http://localhost:${PORT}`, ...devices["Desktop Chrome"] },
  projects: [{ name: "chromium" }],
  webServer: [
    {
      command: `node scripts/serve-out.mjs --port ${PORT}`,
      url: `http://localhost:${PORT}`,
      // Never reuse a server: another worktree's export may hold the port, and
      // the suite must test this checkout's `out/`. Set E2E_PORT if it is busy.
      reuseExistingServer: false,
    },
    {
      // One export per Release state (e2e/download-states.spec.ts), built
      // fresh from this checkout every run.
      command: [
        "node scripts/build-fixtures.mjs &&",
        `node scripts/serve-out.mjs --port ${fixturePort(FIXTURES[0])}`,
        ...FIXTURES.map((f) => `--root out-fixtures/${f}`),
      ].join(" "),
      url: `http://localhost:${fixturePort(FIXTURES.at(-1)!)}`,
      reuseExistingServer: false,
      timeout: 240_000,
    },
  ],
});
