import { verifyToken } from "../services/authService.js";
export default async function authMiddleware(req, res, next) {
    const authorization = req.get("authorization");
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
    let user = null;
    try {
        user = token ? await verifyToken(token) : null;
    }
    catch (error) {
        return next(error);
    }
    if (!user)
        return next(Object.assign(new Error("A valid bearer token is required"), { status: 401 }));
    req.user = user;
    return next();
}
