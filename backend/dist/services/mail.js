import nodemailer from "nodemailer";
const required = (name) => {
    const value = process.env[name];
    if (!value)
        throw new Error(`${name} must be configured to send password reset emails.`);
    return value;
};
export const sendPasswordResetEmail = async (email, token) => {
    const transport = nodemailer.createTransport({
        host: required("SMTP_HOST"),
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: required("SMTP_USER"), pass: required("SMTP_PASSWORD") },
    });
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").split(",")[0].replace(/\/$/, "");
    await transport.sendMail({
        from: required("SMTP_FROM"),
        to: email,
        subject: "Reset your CodingHub password",
        text: `Reset your password: ${frontendUrl}/reset-password?token=${token}\n\nThis link expires in 15 minutes.`,
    });
};
