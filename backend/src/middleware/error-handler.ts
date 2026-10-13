
import type { ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const error = err as Error & {
    status?: number;
    statusCode?: number;
  };

  const statusCode = error.statusCode ?? error.status ?? 500;

  const safeStatus =
    Number.isInteger(statusCode) &&
    statusCode >= 400 &&
    statusCode <= 599
      ? statusCode
      : 500;

  const messages: Record<number, string> = {
    400: "Bad request",
    401: "Authentication required",
    403: "Forbidden",
    404: "Resource not found",
    409: "Conflict",
    422: "Validation failed",
    429: "Too many requests",
    500: "Internal server error",
    503: "Service unavailable",
    504: "Gateway timeout"
  };

  console.error({
    requestId: res.locals.requestId,
    method: req.method,
    path: req.path,
    error: error.message
  });

  res.status(safeStatus).json({
    error: {
      code: `HTTP_${safeStatus}`,
      message:
        safeStatus >= 500
          ? "An unexpected server error occurred"
          : messages[safeStatus] ?? "Request failed",
      requestId: res.locals.requestId
    }
  });
};

export default errorHandler;