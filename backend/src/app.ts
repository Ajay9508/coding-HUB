import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { randomUUID } from "node:crypto";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import platformRoutes from "./routes/platformRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import contestRoutes from "./routes/contestRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import { problem } from "./middleware/problem.js";

const app = express();
const proxyHops = Number(process.env.TRUST_PROXY_HOPS) || 0;
if (proxyHops > 0) app.set("trust proxy", proxyHops);
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",").map((origin) => origin.trim()).filter(Boolean);

app.disable("x-powered-by");
app.use((req, res, next) => {
  const id = randomUUID();
  res.locals.requestId = id;
  res.setHeader("X-Request-ID", id);
  next();
});
app.use(helmet({
  strictTransportSecurity: process.env.ENABLE_HSTS === "true" ? { maxAge: 31_536_000, includeSubDomains: true } : false,
}));
app.use(cors({ origin: allowedOrigins, credentials: true, preflightContinue: true }));
app.options(/.*/, (req, res) => {
  const path = req.path.replace(/\/$/, "");
  let allow;
  if (path === "/api/v1/health" || path === "/api/v1/dashboard" || path === "/api/v1/leaderboard" || path === "/api/v1/contests/reminders" || path === "/api/v1/platforms/connected" || path === "/api/v1/auth/me") allow = "GET, HEAD, OPTIONS";
  else if (path === "/api/v1/auth/register" || path === "/api/v1/auth/login") allow = "POST, OPTIONS";
  else if (path === "/api/v1/users/me") allow = "GET, HEAD, PATCH, DELETE, OPTIONS";
  else if (path === "/api/v1/platforms") allow = "GET, HEAD, OPTIONS";
  else if (path === "/api/v1/contests") allow = "GET, HEAD, POST, OPTIONS";
  else if (/^\/api\/v1\/platforms\/[^/]+\/sync$/.test(path)) allow = "POST, OPTIONS";
  else if (/^\/api\/v1\/platforms\/[^/]+$/.test(path)) allow = "PUT, DELETE, OPTIONS";
  else if (/^\/api\/v1\/contests\/[^/]+\/reminder$/.test(path)) allow = "PUT, DELETE, OPTIONS";
  else if (/^\/api\/v1\/contests\/[^/]+$/.test(path)) allow = "GET, HEAD, PATCH, DELETE, OPTIONS";
  if (!allow) return res.status(404).type("application/problem+json").json({ type: "urn:codinghub:problem:not-found", title: "Not Found", status: 404, detail: "Route not found.", instance: req.path, requestId: res.locals.requestId, message: "Route not found." });
  return res.set("Allow", allow).status(204).end();
});
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use((req, res, next) => {
  if (req.path.startsWith("/api/v1/")) res.set("Cache-Control", "private, no-store");
  if (req.path.startsWith("/api/") && !req.accepts(["json", "application/problem+json"])) return next(problem(406, "This API only provides JSON responses.", { code: "not_acceptable" }));
  if (["POST", "PUT", "PATCH"].includes(req.method) && Number(req.get("content-length") || 0) > 0 && !req.is("application/json")) {
    return next(problem(415, "Request bodies must use application/json.", { code: "unsupported_media_type" }));
  }
  return next();
});

app.get("/", (_req, res) => res.json({ success: true, message: "CodingHub API", version: "v1" }));
app.get("/api/v1/health", (_req, res) => res.json({ success: true, status: "ok" }));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", authMiddleware, userRoutes);
app.use("/api/v1/platforms", platformRoutes);
app.use("/api/v1/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/v1/contests", contestRoutes);
app.use("/api/v1/leaderboard", leaderboardRoutes);

app.use((req, _res, next) => next(Object.assign(new Error(`Route not found: ${req.method} ${req.path}`), { status: 404 })));
app.use(errorMiddleware);

export default app;
