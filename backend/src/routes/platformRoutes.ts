import { Router } from "express";
import {
  getUserProfiles,
  platforms,
  setUserProfiles,
  Profile,
} from "../services/store.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { syncPlatformProfile } from "../services/platformSync.js";
import {
  problem,
  rejectUnknownFields,
  requireObjectBody,
} from "../middleware/problem.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { cachePublic, conditionalJson } from "../middleware/conditionalGet.js";

const router = Router();
router.get("/", cachePublic(300), (req, res) =>
  conditionalJson(req, res, { success: true, platforms }),
);
router.get("/connected", authMiddleware, async (req, res) =>
  res.json({ success: true, platforms: await getUserProfiles(req.user.id) }),
);
router.put("/:platformId", authMiddleware, async (req, res) => {
  const platform = platforms.find(({ id }) => id === req.params.platformId);
  if (!platform)
    throw problem(404, "Platform not found.", { code: "platform_not_found" });
  const body = requireObjectBody(req.body);
  rejectUnknownFields(body, ["handle"]);
  const handle =
    typeof req.body?.handle === "string" ? req.body.handle.trim() : "";
  if (handle.length < 1 || handle.length > 80)
    throw problem(422, "A handle between 1 and 80 characters is required.", {
      code: "invalid_handle",
      errors: [
        { field: "handle", message: "Use between 1 and 80 characters." },
      ],
    });
  const profiles = await getUserProfiles(req.user.id);
  const current = profiles.filter(
    (profile) => profile.platformId !== platform.id,
  );
  const oldProfile = profiles.find(
    (profile) => profile.platformId === platform.id,
  );
  const sameHandle = oldProfile?.handle === handle;
  const connected = {
    ...(sameHandle ? oldProfile : {}),
    platformId: platform.id,
    name: platform.name,
    handle,
    connectedAt: oldProfile?.connectedAt ?? new Date().toISOString(),
    syncStatus: "pending",
    syncError: null,
  };
  await setUserProfiles(req.user.id, [...current, connected]);
  res.json({ success: true, platform: connected });
});
router.post(
  "/:platformId/sync",
  authMiddleware,
  rateLimit({
    name: "profile-sync",
    limit: Number(process.env.PROFILE_SYNC_RATE_LIMIT) || 10,
    windowMs: Number(process.env.PROFILE_SYNC_RATE_WINDOW_MS) || 15 * 60 * 1000,
    key: (req) => req.user.id,
  }),
  async (req, res) => {
    const profiles = await getUserProfiles(req.user.id);
    const profile = profiles.find(
      ({ platformId }) => platformId === req.params.platformId,
    );
    if (!profile)
      throw problem(404, "Connect this platform before syncing it.", {
        code: "profile_not_found",
      });
    try {
      const stats = await syncPlatformProfile(
        profile.platformId,
        profile.handle,
      );
      const updated = {
        ...profile,
        ...stats,
        syncStatus: "synced",
        syncError: null,
        lastSyncedAt: new Date().toISOString(),
      };
      await setUserProfiles(
        req.user.id,
        profiles.map((item) =>
          item.platformId === profile.platformId ? updated : item,
        ),
      );
      res.json({ success: true, platform: updated });
    } catch (error) {
      const updated = {
        ...profile,
        syncStatus: error.status === 501 ? "unavailable" : "error",
        syncError: error.message,
        syncErrorAt: new Date().toISOString(),
      };
      await setUserProfiles(
        req.user.id,
        profiles.map((item) =>
          item.platformId === profile.platformId ? updated : item,
        ),
      );
      throw error;
    }
  },
);
router.delete("/:platformId", authMiddleware, async (req, res) => {
  if (!platforms.some(({ id }) => id === req.params.platformId))
    throw problem(404, "Platform not found.", { code: "platform_not_found" });
  await Profile.deleteOne({
    userId: req.user.id,
    platformId: req.params.platformId,
  });
  res.status(204).end();
});
export default router;
