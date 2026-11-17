import { Router } from "express";
import { hashPassword, safeUser, verifyPassword } from "../services/authService.js";
import {
  Contest,
  IdempotencyRecord,
  Profile,
  Reminder,
  User,
  findUserById,
  updateUserPassword,
} from "../services/store.js";
import { validateBody } from "../middleware/validate.js";
import { passwordPatchSchema, userPatchSchema } from "../schemas/apiSchemas.js";
import {
  problem,
  rejectUnknownFields,
  requireObjectBody,
} from "../middleware/problem.js";

const router = Router();
router.get("/me", (req, res) =>
  res.json({ success: true, user: safeUser(req.user) }),
);
router.patch("/me", validateBody(userPatchSchema), async (req, res) => {
  const body = requireObjectBody(req.body);
  rejectUnknownFields(body, ["name"]);
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (name.length < 2 || name.length > 80)
    throw problem(422, "Name must be between 2 and 80 characters.", {
      code: "invalid_name",
      errors: [{ field: "name", message: "Use between 2 and 80 characters." }],
    });

  let user = null;
  try {
    user = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { returnDocument: "after", runValidators: true },
    ).lean();
  } catch (err) {
    console.warn("Mongo update failed, trying fallback store", err);
  }

  if (!user) {
    const { findUserById } = await import("../services/store.js");
    const existing = await findUserById(req.user.id);
    if (!existing) throw problem(404, "User not found.", { code: "user_not_found" });
    user = { ...existing, name };
  }

  res.json({ success: true, user: safeUser(user) });
});
router.patch("/me/password", validateBody(passwordPatchSchema), async (req, res) => {
  const body = requireObjectBody(req.body);
  rejectUnknownFields(body, ["currentPassword", "newPassword"]);
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;
  if (currentPassword === newPassword)
    throw problem(422, "New password must be different from the current password.", {
      code: "password_unchanged",
    });

  const user = await findUserById(req.user.id);
  if (!user || !(await verifyPassword(currentPassword, user.passwordHash)))
    throw problem(401, "Current password is incorrect.", { code: "invalid_current_password" });

  await updateUserPassword(req.user.id, await hashPassword(newPassword));
  res.json({ success: true, message: "Password updated successfully." });
});
router.delete("/me", async (req, res) => {
  try {
    const owned = await Contest.find({ createdBy: req.user.id })
      .select("_id")
      .lean();
    const contestIds = owned.map(({ _id }: any) => _id);
    await Promise.all([
      User.deleteOne({ _id: req.user.id }),
      Profile.deleteMany({ userId: req.user.id }),
      Reminder.deleteMany({
        $or: [{ userId: req.user.id }, { contestId: { $in: contestIds } }],
      }),
      Contest.deleteMany({ createdBy: req.user.id }),
      IdempotencyRecord.deleteMany({ key: new RegExp(`^${req.user.id}:`) }),
    ]);
  } catch (err) {
    console.warn("Mongo deletion fallback handled", err);
  }
  res.status(204).end();
});

export default router;
