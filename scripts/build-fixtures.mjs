// `node scripts/build-fixtures.mjs`: one static export per Release state in
// e2e/fixtures/releases.json, into `out-fixtures/<state>/`, for the e2e
// Release-state tests (e2e/download-states.spec.ts). Each is a normal
// `next build` with `SITE_RELEASE_FIXTURE` swapping the Snapshot's Release;
// `out/` and `.next/` are left alone. Playwright runs this before serving.
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { exportedPages, htmlFileOf, registry } from "./exported-pages.mjs";
import {
  stripClientScripts,
  stripsClientScripts,
} from "./strip-reading-js.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const pages = await registry();
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
  const outDir = join(root, distDir);
  for (const page of exportedPages(outDir, pages).filter(stripsClientScripts)) {
    const html = stripClientScripts(page.html);
    if (html !== page.html) {
      writeFileSync(join(outDir, htmlFileOf(page.path)), html);
    }
  }
  console.log(`Built ${distDir}`);
}
