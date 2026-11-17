import Ajv, { type JSONSchemaType, type ValidateFunction } from "ajv";
import { problem } from "./problem.js";

const ajv = new Ajv({ allErrors: true, coerceTypes: false, removeAdditional: false });

export const validateBody = <T>(schema: JSONSchemaType<T>) => {
  const validate: ValidateFunction<T> = ajv.compile(schema);
  return (req: any, _res: any, next: any) => {
    if (validate(req.body)) return next();
    return next(
      problem(422, "Request body failed schema validation.", {
        code: "validation_error",
        errors: (validate.errors ?? []).map((error) => ({
          field: error.instancePath.replace(/^\//, "") || error.params?.missingProperty || "body",
          message: error.message ?? "Invalid value.",
        })),
      }),
    );
  };
};

export const validateQuery = <T>(schema: JSONSchemaType<T>) => {
  const validate: ValidateFunction<T> = ajv.compile(schema);
  return (req: any, _res: any, next: any) => {
    if (validate(req.query)) return next();
    return next(
      problem(422, "Query parameters failed schema validation.", {
        code: "validation_error",
        errors: (validate.errors ?? []).map((error) => ({
          field: error.instancePath.replace(/^\//, "") || error.params?.missingProperty || "query",
          message: error.message ?? "Invalid value.",
        })),
      }),
    );
  };
};
