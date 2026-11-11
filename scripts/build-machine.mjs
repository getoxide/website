// Writes the machine-readable root files (`/robots.txt`, `/sitemap.xml`,
// `/llms.txt`) from the PAGES registry and the committed Snapshot into
// `public/`, which Next copies into the static export. The output is not
// committed (`.gitignore`), like `public/captures/`; `pnpm build` and `pnpm
// dev` regenerate it, so a new registry page is picked up automatically.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PAGES } from "../src/content/pages.ts";
import { machineFiles } from "../src/lib/machine.ts";

/**
 * @param {{ outDir: string, pages?: readonly object[], snapshot: object }} options
 * @returns {{ path: string, content: string }[]}
 */
export function buildMachine({
  outDir,
  pages = Object.values(PAGES),
  snapshot,
}) {
  const files = machineFiles(pages, snapshot);
  for (const { path, content } of files) {
    const file = join(outDir, path.slice(1));
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
  }
  return files;
}

function main() {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const snapshot = JSON.parse(
    readFileSync(join(root, "content/oxide/snapshot.json"), "utf8"),
  );
  const files = buildMachine({ outDir: join(root, "public"), snapshot });
  console.log(
    `Machine files written: ${files.map((file) => file.path).join(", ")}`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
