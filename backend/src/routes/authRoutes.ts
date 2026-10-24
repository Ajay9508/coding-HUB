import { Router } from "express";
import { randomUUID } from "node:crypto";
import { createUser, findUserByEmail } from "../services/store.js";
import {
  createToken,
  hashPassword,
  safeUser,
  verifyPassword,
} from "../services/authService.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  problem,
  rejectUnknownFields,
  requireObjectBody,
} from "../middleware/problem.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const authLimit = rateLimit({
  name: "auth",
  limit: Number(process.env.AUTH_RATE_LIMIT) || 20,
  windowMs: Number(process.env.AUTH_RATE_WINDOW_MS) || 15 * 60 * 1000,
});

router.post("/register", authLimit, async (req, res) => {
  const body = requireObjectBody(req.body);
  rejectUnknownFields(body, ["name", "email", "password"]);
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";
  if (name.length < 2 || name.length > 80)
    throw problem(422, "Name must be between 2 and 80 characters.", {
      code: "invalid_name",
      errors: [{ field: "name", message: "Use between 2 and 80 characters." }],
    });
  if (email.length > 254 || !emailPattern.test(email))
    throw problem(422, "A valid email address is required.", {
      code: "invalid_email",
      errors: [
        {
          field: "email",
          message: "Enter an email address up to 254 characters.",
        },
      ],
    });
  if (password.length < 8 || password.length > 256)
    throw problem(422, "Password must be between 8 and 256 characters.", {
      code: "weak_password",
      errors: [
        { field: "password", message: "Use between 8 and 256 characters." },
      ],
    });
  const user = {
    id: randomUUID(),
    name,
    email,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  try {
    await createUser(user);
  } catch (error: any) {
    if (error?.code === 11000 || error?.status === 409) throw problem(409, "An account with this email already exists.", { code: "email_conflict" });
    throw error;
  }
  res
    .location("/api/v1/auth/me")
    .status(201)
    .json({ success: true, user: safeUser(user), token: createToken(user.id) });
});

router.post("/login", authLimit, async (req, res) => {
  const body = requireObjectBody(req.body);
  rejectUnknownFields(body, ["email", "password"]);
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";
  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash)))
    throw problem(401, "Incorrect email or password.", {
      code: "invalid_credentials",
    });
  res.json({
    success: true,
    user: safeUser(user),
    token: createToken(user.id ?? user._id),
  });
});

router.get("/me", authMiddleware, (req, res) =>
  res.json({ success: true, user: safeUser(req.user) }),
);

export default router;
