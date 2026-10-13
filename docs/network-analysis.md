# Browser network analysis

**Evidence status: pending manual browser inspection.** No DevTools capture was available during this repository audit, so request totals, transferred bytes, slowest resource, redirects, and browser-observed errors are intentionally not stated here.

## Reproducible capture

1. Start the app using the root `npm run dev` command and open `http://localhost:5173`.
2. Open browser DevTools → **Network**, enable **Preserve log**, clear the request list, and reload the page.
3. Record the route, browser cache setting, viewport, start/end time, total request count, total transferred/resource size, and the slowest request (URL, type, duration, status).
4. Filter to Fetch/XHR and inspect an API navigation such as `/platforms` while signed out, then sign in and open `/dashboard`. Record status codes, request IDs, response sizes, and any redirects/errors. Do not include bearer tokens, email addresses, or other personal response data in the report.
5. Repeat once with cache disabled and once with cache enabled; distinguish transferred size from resource size and record whether the API returned `304`.
6. Add a dated, redacted measurement table below. Attach a HAR only after removing authorization headers, cookies, and personal data.

| Capture date | Route | Cache | Request count | Transferred/resource size | Slowest resource | Redirects/errors |
|---|---|---|---:|---|---|---|
| Pending | — | — | — | — | — | — |
