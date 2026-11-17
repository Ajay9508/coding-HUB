# CodingHub Web Services 28-Requirement Tracker

Source of truth: the uploaded Web Services checklist image supplied for this project. This tracker is intentionally not a Cloud Computing syllabus tracker.

Statuses use **COMPLETED**, **PARTIALLY COMPLETED**, **NOT IMPLEMENTED**, and **TESTED AND VERIFIED**. A package or file is not counted as implementation without behavior or test evidence.

| # | Requirement | Status | Evidence / remaining work |
|---:|---|---|---|
| 1 | Correct HTTP methods and status codes | TESTED AND VERIFIED | REST routes use GET/POST/PUT/PATCH/DELETE; covered by `backend/test/api.test.js`. |
| 2 | POST `Idempotency-Key` | TESTED AND VERIFIED | MongoDB `IdempotencyRecord`, request fingerprinting, replay, mismatch `409`, and concurrent protection in `backend/src/middleware/idempotency.ts`. |
| 3 | Ajv JSON Schema validation | TESTED AND VERIFIED | Reusable Ajv middleware and typed schemas are applied to register, login, and user patch routes in `backend/src/middleware/validate.ts`. |
| 4 | `/api/v1` versioning | COMPLETED | Routes are mounted under `/api/v1` in `backend/src/app.ts`. |
| 5 | At least eight HTTP status codes | TESTED AND VERIFIED | Existing tests exercise 200, 201, 204, 401, 406, 409, 412, 415, 422, 429, and 404; 5xx paths are implemented but need dedicated assertions. |
| 6 | ETag and 304 | TESTED AND VERIFIED | `conditionalGet.ts` and API tests verify a repeated contest GET returns `304`. |
| 7 | JSON/XML content negotiation | TESTED AND VERIFIED | `contentNegotiation.ts` serializes successful responses as XML for `Accept: application/xml`; unsupported media still returns `406`. |
| 8 | Cursor pagination and next link | COMPLETED | Contest listing accepts an opaque cursor and returns `nextCursor` plus a relative `next` URL; page-based pagination remains backward compatible. |
| 9 | Consistent error body | TESTED AND VERIFIED | `error-handler.ts` now delegates to the single Problem Details implementation in `errorMiddleware.ts`; API tests verify structured error responses. |
| 10 | Cache-Control on every GET | TESTED AND VERIFIED | API GETs receive private `no-store` by default, while public catalog/contest/leaderboard reads override with explicit public caching; route tests verify the conditional public behavior. |
| 11 | Resource-shaped URLs | TESTED AND VERIFIED | Existing routes are resource-oriented; action-like provider sync is a deliberate external operation endpoint. |
| 12 | Rate-limit headers and 429 | TESTED AND VERIFIED | Mongo-backed/in-memory limiter emits `X-RateLimit-*`, `RateLimit-Reset`, `Retry-After`, and `429`. |
| 13 | Handwritten OpenAPI | COMPLETED | `docs/openapi.yaml` is maintained manually and documents REST endpoints and schemas. |
| 14 | GraphQL endpoint | TESTED AND VERIFIED | `/graphql` exposes users, profiles, contests, discussions, and health queries; the Mongo-backed resource query is exercised against the isolated MongoDB test database. |
| 15 | Circuit breaker | TESTED AND VERIFIED | `CircuitBreaker` implements CLOSED/OPEN/HALF_OPEN and is used by provider sync; a focused transition test passes. |
| 16 | PostgreSQL parameterized SQL module | TESTED AND VERIFIED | `services/sql/auditLog.ts` creates `api_audit_log` and inserts through `$1..$4` parameters; focused tests verify the SQL text and bound values. A live production database is still optional. |
| 17 | Deliberate CORS | TESTED AND VERIFIED | `FRONTEND_URL` allowlist, credentials, methods, and preflight behavior are configured and tested. |
| 18 | Deployed and reachable online | BLOCKED | Docker/Compose and health-check readiness are implemented, but no deployment URL or credentials were supplied. Live internet reachability cannot be claimed without an external deployment step. |
| 19 | Self-hosted Swagger UI | TESTED AND VERIFIED | `swagger-ui-express` serves the handwritten OpenAPI document at `/api-docs`; an integration test verifies the page. |
| 20 | Timeout on every outbound call | TESTED AND VERIFIED | Provider tests verify an `AbortSignal` is passed and timeout errors become controlled `504` responses; SOAP and PostgreSQL timeout settings are configured through environment variables. |
| 21 | Express middleware and central errors | TESTED AND VERIFIED | Request ID, auth, role authorization, rate limit, security, validation, content negotiation, structured logging, and one delegated error handler are registered. |
| 22 | MongoDB document store | TESTED AND VERIFIED | Mongoose models, indexes, connection lifecycle, migration, and isolated Mongo tests are present. |
| 23 | Jest/Supertest automated tests | TESTED AND VERIFIED | Existing Node integration tests pass; `npm --prefix backend run test:jest` passes a Supertest health test. |
| 24 | WSDL and SOAP call | TESTED AND VERIFIED | Dedicated SOAP service reads the configurable calculator WSDL, invokes `AddAsync`, enforces a timeout, and exposes an authenticated calculator route; tests verify WSDL options and operation arguments without requiring the public provider. |
| 25 | Retry with increasing backoff | TESTED AND VERIFIED | Provider retry tests verify transient retries and no retry for client errors; `Retry-After` handling should be added for full checklist coverage. |
| 26 | Structured correlation logging | TESTED AND VERIFIED | Requests emit JSON logs with request ID, method, URL, status, and duration; request bodies and credentials are not logged, and request-ID behavior is integration-tested. |
| 27 | JWT authentication and authorization | TESTED AND VERIFIED | Expiring signed bearer tokens, scrypt hashes, `USER`/`ADMIN` roles, and `authorizeRoles` middleware are verified by an authenticated ADMIN route test. |
| 28 | Docker and twelve-factor config | TESTED AND VERIFIED | Dockerfiles, Compose Mongo service, health checks, environment examples, and ignored secrets are present; production deployment validation remains external. |

## Verification commands

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run lint
docker compose config
```

Only results actually run in the current environment should be reported as passed. Live deployment, live SOAP, and live provider checks require external connectivity and credentials.
