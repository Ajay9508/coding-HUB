export class HttpError extends Error {
    status;
    code;
    errors;
    expose;
    constructor(status, detail, options = {}) {
        super(detail);
        this.status = status;
        this.code = options.code;
        this.errors = options.errors;
        this.expose = status < 500 || options.expose === true;
    }
}
export const problem = (status, detail, options) => new HttpError(status, detail, options);
export const requireObjectBody = (body) => {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw problem(400, "Request body must be a JSON object.", { code: "invalid_body" });
    }
    return body;
};
export const rejectUnknownFields = (body, allowed) => {
    const unknown = Object.keys(body).filter((key) => !allowed.includes(key));
    if (unknown.length) {
        throw problem(422, "Request contains unsupported fields.", {
            code: "unknown_fields",
            errors: unknown.map((field) => ({ field, message: "This field is not allowed." })),
        });
    }
};
