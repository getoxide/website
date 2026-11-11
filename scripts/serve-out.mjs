// Serves the static export in `out/` the way Vercel serves it: clean URLs
// (`/privacy` -> `privacy.html`) and `404.html` with status 404 for anything
// else. Used by Playwright in CI; never a Vercel preview (Budgets, Enforcement
// in CI). Usage: `node scripts/serve-out.mjs [--port 3100] [--root out ...]`;
// with several `--root`s, the n-th is served on port + n (the per-Release-
// state test exports, see scripts/build-fixtures.mjs).
import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { createGzip } from "node:zlib";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

/** Every value given to a `--name` flag, in order. */
const args = (name) =>
  process.argv.flatMap((a, i) => (a === name ? [process.argv[i + 1]] : []));

const rootOf = (dir) =>
  fileURLToPath(new URL(`../${dir}/`, import.meta.url)).replace(/\/$/, "");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".avif": "image/avif",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
  ".mp4": "video/mp4",
};

const COMPRESSIBLE = new Set([
  ".html",
  ".js",
  ".css",
  ".json",
  ".txt",
  ".svg",
  ".xml",
]);

function isFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

/**
 * A URL path decoded, or `null` when its percent-escapes are malformed.
 * A request for `/%E0%A4%A` must not throw out of the handler.
 * @param {string} urlPath
 */
export function decodePath(urlPath) {
  try {
    return decodeURIComponent(urlPath);
  } catch {
    return null;
  }
}

/** Maps a URL path to a file in ROOT, or `null` when it is a 404. */
function resolve(ROOT, urlPath) {
  const decoded = decodePath(urlPath);
  if (decoded === null) return null;
  const clean = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const base = join(ROOT, clean);
  if (!base.startsWith(ROOT)) return null;
  const candidates =
    clean === "/" || clean === ""
      ? [join(ROOT, "index.html")]
      : [base, `${base.replace(/\/$/, "")}.html`, join(base, "index.html")];
  return candidates.find(isFile) ?? null;
}

const port = Number(args("--port")[0] || process.env.PORT || 3100);
const roots = args("--root");

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const [i, dir] of (roots.length ? roots : ["out"]).entries()) {
    const ROOT = rootOf(dir);
    createServer((req, res) => {
      const url = new URL(req.url ?? "/", "http://localhost");
      const file = resolve(ROOT, url.pathname);
      const path = file ?? join(ROOT, "404.html");
      const type = TYPES[extname(path)] ?? "application/octet-stream";
      // Vercel compresses text assets (brotli; gzip stands in here), and the
      // Lighthouse gate's simulated network counts the bytes sent.
      const gzip =
        COMPRESSIBLE.has(extname(path)) &&
        /\bgzip\b/.test(req.headers["accept-encoding"] ?? "");
      res.writeHead(file ? 200 : 404, {
        "content-type": type,
        ...(gzip
          ? { "content-encoding": "gzip", vary: "Accept-Encoding" }
          : {}),
      });
      if (req.method === "HEAD") return res.end();
      const body = createReadStream(path);
      (gzip ? body.pipe(createGzip()) : body).pipe(res);
    }).listen(port + i, () => {
      console.log(`Serving ${dir}/ on http://localhost:${port + i}`);
    });
  }
}
