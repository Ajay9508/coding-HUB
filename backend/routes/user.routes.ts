import { Router } from "express";

const router = Router();

router.get("/api/user", (_req, res) => {
  res.set("Cache-Control", "no-store");

  res.status(200).json({
    success: true,
    message: "CodingHub backend is running",
    version: "v1"
  });
});

export default router;