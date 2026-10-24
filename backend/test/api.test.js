import test, { after } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.MONGOMS_DOWNLOAD_DIR = join(tmpdir(), "codinghub-mongodb-binaries");
const mongo = await MongoMemoryServer.create({
  instance: { launchTimeout: 60_000 },
});
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-only-secret-with-at-least-32-characters";
process.env.MONGODB_URI = mongo.getUri("codinghub_test");
process.env.AUTH_RATE_LIMIT = "3";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.ENABLE_HSTS = "false";

const [
  { default: app },
  { requestJson },
  models,
  { createToken },
  { connectDatabase, closeDatabase },
] = await Promise.all([
  import("../dist/app.js"),
  import("../dist/services/platformSync.js"),
  import("../dist/services/store.js"),
  import("../dist/services/authService.js"),
  import("../dist/config/db.js"),
]);
const { User, Contest, Profile, Reminder, IdempotencyRecord } = models;
await connectDatabase();
after(async () => {
  await closeDatabase();
  await mongo.stop();
});

test("API contract, ownership, conditional requests, and idempotent contest creation", async (t) => {
  const server = app.listen(0);
  await once(server, "listening");
  t.after(() => {
    server.close();
  });
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;

  const missingAuth = await fetch(`${base}/dashboard`);
  assert.equal(missingAuth.status, 401);
  assert.match(
    missingAuth.headers.get("content-type"),
    /application\/problem\+json/,
  );
  const authProblem = await missingAuth.json();
  assert.equal(authProblem.title, "Unauthorized");
  assert.equal(authProblem.detail, "A valid bearer token is required");

  const notAcceptable = await fetch(`${base}/platforms`, {
    headers: { Accept: "text/plain" },
  });
  assert.equal(notAcceptable.status, 406);

  const preflight = await fetch(`${base}/users/me`, {
    method: "OPTIONS",
    headers: {
      Origin: process.env.FRONTEND_URL,
      "Access-Control-Request-Method": "PATCH",
    },
  });
  assert.equal(preflight.status, 204);
  assert.match(preflight.headers.get("Allow"), /PATCH/);
  assert.equal(
    preflight.headers.get("Access-Control-Allow-Origin"),
    process.env.FRONTEND_URL,
  );

  const unsupportedMedia = await fetch(`${base}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: "name=test",
  });
  assert.equal(unsupportedMedia.status, 415);

  const oversized = await fetch(`${base}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "x".repeat(1_100_000) }),
  });
  assert.equal(oversized.status, 413);

  const malformed = await fetch(`${base}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(malformed.status, 400);
  assert.equal(
    (await malformed.json()).type,
    "urn:codinghub:problem:malformed-json",
  );

  const invalid = await fetch(`${base}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "A", email: "wrong", password: "short" }),
  });
  assert.equal(invalid.status, 422);

  const registration = await fetch(`${base}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Tester User",
      email: "tester@example.com",
      password: "password123",
    }),
  });
  assert.equal(registration.status, 201);
  assert.equal(registration.headers.get("location"), "/api/v1/auth/me");
  assert.equal(registration.headers.get("x-content-type-options"), "nosniff");
  assert.equal(registration.headers.get("strict-transport-security"), null);
  assert.match(
    registration.headers.get("content-type"),
    /application\/json; charset=utf-8/,
  );
  const { token, user } = await registration.json();
  const storedUser = await User.findById(user.id)
    .select("+passwordHash")
    .lean();
  assert.ok(storedUser.passwordHash);
  const auth = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const currentAccount = await fetch(`${base}/auth/me`, { headers: auth });
  assert.equal(currentAccount.status, 200);
  assert.equal("passwordHash" in (await currentAccount.json()).user, false);

  const duplicate = await fetch(`${base}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Tester User",
      email: "tester@example.com",
      password: "password123",
    }),
  });
  assert.equal(duplicate.status, 409);

  const limited = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "missing@example.com",
      password: "password123",
    }),
  });
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers.get("Retry-After")) > 0);

  const contestBody = {
    title: "Test Round",
    platform: "Codeforces",
    startAt: "2030-01-01T12:00:00Z",
    url: "https://codeforces.com/contests/1",
  };
  const create = () =>
    fetch(`${base}/contests`, {
      method: "POST",
      headers: { ...auth, "Idempotency-Key": "contest-create-0001" },
      body: JSON.stringify(contestBody),
    });
  const [created, concurrentReplay] = await Promise.all([create(), create()]);
  assert.equal(created.status, 201);
  assert.equal(concurrentReplay.status, 201);
  const location = created.headers.get("location");
  const createdBody = await created.json();
  assert.equal(
    (await concurrentReplay.json()).contest.id,
    createdBody.contest.id,
  );
  assert.ok(location?.endsWith(createdBody.contest.id));

  const replay = await create();
  assert.equal(replay.status, 201);
  assert.equal(replay.headers.get("Idempotency-Replayed"), "true");
  assert.equal((await replay.json()).contest.id, createdBody.contest.id);
  assert.equal(await IdempotencyRecord.countDocuments({ status: 201 }), 1);

  await IdempotencyRecord.deleteOne({
    key: `${user.id}:/api/v1/contests:contest-create-0001`,
  });
  const recoveredReplay = await create();
  assert.equal(recoveredReplay.status, 201);
  assert.equal(
    (await recoveredReplay.json()).contest.id,
    createdBody.contest.id,
  );
  assert.equal(await Contest.countDocuments({ createdBy: user.id }), 1);

  const mismatch = await fetch(`${base}/contests`, {
    method: "POST",
    headers: { ...auth, "Idempotency-Key": "contest-create-0001" },
    body: JSON.stringify({ ...contestBody, title: "Different" }),
  });
  assert.equal(mismatch.status, 409);

  const contestUrl = `http://127.0.0.1:${server.address().port}${location}`;
  const read = await fetch(contestUrl);
  assert.equal(read.status, 200);
  const etag = read.headers.get("ETag");
  assert.ok(etag);
  const notModified = await fetch(contestUrl, {
    headers: { "If-None-Match": etag },
  });
  assert.equal(notModified.status, 304);
  assert.equal(await notModified.text(), "");

  const staleUpdate = await fetch(contestUrl, {
    method: "PATCH",
    headers: { ...auth, "If-Match": '"stale"' },
    body: JSON.stringify({ title: "Changed" }),
  });
  assert.equal(staleUpdate.status, 412);

  await User.create({
    _id: "another-user",
    name: "Another User",
    email: "another@example.com",
    passwordHash: "not-returned",
    createdAt: new Date().toISOString(),
  });
  const forbidden = await fetch(contestUrl, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${createToken("another-user")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: "Not mine" }),
  });
  assert.equal(forbidden.status, 403);

  const notFound = await fetch(`${base}/missing-route`);
  assert.equal(notFound.status, 404);
  const invalidId = await fetch(`${base}/contests/not-a-uuid`);
  assert.equal(invalidId.status, 422);

  const userId = user.id;
  const authoredId = "00000000-0000-4000-8000-000000000001";
  await Contest.create({
    _id: authoredId,
    title: "Authored contest",
    platform: "Codeforces",
    startAt: "2030-01-01T00:00:00.000Z",
    url: "https://codeforces.com",
    status: "upcoming",
    createdBy: userId,
    createdAt: new Date().toISOString(),
  });
  await Profile.create({
    userId,
    platformId: "codeforces",
    name: "Codeforces",
    handle: "tester",
    connectedAt: new Date().toISOString(),
  });
  await Reminder.create([
    { userId, contestId: authoredId },
    { userId: "another-user", contestId: authoredId },
  ]);
  const deleted = await fetch(`${base}/users/me`, {
    method: "DELETE",
    headers: auth,
  });
  assert.equal(deleted.status, 204);
  assert.equal(await User.exists({ _id: userId }), null);
  assert.equal(await Profile.exists({ userId }), null);
  assert.equal(await Contest.exists({ _id: authoredId }), null);
  assert.equal(await Reminder.exists({ contestId: authoredId }), null);
});

