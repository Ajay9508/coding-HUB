import dotenv from "dotenv";
dotenv.config({
    path: [".env", ".env.local", "backend/.env", "backend/.env.local", "../.env.local"],
});
const [{ default: app }, { closeDatabase, connectDatabase }] = await Promise.all([import("./app.js"), import("./config/db.js")]);
const { closeSqlPool, ensureAuditLogTable } = await import("./services/sql/auditLog.js");
const PORT = Number(process.env.PORT) || 5000;
const start = async () => {
    await connectDatabase();
    await ensureAuditLogTable();
    const server = app.listen(PORT, () => console.log(`CodingHub API running on port ${PORT}`));
    const shutdown = (signal) => {
        console.log(`${signal} received; closing CodingHub API.`);
        server.close(() => {
            void Promise.all([closeDatabase(), closeSqlPool()]).then(() => process.exit(0));
        });
        setTimeout(() => {
            void Promise.all([closeDatabase(), closeSqlPool()]).finally(() => process.exit(1));
        }, 10_000).unref();
    };
    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
};
start().catch((error) => {
    console.error("API server start error:", error.message);
    void Promise.all([closeDatabase(), closeSqlPool()]).finally(() => process.exit(1));
});
