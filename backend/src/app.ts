import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { randomUUID } from "node:crypto";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import platformRoutes from "./routes/platformRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import contestRoutes from "./routes/contestRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import { problem } from "./middleware/problem.js";
import contentNegotiation from "./middleware/contentNegotiation.js";
import graphqlRoutes from "./routes/graphqlRoutes.js";
import soapRoutes from "./routes/soapRoutes.js";
import { recordAuditLog } from "./services/sql/auditLog.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
const openApiPath = [
  resolve(process.cwd(), "docs/openapi.yaml"),
  resolve(process.cwd(), "../docs/openapi.yaml"),
].find((candidate) => {
  try {
    readFileSync(candidate);
    return true;
  } catch {
    return false;
  }
});
if (openApiPath) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(parseYaml(readFileSync(openApiPath, "utf8"))));
}
const proxyHops = Number(process.env.TRUST_PROXY_HOPS) || 0;
if (proxyHops > 0) app.set("trust proxy", proxyHops);
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use((req, res, next) => {
  const incoming = req.get("X-Request-ID");
  const id = incoming && /^[A-Za-z0-9._:-]{8,128}$/.test(incoming) ? incoming : randomUUID();
  res.locals.requestId = id;
  res.setHeader("X-Request-ID", id);
  next();
});
app.use(
  helmet({
    strictTransportSecurity:
      process.env.ENABLE_HSTS === "true"
        ? { maxAge: 31_536_000, includeSubDomains: true }
        : false,
  }),
);
app.use(
  cors({ origin: allowedOrigins, credentials: true, preflightContinue: true }),
);
app.options(/.*/, (req, res) => {
  const path = req.path.replace(/\/$/, "");
  let allow;
  if (
    path === "/api/v1/health" ||
    path === "/api/v1/dashboard" ||
    path === "/api/v1/leaderboard" ||
    path === "/api/v1/contests/reminders" ||
    path === "/api/v1/platforms/connected" ||
    path === "/api/v1/auth/me"
  )
    allow = "GET, HEAD, OPTIONS";
  else if (path === "/api/v1/auth/register" || path === "/api/v1/auth/login" ||
    path === "/api/v1/auth/forgot-password" || path === "/api/v1/auth/reset-password")
    allow = "POST, OPTIONS";
  else if (path === "/api/v1/users/me")
    allow = "GET, HEAD, PATCH, DELETE, OPTIONS";
  else if (path === "/api/v1/users/me/password")
    allow = "PATCH, OPTIONS";
  else if (path === "/api/v1/platforms") allow = "GET, HEAD, OPTIONS";
  else if (path === "/api/v1/contests") allow = "GET, HEAD, POST, OPTIONS";
  else if (path === "/api/v1/community") allow = "GET, HEAD, POST, OPTIONS";
  else if (/^\/api\/v1\/community\/[^/]+\/like$/.test(path))
    allow = "POST, OPTIONS";
  else if (/^\/api\/v1\/platforms\/[^/]+\/sync$/.test(path))
    allow = "POST, OPTIONS";
  else if (/^\/api\/v1\/platforms\/[^/]+$/.test(path))
    allow = "PUT, DELETE, OPTIONS";
  else if (/^\/api\/v1\/contests\/[^/]+\/reminder$/.test(path))
    allow = "PUT, DELETE, OPTIONS";
  else if (/^\/api\/v1\/contests\/[^/]+$/.test(path))
    allow = "GET, HEAD, PATCH, DELETE, OPTIONS";
  if (!allow)
    return res
      .status(404)
      .type("application/problem+json")
      .json({
        type: "urn:codinghub:problem:not-found",
        title: "Not Found",
        status: 404,
        detail: "Route not found.",
        instance: req.path,
        requestId: res.locals.requestId,
        message: "Route not found.",
      });
  return res.set("Allow", allow).status(204).end();
});
app.use(express.json({ limit: "1mb" }));
app.use(contentNegotiation);
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    const entry = {
      requestId: res.locals.requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    };
    console.log(JSON.stringify(entry));
    void recordAuditLog(entry).catch((error) => console.error("SQL audit log failed:", error.message));
  });
  next();
});
app.use((req, res, next) => {
  if (req.path.startsWith("/api/v1/"))
    res.set("Cache-Control", "private, no-store");
  if (req.path.startsWith("/api/") && !req.accepts(["json", "application/xml", "application/problem+json"]))
    return next(
      problem(406, "This API only provides JSON responses.", {
        code: "not_acceptable",
      }),
    );
  if (
    ["POST", "PUT", "PATCH"].includes(req.method) &&
    Number(req.get("content-length") || 0) > 0 &&
    !req.is("application/json")
  ) {
    return next(
      problem(415, "Request bodies must use application/json.", {
        code: "unsupported_media_type",
      }),
    );
  }
  return next();
});

app.get("/", (_req, res) =>
  res.json({ success: true, message: "CodingHub API", version: "v1" }),
);
app.get("/api/v1/health", (_req, res) =>
  res.json({ success: true, status: "ok" }),
);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", authMiddleware, userRoutes);
app.use("/api/v1/platforms", platformRoutes);
app.use("/api/v1/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/v1/contests", contestRoutes);
app.use("/api/v1/leaderboard", leaderboardRoutes);
app.use("/api/v1/community", communityRoutes);
app.use("/graphql", graphqlRoutes);
app.use("/api/v1/integrations/soap", soapRoutes);
app.use("/api/v1/admin", adminRoutes);

app.use((req, _res, next) =>
  next(
    Object.assign(new Error(`Route not found: ${req.method} ${req.path}`), {
      status: 404,
    }),
  ),
);
app.use(errorMiddleware);

export default app;