test("MongoDB documents persist across a backend connection restart", async () => {
  await User.create({
    _id: "restart-check",
    name: "Restart User",
    email: "restart@example.com",
    passwordHash: "hash",
    createdAt: new Date().toISOString(),
  });
  await IdempotencyRecord.create({
    key: "restart-check:/api/v1/contests:key-0001",
    fingerprint: "abc",
    status: 201,
    body: { success: true },
    expiresAt: new Date(Date.now() + 60_000),
  });
  await closeDatabase();
  await connectDatabase();
  assert.equal(
    (await User.findById("restart-check").lean()).email,
    "restart@example.com",
  );
  assert.deepEqual(
    (
      await IdempotencyRecord.findOne({
        key: "restart-check:/api/v1/contests:key-0001",
      }).lean()
    ).body,
    { success: true },
  );
});

test("MongoDB rejects duplicate unique keys and invalid user documents", async () => {
  await User.create({
    _id: "unique-one",
    name: "Unique User",
    email: "unique@example.com",
    passwordHash: "hash",
    createdAt: new Date().toISOString(),
  });
  await assert.rejects(
    User.create({
      _id: "unique-two",
      name: "Unique User",
      email: "unique@example.com",
      passwordHash: "hash",
      createdAt: new Date().toISOString(),
    }),
    { code: 11000 },
  );
  await assert.rejects(
    new User({
      _id: "invalid-user",
      name: "x",
      email: "bad",
      passwordHash: "hash",
      createdAt: new Date().toISOString(),
    }).validate(),
  );
});

