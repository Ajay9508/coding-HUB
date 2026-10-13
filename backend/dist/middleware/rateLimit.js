import { RateLimitBucket } from "../services/store.js";
import { problem } from "./problem.js";
export const rateLimit = ({ name, limit, windowMs, key = (req) => req.ip }) => async (req, res, next) => {
    const now = new Date();
    const bucketKey = `${name}:${key(req)}`;
    try {
        await RateLimitBucket.updateOne({ _id: bucketKey }, [{ $set: { count: { $cond: [{ $lte: ["$resetAt", now] }, 1, { $add: [{ $ifNull: ["$count", 0] }, 1] }] }, resetAt: { $cond: [{ $lte: ["$resetAt", now] }, new Date(Date.now() + windowMs), { $ifNull: ["$resetAt", new Date(Date.now() + windowMs)] }] } } }], { upsert: true, updatePipeline: true });
        const bucket = await RateLimitBucket.findById(bucketKey).lean();
        const remaining = Math.max(0, limit - bucket.count);
        const retryAfter = Math.max(1, Math.ceil((bucket.resetAt.getTime() - Date.now()) / 1000));
        res.set({ "X-RateLimit-Limit": String(limit), "X-RateLimit-Remaining": String(remaining), "RateLimit-Reset": String(Math.ceil(bucket.resetAt.getTime() / 1000)) });
        if (bucket.count > limit) {
            res.set("Retry-After", String(retryAfter));
            return next(problem(429, "Too many requests. Please retry after the indicated delay.", { code: "rate_limit_exceeded" }));
        }
        return next();
    }
    catch (error) {
        return next(error);
    }
};
export const clearRateLimitBuckets = () => RateLimitBucket.deleteMany({});
