
import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

const requestIdMiddleware: RequestHandler = (_req, res, next) => {
  const requestId = randomUUID();

  res.locals.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);

  next();
};

export default requestIdMiddleware;