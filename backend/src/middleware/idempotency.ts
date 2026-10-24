import { createHash, randomUUID } from "node:crypto";
import { IdempotencyRecord } from "../services/store.js";
import { problem } from "./problem.js";
import { isMongoConnected } from "../config/db.js";

const retentionMs = 24 * 60 * 60 * 1000;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function idempotency(req, res, next) {
  const header = req.get("Idempotency-Key");
  if (!header || !isMongoConnected) return next();
  if (!/^[A-Za-z0-9._:-]{8,128}$/.test(header))
    return next(
      problem(400, "Idempotency-Key must be 8 to 128 safe characters.", {
        code: "invalid_idempotency_key",
      }),
    );

  const key = `${req.user?.id ?? req.ip}:${req.baseUrl}${req.path}:${header}`;
  const fingerprint = createHash("sha256")
    .update(JSON.stringify(req.body ?? null))
    .digest("hex");
  const ownerToken = randomUUID();
  const now = new Date();

  try {
    await IdempotencyRecord.create({
      key,
      fingerprint,
      ownerToken,
      status: 0,
      expiresAt: new Date(Date.now() + retentionMs),
      leaseUntil: new Date(Date.now() + 30_000),
    });
    req.idempotencyContext = {
      key,
      fingerprint,
      ownerToken,
      expiresAt: new Date(Date.now() + retentionMs),
    };
    return next();
  } catch (error: any) {
    if (error?.code !== 11000) return next();
  }

  try {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const record = await IdempotencyRecord.findOne({ key }).lean();
      if (!record) break;
      if (record.expiresAt <= now) {
        await IdempotencyRecord.deleteOne({
          _id: record._id,
          expiresAt: record.expiresAt,
        });
        try {
          await IdempotencyRecord.create({
            key,
            fingerprint,
            ownerToken,
            status: 0,
            expiresAt: new Date(Date.now() + retentionMs),
            leaseUntil: new Date(Date.now() + 30_000),
          });
          req.idempotencyContext = {
            key,
            fingerprint,
            ownerToken,
            expiresAt: new Date(Date.now() + retentionMs),
          };
          return next();
        } catch (error: any) {
          if (error?.code !== 11000) return next();
        }
        continue;
      }
      if (record.fingerprint !== fingerprint)
        return next(
          problem(
            409,
            "This Idempotency-Key was already used with a different request body.",
            { code: "idempotency_key_reused" },
          ),
        );
      if (record.status > 0) {
        res.set("Idempotency-Replayed", "true");
        return res.status(record.status).json(record.body);
      }
      await wait(50);
    }
  } catch (err) {
    console.warn("Idempotency lookup warning:", err);
  }
  return next();
}

export async function commitIdempotentResponse(req, status, body) {
  if (!req.idempotencyContext || !isMongoConnected) return;
  const { key, ownerToken, expiresAt } = req.idempotencyContext;
  try {
    await IdempotencyRecord.updateOne(
      { key, ownerToken },
      { $set: { status, body, leaseUntil: null, expiresAt } },
    );
  } catch (err) {
    console.warn("Idempotency commit warning:", err);
  }
}
