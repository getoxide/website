// `node scripts/build-fixtures.mjs`: one static export per Release state in
// e2e/fixtures/releases.json, into `out-fixtures/<state>/`, for the e2e
// Release-state tests (e2e/download-states.spec.ts). Each is a normal
// `next build` with `SITE_RELEASE_FIXTURE` swapping the Snapshot's Release;
// `out/` and `.next/` are left alone. Playwright runs this before serving.
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const fixtures = Object.keys(
  JSON.parse(
    readFileSync(new URL("../e2e/fixtures/releases.json", import.meta.url)),
  ),
);

for (const fixture of fixtures) {
  const distDir = `out-fixtures/${fixture}`;
  rmSync(new URL(`../${distDir}`, import.meta.url), {
    recursive: true,
    force: true,
  });
  execFileSync("pnpm", ["exec", "next", "build"], {
    cwd: root,
    stdio: ["ignore", "ignore", "inherit"],
    env: {
      ...process.env,
      SITE_RELEASE_FIXTURE: fixture,
      SITE_DIST_DIR: distDir,
      NEXT_TELEMETRY_DISABLED: "1",
    },
  });
  console.log(`Built ${distDir}`);
}
