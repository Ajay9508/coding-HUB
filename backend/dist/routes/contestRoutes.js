import { Router } from "express";
import { randomUUID } from "node:crypto";
import { Contest, Reminder, getUserReminders } from "../services/store.js";
import authMiddleware from "../middleware/authMiddleware.js";
import idempotency, { commitIdempotentResponse, } from "../middleware/idempotency.js";
import { etagFor, cachePublic, conditionalJson, } from "../middleware/conditionalGet.js";
import { problem, rejectUnknownFields, requireObjectBody, } from "../middleware/problem.js";
import { rateLimit } from "../middleware/rateLimit.js";
const router = Router();
router.param("contestId", (req, _res, next, contestId) => {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(contestId))
        return next(problem(422, "contestId must be a valid UUID.", {
            code: "invalid_contest_id",
        }));
    return next();
});
router.get("/reminders", authMiddleware, async (req, res) => res.json({ success: true, reminders: await getUserReminders(req.user.id) }));
router.get("/", cachePublic(30), async (req, res) => {
    const query = req.query;
    const allowedQuery = ["page", "limit", "platform", "status", "search"];
    const unknown = Object.keys(query).filter((key) => !allowedQuery.includes(key));
    if (unknown.length)
        throw problem(422, "Unsupported contest filter.", {
            code: "invalid_query",
            errors: unknown.map((field) => ({
                field,
                message: "This query parameter is not supported.",
            })),
        });
    const parsePositive = (value, fallback, maximum) => {
        if (value === undefined)
            return fallback;
        const number = Number(value);
        if (!Number.isInteger(number) || number < 1 || number > maximum)
            throw problem(422, `Query value must be an integer between 1 and ${maximum}.`, { code: "invalid_query" });
        return number;
    };
    const page = parsePositive(query.page, 1, 1000000);
    const limit = parsePositive(query.limit, 20, 100);
    if (query.status &&
        !["live", "upcoming", "completed"].includes(query.status))
        throw problem(422, "status must be live, upcoming, or completed.", {
            code: "invalid_status",
        });
    const filter = {};
    if (query.platform)
        filter.platform = new RegExp(`^${String(query.platform).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    if (query.status)
        filter.status = query.status;
    if (query.search)
        filter.title = new RegExp(String(query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    let docs = [];
    let total = 0;
    let live = 0;
    let soon = 0;
    let week = 0;
    try {
        const [d, t, l, s, w] = await Promise.all([
            Contest.find(filter).sort({ startAt: 1 }).skip((page - 1) * limit).limit(limit).lean(),
            Contest.countDocuments(filter),
            Contest.countDocuments({ status: "live" }),
            Contest.countDocuments({ status: "upcoming", startAt: { $gte: new Date().toISOString(), $lte: new Date(Date.now() + 86400000).toISOString() } }),
            Contest.countDocuments({ startAt: { $gte: new Date().toISOString(), $lte: new Date(Date.now() + 7 * 86400000).toISOString() } }),
        ]);
        docs = d;
        total = t;
        live = l;
        soon = s;
        week = w;
    }
    catch (err) {
        console.warn("Contest query failed:", err);
    }
    const all = docs.map((doc) => {
        if (doc._id) {
            const { _id, ...item } = doc;
            return { ...item, id: _id };
        }
        return doc;
    });
    return conditionalJson(req, res, {
        success: true,
        contests: all,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
        summary: {
            live,
            next24Hours: soon,
            thisWeek: week,
        },
    });
});
router.get("/:contestId", cachePublic(30), async (req, res) => {
    const doc = await Contest.findById(req.params.contestId).lean();
    const contest = doc ? (({ _id, ...item }) => ({ ...item, id: _id }))(doc) : null;
    if (!contest)
        throw problem(404, "Contest not found.", { code: "contest_not_found" });
    return conditionalJson(req, res, { success: true, contest });
});
router.put("/:contestId/reminder", authMiddleware, async (req, res) => {
    if (!await Contest.exists({ _id: req.params.contestId }))
        throw problem(404, "Contest not found.", { code: "contest_not_found" });
    await Reminder.updateOne({ userId: req.user.id, contestId: req.params.contestId }, { $setOnInsert: { userId: req.user.id, contestId: req.params.contestId } }, { upsert: true });
    const next = await getUserReminders(req.user.id);
    res.json({ success: true, reminders: next });
});
router.delete("/:contestId/reminder", authMiddleware, async (req, res) => {
    if (!await Contest.exists({ _id: req.params.contestId }))
        throw problem(404, "Contest not found.", { code: "contest_not_found" });
    await Reminder.deleteOne({ userId: req.user.id, contestId: req.params.contestId });
    const next = await getUserReminders(req.user.id);
    res.json({ success: true, reminders: next });
});
router.post("/", authMiddleware, rateLimit({
    name: "contest-create",
    limit: Number(process.env.CONTEST_CREATE_RATE_LIMIT) || 30,
    windowMs: Number(process.env.CONTEST_CREATE_RATE_WINDOW_MS) || 60 * 60 * 1000,
    key: (req) => req.user.id,
}), idempotency, async (req, res) => {
    const body = requireObjectBody(req.body);
    rejectUnknownFields(body, [
        "title",
        "platform",
        "startDate",
        "startAt",
        "url",
        "duration",
        "participants",
        "tags",
        "status",
        "description",
    ]);
    const { title, platform, startDate, startAt, url } = req.body ?? {};
    const rawDate = startAt ?? startDate;
    if (![title, platform, rawDate, url].every((value) => typeof value === "string" && value.trim()))
        throw problem(422, "title, platform, startDate (or startAt), and url are required.", { code: "missing_fields" });
    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime()))
        throw problem(422, "Contest start date is invalid.", {
            code: "invalid_start_date",
        });
    let safeUrl;
    try {
        safeUrl = new URL(url);
        if (!["http:", "https:"].includes(safeUrl.protocol))
            throw new Error("Unsupported URL protocol");
    }
    catch {
        throw problem(422, "Contest URL must be a valid HTTP or HTTPS link.", {
            code: "invalid_url",
        });
    }
    if (req.body.tags !== undefined &&
        (!Array.isArray(req.body.tags) ||
            req.body.tags.some((tag) => !tag || typeof tag.label !== "string")))
        throw problem(422, "tags must be a list of labeled tags.", {
            code: "invalid_tags",
        });
    const contest = {
        ...req.body,
        id: randomUUID(),
        title: title.trim(),
        platform: platform.trim(),
        startAt: date.toISOString(),
        startDate: date.toLocaleDateString("en-US", {
            timeZone: "UTC",
            month: "short",
            day: "numeric",
            year: "numeric",
        }),
        startTime: date.toLocaleTimeString("en-US", {
            timeZone: "UTC",
            hour: "2-digit",
            minute: "2-digit",
        }),
        duration: typeof req.body.duration === "string"
            ? req.body.duration
            : "Not reported",
        participants: req.body.participants ?? "Not reported",
        tags: req.body.tags ?? [],
        status: req.body.status ??
            (date.getTime() < Date.now() ? "completed" : "upcoming"),
        url: safeUrl.toString(),
        createdBy: req.user.id,
        createdAt: new Date().toISOString(),
    };
    if (!["live", "upcoming", "completed"].includes(contest.status))
        throw problem(422, "status must be live, upcoming, or completed.", {
            code: "invalid_status",
        });
    const idempotencyKey = req.idempotencyContext?.key;
    let persistedContest = idempotencyKey ? await Contest.findOne({ idempotencyKey }).lean() : null;
    if (persistedContest) {
        const { _id, idempotencyKey: _internalKey, ...record } = persistedContest;
        Object.assign(contest, record, { id: _id });
    }
    else {
        await new Contest({ _id: contest.id, ...contest, ...(idempotencyKey ? { idempotencyKey } : {}) }).save();
    }
    const response = { success: true, contest };
    try {
        await commitIdempotentResponse(req, 201, response);
    }
    catch (error) {
        await Contest.deleteOne({ _id: contest.id });
        throw error;
    }
    res.location(`/api/v1/contests/${contest.id}`).status(201).json(response);
});
router.patch("/:contestId", authMiddleware, async (req, res) => {
    const currentDoc = await Contest.findById(req.params.contestId).lean();
    const current = currentDoc ? (({ _id, ...item }) => ({ ...item, id: _id }))(currentDoc) : null;
    if (!current)
        throw problem(404, "Contest not found.", { code: "contest_not_found" });
    if (current.createdBy !== req.user.id)
        throw problem(403, "You cannot edit this contest.", { code: "forbidden" });
    const body = requireObjectBody(req.body);
    rejectUnknownFields(body, [
        "title",
        "platform",
        "startDate",
        "startAt",
        "url",
        "duration",
        "participants",
        "tags",
        "status",
        "description",
    ]);
    if (!Object.keys(body).length)
        throw problem(422, "Provide at least one contest field to update.", {
            code: "empty_update",
        });
    const ifMatch = req.get("If-Match");
    if (ifMatch &&
        ifMatch !== "*" &&
        ifMatch !== etagFor({ success: true, contest: current }))
        throw problem(412, "The contest changed since it was read. Fetch it again before updating.", { code: "precondition_failed" });
    const updated = {
        ...current,
        ...req.body,
        id: current.id,
        createdBy: current.createdBy,
    };
    for (const field of ["title", "platform"]) {
        if (field in body &&
            (typeof body[field] !== "string" || !body[field].trim()))
            throw problem(422, `${field} must be a non-empty string.`, {
                code: "invalid_contest_field",
                errors: [{ field, message: "Provide a non-empty string." }],
            });
        if (field in body)
            updated[field] = body[field].trim();
    }
    const rawDate = body.startAt ?? body.startDate;
    if (rawDate !== undefined) {
        const date = new Date(rawDate);
        if (Number.isNaN(date.getTime()))
            throw problem(422, "Contest start date is invalid.", {
                code: "invalid_start_date",
            });
        updated.startAt = date.toISOString();
        updated.startDate = date.toLocaleDateString("en-US", {
            timeZone: "UTC",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
        updated.startTime = date.toLocaleTimeString("en-US", {
            timeZone: "UTC",
            hour: "2-digit",
            minute: "2-digit",
        });
    }
    if (body.tags !== undefined &&
        (!Array.isArray(body.tags) ||
            body.tags.some((tag) => !tag || typeof tag.label !== "string")))
        throw problem(422, "tags must be a list of labeled tags.", {
            code: "invalid_tags",
        });
    if (updated.status &&
        !["live", "upcoming", "completed"].includes(updated.status))
        throw problem(422, "status must be live, upcoming, or completed.", {
            code: "invalid_status",
        });
    if (updated.url) {
        try {
            if (!["http:", "https:"].includes(new URL(updated.url).protocol))
                throw new Error();
        }
        catch {
            throw problem(422, "Contest URL must be a valid HTTP or HTTPS link.", {
                code: "invalid_url",
            });
        }
    }
    const { id: _id, ...fields } = updated;
    await Contest.replaceOne({ _id: updated.id }, { _id: updated.id, ...fields }, { runValidators: true });
    res
        .set("ETag", etagFor({ success: true, contest: updated }))
        .json({ success: true, contest: updated });
});
router.delete("/:contestId", authMiddleware, async (req, res) => {
    const current = await Contest.findById(req.params.contestId).lean();
    if (!current)
        throw problem(404, "Contest not found.", { code: "contest_not_found" });
    if (current.createdBy !== req.user.id)
        throw problem(403, "You cannot delete this contest.", {
            code: "forbidden",
        });
    await Promise.all([Contest.deleteOne({ _id: current._id }), Reminder.deleteMany({ contestId: current._id })]);
    res.status(204).end();
});
export default router;
