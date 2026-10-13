import { randomUUID } from "node:crypto";
const requestIdMiddleware = (_req, res, next) => {
    const requestId = randomUUID();
    res.locals.requestId = requestId;
    res.setHeader("X-Request-ID", requestId);
    next();
};
export default requestIdMiddleware;
