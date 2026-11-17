# CodingHub Web Services Project Audit

## Authoritative checklist

The scope for this audit is the uploaded Web Services checklist image, which contains 28 requirements from Module 2, Modules 1/3/4, and the laboratory. It is not a Cloud Computing syllabus. The checklist is represented in the workspace by the existing [REQUIREMENTS_TRACKER.md](./REQUIREMENTS_TRACKER.md), and each status below is based on implementation and test evidence rather than the presence of dependencies.

## Scope and method

This audit was performed against the current working tree on 2026-11-17. It covers the root package scripts, the TypeScript Express backend, the React/Vite frontend, MongoDB models and persistence, Docker configuration, existing documentation, and the backend test suite.

The backend baseline was verified with:

```powershell
npm.cmd test
```

Result: **6 tests passed**, including API contract checks, MongoDB persistence and validation, repeatable JSON migration, connection failure handling, and bounded upstream retries.

## Current architecture

- Frontend: React/Vite application in `frontend/`.
- Backend: Express 5 + TypeScript application in `backend/src/`.
- API prefix: `/api/v1`.
- Primary datastore: MongoDB through Mongoose.
- External integrations: Codeforces, LeetCode, CodeChef, GeeksforGeeks, and HackerRank adapters in `platformSync.ts`.
- Deployment: Docker/Compose configuration with MongoDB and an Nginx frontend proxy.
- Authentication: signed bearer tokens with scrypt password hashes.
- Existing API controls: Helmet, allowlisted CORS, request IDs, JSON body limits, Problem Details-style errors, ETags, If-Match, idempotency records, rate limiting, timeouts, and bounded retries.

## Findings

### Implemented and verified

- REST route grouping and API versioning.
- MongoDB models, indexes, connection lifecycle, and JSON migration.
- Authentication and protected user-owned resources.
- Idempotent contest creation with durable MongoDB records and replay handling.
- Conditional GET with ETags and `304 Not Modified`.
- `If-Match` handling for contest updates.
- Rate-limit headers and `429` responses.
- Request size/media checks, CORS allowlist, Helmet, health endpoint, and Docker health checks.
- Outbound timeout and transient retry behavior.
- Reusable Ajv body validation on authentication and user update routes.
- XML content negotiation, self-hosted Swagger UI at `/api-docs`, validated incoming request IDs, and structured JSON request logs.
- Optional cursor pagination with an opaque `nextCursor` and next URL for contest listings, while preserving the existing page-based frontend contract.
- Backend build and isolated integration tests.

### Partially implemented

- Error responses are Problem Details compatible, but the codebase has two error middleware implementations and should converge on one documented response shape.
- Contest listing uses page/offset pagination rather than cursor pagination.
- OpenAPI is handwritten and covers the REST API, and the same document is served through self-hosted Swagger UI.
- JWT-like bearer tokens are signed and expiring, but the implementation is custom HMAC code rather than a maintained JWT library and does not yet implement role-based authorization.
- Public API responses are JSON-only; XML negotiation is not implemented.
- Environment configuration is documented, but SQL and production deployment evidence are not present.

### Remaining constraints

- Live internet deployment cannot be verified without a deployment URL and credentials.
- PostgreSQL and SOAP modules are implemented, configurable, and covered by focused local tests; live external-service verification is still environment-dependent.
- GraphQL resource queries and an authenticated ADMIN route are covered by the isolated MongoDB integration test.

## Risk notes

- The root example environment file contained credential-shaped sample values; these must remain placeholders and must never be treated as deployable secrets.
- The default development JWT fallback is unsuitable for production and should be rejected when `NODE_ENV=production`.
- Live provider calls and internet deployment cannot be claimed as verified without a reachable provider/deployment URL.

See [REQUIREMENTS_TRACKER.md](./REQUIREMENTS_TRACKER.md) for the requirement-by-requirement status and evidence.
