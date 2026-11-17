export const registerSchema = {
    type: "object",
    additionalProperties: false,
    required: ["name", "email", "password"],
    properties: {
        name: { type: "string", minLength: 2, maxLength: 80 },
        email: { type: "string", maxLength: 254, pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
        password: { type: "string", minLength: 8, maxLength: 256 },
    },
};
export const loginSchema = {
    type: "object",
    additionalProperties: false,
    required: ["email", "password"],
    properties: {
        email: { type: "string", maxLength: 254, pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
        password: { type: "string", minLength: 1, maxLength: 256 },
    },
};
export const userPatchSchema = {
    type: "object",
    additionalProperties: false,
    required: ["name"],
    properties: {
        name: { type: "string", minLength: 2, maxLength: 80 },
    },
};
export const passwordPatchSchema = {
    type: "object",
    additionalProperties: false,
    required: ["currentPassword", "newPassword"],
    properties: {
        currentPassword: { type: "string", minLength: 1, maxLength: 256 },
        newPassword: { type: "string", minLength: 8, maxLength: 256 },
    },
};
export const forgotPasswordSchema = {
    type: "object",
    additionalProperties: false,
    required: ["email"],
    properties: { email: { type: "string", maxLength: 254, pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" } },
};
export const resetPasswordSchema = {
    type: "object",
    additionalProperties: false,
    required: ["token", "password"],
    properties: {
        token: { type: "string", minLength: 32, maxLength: 128 },
        password: { type: "string", minLength: 8, maxLength: 256 },
    },
};
