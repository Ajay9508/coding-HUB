import { createHash, randomUUID } from "node:crypto";
import { IdempotencyRecord } from "../services/store.js";
import { problem } from "./problem.js";
const retentionMs = 24 * 60 * 60 * 1000;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export default async function idempotency(req, res, next) {
    const header = req.get("Idempotency-Key");
    if (!header)
        return next();
    if (!/^[A-Za-z0-9._:-]{8,128}$/.test(header))
        return next(problem(400, "Idempotency-Key must be 8 to 128 safe characters.", { code: "invalid_idempotency_key" }));
    const key = `${req.user?.id ?? req.ip}:${req.baseUrl}${req.path}:${header}`;
    const fingerprint = createHash("sha256").update(JSON.stringify(req.body ?? null)).digest("hex");
    const ownerToken = randomUUID();
    const now = new Date();
    try {
        await IdempotencyRecord.create({ key, fingerprint, ownerToken, status: 0, expiresAt: new Date(Date.now() + retentionMs), leaseUntil: new Date(Date.now() + 30_000) });
        req.idempotencyContext = { key, fingerprint, ownerToken, expiresAt: new Date(Date.now() + retentionMs) };
        return next();
    }
    catch (error) {
        if (error?.code !== 11000)
            return next(error);
    }
    for (let attempt = 0; attempt < 100; attempt += 1) {
        const record = await IdempotencyRecord.findOne({ key }).lean();
        if (!record)
            break;
        if (record.expiresAt <= now) {
            await IdempotencyRecord.deleteOne({ _id: record._id, expiresAt: record.expiresAt });
            try {
                await IdempotencyRecord.create({ key, fingerprint, ownerToken, status: 0, expiresAt: new Date(Date.now() + retentionMs), leaseUntil: new Date(Date.now() + 30_000) });
                req.idempotencyContext = { key, fingerprint, ownerToken, expiresAt: new Date(Date.now() + retentionMs) };
                return next();
            }
            catch (error) {
                if (error?.code !== 11000)
                    return next(error);
            }
            continue;
        }
        if (record.fingerprint !== fingerprint)
            return next(problem(409, "This Idempotency-Key was already used with a different request body.", { code: "idempotency_key_reused" }));
        if (record.status > 0) {
            res.set("Idempotency-Replayed", "true");
            return res.status(record.status).json(record.body);
        }
        if (!record.leaseUntil || record.leaseUntil <= new Date()) {
            const claimed = await IdempotencyRecord.findOneAndUpdate({ key, status: 0, leaseUntil: record.leaseUntil ?? null }, { $set: { ownerToken, leaseUntil: new Date(Date.now() + 30_000) } }, { returnDocument: "after" }).lean();
            if (claimed?.ownerToken === ownerToken) {
                req.idempotencyContext = { key, fingerprint, ownerToken, expiresAt: new Date(Date.now() + retentionMs) };
                return next();
            }
        }
        await wait(50);
    }
    return next(problem(503, "The original request is still being processed. Retry with the same Idempotency-Key.", { code: "idempotency_in_progress" }));
}
export const commitIdempotentResponse = async (req, status, body) => {
    if (!req.idempotencyContext)
        return;
    const { key, fingerprint, ownerToken, expiresAt } = req.idempotencyContext;
    const result = await IdempotencyRecord.updateOne({ key, fingerprint, ownerToken, status: 0 }, { $set: { status, body, expiresAt }, $unset: { ownerToken: 1, leaseUntil: 1 } });
    if (!result.modifiedCount)
        throw new Error("Could not persist idempotent response; refusing to report success.");
};