test("JSON migration is repeatable, preserves relationships, and leaves its source unchanged", async () => {
  const directory = mkdtempSync(join(tmpdir(), "codinghub-migration-"));
  const path = join(directory, "store.json");
  const record = {
    users: [
      {
        id: "migration-user",
        name: "Migration User",
        email: "migration@example.com",
        passwordHash: "legacy-hash",
        createdAt: new Date().toISOString(),
      },
    ],
    profiles: {
      "migration-user": [
        {
          platformId: "codeforces",
          name: "Codeforces",
          handle: "migrated",
          connectedAt: new Date().toISOString(),
          rating: 1234,
          solved: 30,
        },
      ],
    },
    contests: [
      {
        id: "00000000-0000-4000-8000-000000000123",
        title: "Imported Round",
        platform: "Codeforces",
        startAt: "2030-01-01T00:00:00.000Z",
        url: "https://codeforces.com/contest/1",
        status: "upcoming",
        createdBy: "migration-user",
        createdAt: new Date().toISOString(),
      },
    ],
    reminders: { "migration-user": ["00000000-0000-4000-8000-000000000123"] },
    idempotencyKeys: {},
  };
  writeFileSync(path, JSON.stringify(record));
  const sourceBytes = readFileSync(path, "utf8");
  const { migrateJsonFile } = await import("../dist/services/jsonMigration.js");
  const first = await migrateJsonFile(path);
  const second = await migrateJsonFile(path);
  assert.deepEqual(first.imported, {
    users: 1,
    contests: 1,
    profiles: 1,
    reminders: 1,
    idempotencyRecords: 0,
  });
  assert.deepEqual(second.imported, first.imported);
  assert.deepEqual(second.verifiedMongoTotals, first.verifiedMongoTotals);
  assert.equal(
    await Reminder.countDocuments({
      userId: "migration-user",
      contestId: "00000000-0000-4000-8000-000000000123",
    }),
    1,
  );
  assert.equal(readFileSync(path, "utf8"), sourceBytes);
  rmSync(directory, { recursive: true, force: true });
});

test("MongoDB connection failure rejects initialization", async () => {
  const mongoose = (await import("mongoose")).default;
  await closeDatabase();
  await assert.rejects(
    mongoose.connect("mongodb://127.0.0.1:1/unavailable", {
      serverSelectionTimeoutMS: 150,
    }),
  );
  await connectDatabase(process.env.MONGODB_URI);
});

test("upstream request retries transient failures and does not retry client errors", async () => {
  let attempts = 0;
  const result = await requestJson("https://provider.example/data", {
    fetcher: async () => {
      attempts += 1;
      return attempts === 1
        ? new Response("busy", { status: 503 })
        : new Response('{"ok":true}', { status: 200 });
    },
  });
  assert.equal(result.ok, true);
  assert.equal(attempts, 2);

  attempts = 0;
  await assert.rejects(
    requestJson("https://provider.example/data", {
      fetcher: async () => {
        attempts += 1;
        return new Response("missing", { status: 404 });
      },
    }),
    { status: 502 },
  );
  assert.equal(attempts, 1);

  await assert.rejects(
    requestJson("https://provider.example/data", {
      acceptProviderFailure: true,
      fetcher: async () =>
        new Response('{"status":"FAILED","comment":"not found"}', {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }),
    }),
    { status: 422, code: "invalid_platform_handle" },
  );

  attempts = 0;
  await assert.rejects(
    requestJson("https://provider.example/data", {
      fetcher: async () => {
        attempts += 1;
        const error = new Error("timeout");
        error.name = "TimeoutError";
        throw error;
      },
    }),
    { status: 504, retryAfter: 5 },
  );
  assert.equal(attempts, 3);
});
