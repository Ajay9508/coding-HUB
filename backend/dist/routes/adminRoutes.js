import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
const router = Router();
router.get("/health", authMiddleware, authorizeRoles("ADMIN"), (_req, res) => res.json({ success: true, service: "admin", status: "ok" }));
export default router;
