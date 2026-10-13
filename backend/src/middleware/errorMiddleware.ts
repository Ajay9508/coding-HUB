export default function errorMiddleware(err, req, res, _next) {
  let status = Number(err.statusCode ?? err.status) || 500;
  const statusCodes = { 400: "bad_request", 401: "unauthorized", 403: "forbidden", 404: "not_found", 406: "not_acceptable", 409: "conflict", 412: "precondition_failed", 413: "request_too_large", 415: "unsupported_media_type", 422: "unprocessable_content", 429: "rate_limit_exceeded", 500: "internal_error", 501: "not_implemented", 502: "bad_gateway", 503: "service_unavailable", 504: "gateway_timeout" };
  let code = err.code || statusCodes[status] || "request_failed";
  let detail = status < 500 || err.expose ? err.message : "An unexpected error occurred.";
  let errors;
  if (err?.name === "ValidationError") {
    status = 422; code = "validation_failed"; detail = "The submitted data did not pass database validation.";
    errors = Object.values(err.errors ?? {}).map(({ path, message }) => ({ field: path, message }));
  } else if (err?.code === 11000) {
    status = 409; code = "duplicate_key"; detail = "A record with the same unique value already exists.";
  } else if (err?.name === "CastError") {
    status = 422; code = "invalid_database_value"; detail = "A supplied value has an invalid format.";
  }
  if (err.type === "entity.parse.failed") { status = 400; code = "malformed_json"; detail = "Request body contains malformed JSON."; }
  if (err.type === "entity.too.large") { status = 413; code = "request_too_large"; detail = "Request body exceeds the 1 MB limit."; }
  if (status >= 500) console.error(`[${res.locals.requestId} ${req.method} ${req.path}] ${err.stack || err.message}`);
  if ((status === 503 || status === 504) && err.retryAfter) res.set("Retry-After", String(err.retryAfter));
  const title = ({ 400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found", 406: "Not Acceptable", 409: "Conflict", 412: "Precondition Failed", 413: "Content Too Large", 415: "Unsupported Media Type", 422: "Unprocessable Content", 429: "Too Many Requests", 500: "Internal Server Error", 501: "Not Implemented", 502: "Bad Gateway", 503: "Service Unavailable", 504: "Gateway Timeout" })[status] || "Request Failed";
  res.status(status).type("application/problem+json").json({
    type: `urn:codinghub:problem:${code.replace(/[^a-z0-9-]/gi, "-")}`,
    title,
    status,
    detail,
    instance: req.path,
    requestId: res.locals.requestId,
    message: detail,
    ...(errors ? { errors } : err.errors ? { errors: err.errors } : {}),
  });
}
