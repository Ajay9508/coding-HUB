import { Router } from "express";
import { getUserProfiles, getUserReminders } from "../services/store.js";
const router = Router();
router.get("/", async (req, res) => {
    const connectedPlatforms = await getUserProfiles(req.user.id);
    const solvedProfiles = connectedPlatforms.filter((profile) => Number.isFinite(profile.solved));
    const ratedProfiles = connectedPlatforms.filter((profile) => Number.isFinite(profile.rating));
    const solved = solvedProfiles.reduce((sum, profile) => sum + profile.solved, 0);
    const averageRating = ratedProfiles.length
        ? Math.round(ratedProfiles.reduce((sum, profile) => sum + profile.rating, 0) /
            ratedProfiles.length)
        : null;
    res.json({
        success: true,
        dashboard: {
            user: { id: req.user.id, name: req.user.name },
            connectedPlatforms,
            reminders: await getUserReminders(req.user.id),
            stats: {
                connectedPlatforms: connectedPlatforms.length,
                problemsSolved: solvedProfiles.length ? solved : null,
                averageRating,
            },
        },
    });
});
export default router;
