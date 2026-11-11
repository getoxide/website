import { defineConfig, devices } from "@playwright/test";

// Runs against the static export served locally: `pnpm build` first, then
// `pnpm e2e`. Never against a Vercel preview (Budgets, Enforcement in CI).
const PORT = Number(process.env.E2E_PORT ?? 3130);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `http://localhost:${PORT}`, ...devices["Desktop Chrome"] },
  projects: [{ name: "chromium" }],
  webServer: {
    command: `node scripts/serve-out.mjs --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    // Never reuse a server: another worktree's export may hold the port, and
    // the suite must test this checkout's `out/`. Set E2E_PORT if it is busy.
    reuseExistingServer: false,
  },
});
