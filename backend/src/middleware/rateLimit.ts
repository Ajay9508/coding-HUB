import { RateLimitBucket } from "../services/store.js";
import { problem } from "./problem.js";
import { isMongoConnected } from "../config/db.js";

const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

export const rateLimit =
  ({ name, limit, windowMs, key = (req: any) => req.ip }) =>
  async (req: any, res: any, next: any) => {
    const bucketKey = `${name}:${key(req)}`;

    // If MongoDB is connected, use Mongoose model
    if (isMongoConnected) {
      const now = new Date();
      try {
        await RateLimitBucket.updateOne(
          { _id: bucketKey },
          [
            {
              $set: {
                count: {
                  $cond: [
                    { $lte: ["$resetAt", now] },
                    1,
                    { $add: [{ $ifNull: ["$count", 0] }, 1] },
                  ],
                },
                resetAt: {
                  $cond: [
                    { $lte: ["$resetAt", now] },
                    new Date(Date.now() + windowMs),
                    { $ifNull: ["$resetAt", new Date(Date.now() + windowMs)] },
                  ],
                },
              },
            },
          ],
          { upsert: true, updatePipeline: true },
        );
        const bucket: any = await RateLimitBucket.findById(bucketKey).lean();
        if (bucket) {
          const remaining = Math.max(0, limit - bucket.count);
          const retryAfter = Math.max(
            1,
            Math.ceil((bucket.resetAt.getTime() - Date.now()) / 1000),
          );
          res.set({
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "RateLimit-Reset": String(
              Math.ceil(bucket.resetAt.getTime() / 1000),
            ),
          });
          if (bucket.count > limit) {
            res.set("Retry-After", String(retryAfter));
            return next(
              problem(
                429,
                "Too many requests. Please retry after the indicated delay.",
                { code: "rate_limit_exceeded" },
              ),
            );
          }
          return next();
        }
      } catch (error) {
        console.warn("Mongo rate limit failed, using in-memory bucket:", error);
      }
    }

    // In-memory fallback
    const nowMs = Date.now();
    let current = memoryBuckets.get(bucketKey);
    if (!current || current.resetAt <= nowMs) {
      current = { count: 1, resetAt: nowMs + windowMs };
    } else {
      current.count += 1;
    }
    memoryBuckets.set(bucketKey, current);

    const remaining = Math.max(0, limit - current.count);
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - nowMs) / 1000));
    res.set({
      "X-RateLimit-Limit": String(limit),
      "X-RateLimit-Remaining": String(remaining),
      "RateLimit-Reset": String(Math.ceil(current.resetAt / 1000)),
    });

    if (current.count > limit) {
      res.set("Retry-After", String(retryAfter));
      return next(
        problem(
          429,
          "Too many requests. Please retry after the indicated delay.",
          { code: "rate_limit_exceeded" },
        ),
      );
    }

    return next();
  };

export const clearRateLimitBuckets = () => {
  memoryBuckets.clear();
  if (isMongoConnected) {
    return RateLimitBucket.deleteMany({});
  }
  return Promise.resolve();
};
