import mongoose from "mongoose";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Contest from "../models/Contest.js";
import Reminder from "../models/Reminder.js";
import IdempotencyRecord from "../models/IdempotencyRecord.js";
import RateLimitBucket from "../models/RateLimitBucket.js";
import Discussion from "../models/Discussion.js";
export let isMongoConnected = false;
export async function connectDatabase(uri = process.env.MONGODB_URI) {
    const connectionUri = uri ||
        (process.env.MONGO_PORT
            ? `mongodb://127.0.0.1:${process.env.MONGO_PORT}/codinghub`
            : "mongodb://127.0.0.1:27017/codinghub");
    try {
        mongoose.set("strictQuery", true);
        await mongoose.connect(connectionUri, {
            serverSelectionTimeoutMS: 3000,
            connectTimeoutMS: 3000,
        });
        await Promise.allSettled([
            User.init(),
            Profile.init(),
            Contest.init(),
            Reminder.init(),
            IdempotencyRecord.init(),
            RateLimitBucket.init(),
            Discussion.init(),
        ]);
        isMongoConnected = true;
        console.log("Connected to MongoDB successfully at:", connectionUri.replace(/:[^:@]+@/, ":****@"));
        return mongoose.connection;
    }
    catch (error) {
        isMongoConnected = false;
        console.warn(`MongoDB connection unavailable (${error.message}). Running in resilient JSON/Memory fallback mode.`);
        return null;
    }
}
export async function closeDatabase() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        isMongoConnected = false;
    }
}
export { mongoose };
