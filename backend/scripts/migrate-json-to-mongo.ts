import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase, closeDatabase } from "../src/config/db.js";
import { migrateJsonFile } from "../src/services/jsonMigration.js";

dotenv.config({ path: [".env", "../.env.local"] });

const source = process.env.CODINGHUB_JSON_IMPORT_PATH ?? "./data/store.json";
try {
  await connectDatabase();
  console.log(JSON.stringify(await migrateJsonFile(source), null, 2));
} catch (error) {
  console.error(`JSON migration failed (${source}); source file was not modified:`, error);
  process.exitCode = 1;
} finally {
  await closeDatabase();
  await mongoose.disconnect();
}
