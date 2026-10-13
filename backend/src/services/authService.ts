import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import User from "../models/User.js";

const scrypt: (password: string, salt: string, keyLength: number) => Promise<Buffer> = promisify(scryptCallback) as any;
if (process.env.NODE_ENV === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  throw new Error("JWT_SECRET must contain at least 32 characters in production");
}
const secret = process.env.JWT_SECRET || "development-only-change-this-secret-before-deploying";

export const hashPassword = async (password) => {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return `${salt}:${derived.toString("hex")}`;
};

export const verifyPassword = async (password, stored) => {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = await scrypt(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

const sign = (value) => createHmac("sha256", secret).update(value).digest("base64url");
export const createToken = (userId) => {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 })).toString("base64url");
  const input = `${header}.${payload}`;
  return `${input}.${sign(input)}`;
};

export const verifyToken = async (token) => {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const input = `${parts[0]}.${parts[1]}`;
  const actual = Buffer.from(parts[2]);
  const expected = Buffer.from(sign(input));
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    if (!payload.sub || payload.exp <= Date.now() / 1000) return null;
    const user = await User.findById(payload.sub).select("+passwordHash").lean();
    return user ? publicUser(user) : null;
  } catch {
    return null;
  }
};

export const publicUser = (user) => {
  if (!user) return null;
  const { _id, id, passwordHash: _passwordHash, ...rest } = user;
  return { id: id ?? _id, ...rest };
};
export const safeUser = publicUser;
