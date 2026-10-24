import { Router } from "express";
import { getUserProfiles, getUserReminders } from "../services/store.js";

const router = Router();

router.get("/", async (req: any, res: any) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const connectedPlatforms = (await getUserProfiles(userId)) || [];
    const solvedProfiles = connectedPlatforms.filter((profile: any) =>
      Number.isFinite(profile.solved),
    );
    const ratedProfiles = connectedPlatforms.filter((profile: any) =>
      Number.isFinite(profile.rating),
    );
    const solved = solvedProfiles.reduce(
      (sum: number, profile: any) => sum + (profile.solved || 0),
      0,
    );
    const averageRating = ratedProfiles.length
      ? Math.round(
          ratedProfiles.reduce((sum: number, profile: any) => sum + (profile.rating || 0), 0) /
            ratedProfiles.length,
        )
      : null;

    res.json({
      success: true,
      dashboard: {
        user: { id: userId, name: req.user?.name || "Developer", email: req.user?.email },
        connectedPlatforms,
        reminders: (await getUserReminders(userId)) || [],
        stats: {
          connectedPlatforms: connectedPlatforms.length,
          problemsSolved: solvedProfiles.length ? solved : 0,
          averageRating,
        },
      },
    });
  } catch (err: any) {
    console.warn("Dashboard calculation warning:", err);
    res.json({
      success: true,
      dashboard: {
        user: { id: req.user?.id, name: req.user?.name || "Developer" },
        connectedPlatforms: [],
        reminders: [],
        stats: {
          connectedPlatforms: 0,
          problemsSolved: 0,
          averageRating: null,
        },
      },
    });
  }
});

export default router;
