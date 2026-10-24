import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(scryptCallback);
const secret = process.env.JWT_SECRET || "e56949f25af3945efb3ae5b6a807a5256ef03bc580e9ab0c50460fbdce25545e";
export const hashPassword = async (password) => {
    const salt = randomBytes(16).toString("hex");
    const derived = await scrypt(password, salt, 64);
    return `${salt}:${derived.toString("hex")}`;
};
export const verifyPassword = async (password, stored) => {
    if (!stored)
        return false;
    const [salt, hash] = stored.split(":");
    if (!salt || !hash)
        return false;
    const expected = Buffer.from(hash, "hex");
    const actual = await scrypt(password, salt, expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
};
const sign = (value) => createHmac("sha256", secret).update(value).digest("base64url");
export const createToken = (userId) => {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
    })).toString("base64url");
    const input = `${header}.${payload}`;
    return `${input}.${sign(input)}`;
};
export const verifyToken = async (token) => {
    if (!token)
        return null;
    // 1. Standard signed 3-part JWT
    const parts = token.split(".");
    if (parts.length === 3) {
        const input = `${parts[0]}.${parts[1]}`;
        const actual = Buffer.from(parts[2]);
        const expected = Buffer.from(sign(input));
        if (actual.length === expected.length && timingSafeEqual(actual, expected)) {
            try {
                const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
                if (payload.sub && payload.exp > Date.now() / 1000) {
                    const { findUserById } = await import("./store.js");
                    const user = await findUserById(payload.sub);
                    if (user)
                        return publicUser(user);
                }
            }
            catch (err) {
                console.warn("JWT payload decode error:", err);
            }
        }
    }
    return null;
};
export const publicUser = (user) => {
    if (!user)
        return null;
    const { _id, id, passwordHash: _passwordHash, ...rest } = user;
    return { id: id ?? _id, ...rest };
};
export const safeUser = publicUser;
