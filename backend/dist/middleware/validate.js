import Ajv from "ajv";
import { problem } from "./problem.js";
const ajv = new Ajv({ allErrors: true, coerceTypes: false, removeAdditional: false });
export const validateBody = (schema) => {
    const validate = ajv.compile(schema);
    return (req, _res, next) => {
        if (validate(req.body))
            return next();
        return next(problem(422, "Request body failed schema validation.", {
            code: "validation_error",
            errors: (validate.errors ?? []).map((error) => ({
                field: error.instancePath.replace(/^\//, "") || error.params?.missingProperty || "body",
                message: error.message ?? "Invalid value.",
            })),
        }));
    };
};
export const validateQuery = (schema) => {
    const validate = ajv.compile(schema);
    return (req, _res, next) => {
        if (validate(req.query))
            return next();
        return next(problem(422, "Query parameters failed schema validation.", {
            code: "validation_error",
            errors: (validate.errors ?? []).map((error) => ({
                field: error.instancePath.replace(/^\//, "") || error.params?.missingProperty || "query",
                message: error.message ?? "Invalid value.",
            })),
        }));
    };
};
