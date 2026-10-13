import { Router } from "express";
import { Profile, User } from "../services/store.js";
import { cachePublic, conditionalJson } from "../middleware/conditionalGet.js";

const router = Router();
router.get("/", cachePublic(30), async (req, res) => {
  const users = await User.find().select("name createdAt").lean();
  const connected = await Profile.find().lean();
  const byUser = new Map();
  for (const profile of connected) byUser.set(profile.userId, [...(byUser.get(profile.userId) ?? []), profile]);
  const leaderboard = users.map(({ _id, name, createdAt }) => {
    const id = _id;
    const userProfiles = byUser.get(id) ?? [];
    const solvedProfiles = userProfiles.filter((profile) => Number.isFinite(profile.solved));
    const ratedProfiles = userProfiles.filter((profile) => Number.isFinite(profile.rating));
    return {
      userId: id,
      name,
      problemsSolved: solvedProfiles.length ? solvedProfiles.reduce((sum, profile) => sum + profile.solved, 0) : null,
      rating: ratedProfiles.length ? Math.round(ratedProfiles.reduce((sum, profile) => sum + profile.rating, 0) / ratedProfiles.length) : null,
      joinedAt: createdAt,
    };
  }).sort((a, b) => (b.problemsSolved ?? -1) - (a.problemsSolved ?? -1));
  return conditionalJson(req, res, { success: true, leaderboard });
});
export default router;
