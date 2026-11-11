# Static export, with Vercel config for redirects and headers

The site builds with `output: 'export'` and CI tests the exported `out/` served locally, as the budgets require. Under export Next drops `redirects()` and `headers()`, so redirects (`/docs` → `/docs/quick-start`, every future renamed URL) and the `X-Robots-Tag: noindex` rule for non-production hosts live in `vercel.json`. This departs from the personal site, which keeps `redirects()` in `next.config.ts`; a move off Vercel means translating `vercel.json`, nothing else.
