import { Router } from "express";
import { safeUser } from "../services/authService.js";
import { Contest, IdempotencyRecord, Profile, Reminder, User } from "../services/store.js";
import { problem, rejectUnknownFields, requireObjectBody } from "../middleware/problem.js";
const router = Router();
router.get("/me", (req, res) => res.json({ success: true, user: safeUser(req.user) }));
router.patch("/me", async (req, res) => {
    const body = requireObjectBody(req.body);
    rejectUnknownFields(body, ["name"]);
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    if (name.length < 2 || name.length > 80)
        throw problem(422, "Name must be between 2 and 80 characters.", { code: "invalid_name", errors: [{ field: "name", message: "Use between 2 and 80 characters." }] });
    const user = await User.findByIdAndUpdate(req.user.id, { name }, { returnDocument: "after", runValidators: true }).lean();
    if (!user)
        throw problem(404, "User not found.", { code: "user_not_found" });
    res.json({ success: true, user: safeUser(user) });
});
router.delete("/me", async (req, res) => {
    const owned = await Contest.find({ createdBy: req.user.id }).select("_id").lean();
    const contestIds = owned.map(({ _id }) => _id);
    await Promise.all([
        User.deleteOne({ _id: req.user.id }), Profile.deleteMany({ userId: req.user.id }),
        Reminder.deleteMany({ $or: [{ userId: req.user.id }, { contestId: { $in: contestIds } }] }),
        Contest.deleteMany({ createdBy: req.user.id }),
        IdempotencyRecord.deleteMany({ key: new RegExp(`^${req.user.id}:`) }),
    ]);
    res.status(204).end();
});
export default router;
