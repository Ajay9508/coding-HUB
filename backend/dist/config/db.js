import mongoose from "mongoose";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Contest from "../models/Contest.js";
import Reminder from "../models/Reminder.js";
import IdempotencyRecord from "../models/IdempotencyRecord.js";
import RateLimitBucket from "../models/RateLimitBucket.js";
export async function connectDatabase(uri = process.env.MONGODB_URI) {
    if (!uri)
        throw new Error("MONGODB_URI is required; refusing to start without MongoDB.");
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
    await Promise.all([User.init(), Profile.init(), Contest.init(), Reminder.init(), IdempotencyRecord.init(), RateLimitBucket.init()]);
    return mongoose.connection;
}
export async function closeDatabase() {
    if (mongoose.connection.readyState !== 0)
        await mongoose.disconnect();
}
export { mongoose };
