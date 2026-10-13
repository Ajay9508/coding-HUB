import dotenv from "dotenv";
dotenv.config({ path: [".env", "../.env.local"] });
const [{ default: app }, { closeDatabase, connectDatabase }] = await Promise.all([
    import("./app.js"),
    import("./config/db.js"),
]);
const PORT = Number(process.env.PORT) || 5000;
const start = async () => {
    await connectDatabase();
    const server = app.listen(PORT, () => console.log(`CodingHub API running on port ${PORT}`));
    const shutdown = (signal) => {
        console.log(`${signal} received; closing CodingHub API.`);
        server.close(() => { void closeDatabase().then(() => process.exit(0)); });
        setTimeout(() => { void closeDatabase().finally(() => process.exit(1)); }, 10_000).unref();
    };
    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
};
start().catch((error) => {
    console.error("MongoDB initialization failed; API server was not started:", error.message);
    void closeDatabase().finally(() => process.exit(1));
});
