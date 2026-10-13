# CodingHub project brief

## Purpose

CodingHub gives programmers one place to link public coding-platform profiles, review synced progress, browse contest schedules, and keep personal contest reminders.

## Users

- **Guest:** views the landing page, platform catalog, public contest list, and public leaderboard.
- **Registered user:** manages their own profile, connected handles, dashboard, and reminders; may create contests and edit or delete contests they created.

There are no administrator or moderator roles in the current implementation.

## Domain records and ownership

| Record | Owner | Current representation |
|---|---|---|
| User | Account holder | MongoDB user document `{ _id, name, email, passwordHash, createdAt }`; deleting the account cleans owned profiles/reminders, authored contests, and scoped idempotency records. |
| Connected profile | User | MongoDB profile document `{ userId, platformId, handle, connectedAt, stats, syncStatus, lastSyncedAt }`. |
| Contest | Creator for writes; public for reads | MongoDB contest document `{ _id, title, platform, startAt, url, status, createdBy, createdAt, ... }` |
| Reminder | User | MongoDB document with a unique `(userId, contestId)` key. |
| Idempotency result | Requesting user (or anonymous client for unauthenticated scope) | MongoDB key, body fingerprint, original status/body, expiration, and processing lease. |

The API uses MongoDB through Mongoose. User and contest IDs remain string UUIDs for compatibility with existing tokens and references. `backend/data/store.json`, when present, is import-only source data and is never modified or removed by the importer.

## Capabilities

1. Account registration, login, and current-user lookup.
2. User profile update and account deletion.
3. Coding-platform catalog and per-user profile connections.
4. Codeforces and LeetCode public-profile statistics synchronization.
5. Contest discovery with pagination, filtering, and contest ownership operations.
6. Personal contest reminders.
7. Progress dashboard and public aggregate leaderboard.

## Main workflow: connect and sync a profile

1. The authenticated client sends `PUT /api/v1/platforms/{platformId}` with a public handle.
2. The API validates the catalog entry and handle, then stores the connection for the authenticated user.
3. The client sends `POST /api/v1/platforms/{platformId}/sync`.
4. A provider adapter fetches public data with a deadline and bounded transient-failure retries.
5. The API updates that user's profile record and returns rating, solved count, sync status, and timestamp. A provider error is returned as Problem Details and the failure status is retained for retry/display.

## Non-goals and decisions

- CodingHub does not need restaurant, order, payment, rider, or delivery entities.
- No SOAP partner is required by the current product, so no SOAP/WSDL runtime has been added. The JSON REST API is the application contract.
- No microservices are justified at this scale; route modules and services live in one Express process.
- Automatic stats sync is currently available for Codeforces and LeetCode only. Other catalog entries can be connected but do not claim synchronized data.
