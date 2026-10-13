import { createHash } from "node:crypto";
export const etagFor = (value) => `"${createHash("sha256").update(JSON.stringify(value)).digest("hex")}"`;
export const cachePublic = (maxAge = 60) => (_req, res, next) => {
    res.set("Cache-Control", `public, max-age=${maxAge}, stale-while-revalidate=60`);
    next();
};
export const conditionalJson = (req, res, body) => {
    const etag = etagFor(body);
    res.set("ETag", etag);
    const candidates = (req.get("If-None-Match") || "").split(",").map((value) => value.trim());
    if (req.method === "GET" && candidates.some((candidate) => candidate === "*" || candidate === etag || candidate === `W/${etag}`)) {
        return res.status(304).end();
    }
    return res.json(body);
};
