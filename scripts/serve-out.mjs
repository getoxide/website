// Serves the static export in `out/` the way Vercel serves it: clean URLs
// (`/privacy` -> `privacy.html`) and `404.html` with status 404 for anything
// else. Used by Playwright in CI; never a Vercel preview (Budgets, Enforcement
// in CI). Usage: `node scripts/serve-out.mjs [--port 3100]`.
import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../out", import.meta.url));

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

function isFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

/** Maps a URL path to a file in `out/`, or `null` when it is a 404. */
function resolve(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(
    /^(\.\.[/\\])+/,
    "",
  );
  const base = join(ROOT, clean);
  if (!base.startsWith(ROOT)) return null;
  const candidates =
    clean === "/" || clean === ""
      ? [join(ROOT, "index.html")]
      : [base, `${base.replace(/\/$/, "")}.html`, join(base, "index.html")];
  return candidates.find(isFile) ?? null;
}

const port = Number(
  process.argv[process.argv.indexOf("--port") + 1] || process.env.PORT || 3100,
);

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const file = resolve(url.pathname);
  const path = file ?? join(ROOT, "404.html");
  res.writeHead(file ? 200 : 404, {
    "content-type": TYPES[extname(path)] ?? "application/octet-stream",
  });
  if (req.method === "HEAD") return res.end();
  createReadStream(path).pipe(res);
}).listen(port, () => {
  console.log(`Serving out/ on http://localhost:${port}`);
});
