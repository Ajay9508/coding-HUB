import { readFile } from "node:fs/promises";
import User from "../models/User.js";
import Contest from "../models/Contest.js";
import Profile from "../models/Profile.js";
import Reminder from "../models/Reminder.js";
import IdempotencyRecord from "../models/IdempotencyRecord.js";
export async function migrateJsonFile(source) {
    const data = JSON.parse(await readFile(source, "utf8"));
    const ops = (items, idField) => items.map((item) => ({ updateOne: { filter: { [idField]: item[idField] }, update: { $setOnInsert: item }, upsert: true } }));
    const users = (data.users ?? []).map(({ id, ...user }) => ({ _id: id, ...user }));
    const contests = (data.contests ?? []).map(({ id, ...contest }) => ({ _id: id, ...contest }));
    if (users.length)
        await User.bulkWrite(ops(users, "_id"), { ordered: false });
    if (contests.length)
        await Contest.bulkWrite(ops(contests, "_id"), { ordered: false });
    const profiles = Object.entries(data.profiles ?? {}).flatMap(([userId, items]) => items.map((profile) => ({ ...profile, userId })));
    if (profiles.length) {
        await Profile.bulkWrite(profiles.map((item) => ({
            updateOne: { filter: { userId: item.userId, platformId: item.platformId }, update: { $setOnInsert: item }, upsert: true },
        })), { ordered: false });
    }
    const reminders = Object.entries(data.reminders ?? {}).flatMap(([userId, contestIds]) => contestIds.map((contestId) => ({ userId, contestId })));
    if (reminders.length)
        await Reminder.bulkWrite(reminders.map((item) => ({ updateOne: { filter: item, update: { $setOnInsert: item }, upsert: true } })), { ordered: false });
    const idempotency = Object.entries(data.idempotencyKeys ?? {}).filter(([, item]) => new Date(item.expiresAt).getTime() > Date.now()).map(([key, item]) => ({ key, ...item, expiresAt: new Date(item.expiresAt) }));
    if (idempotency.length)
        await IdempotencyRecord.bulkWrite(idempotency.map((item) => ({ updateOne: { filter: { key: item.key }, update: { $setOnInsert: item }, upsert: true } })), { ordered: false });
    const [userCount, contestCount, profileCount, reminderCount, idempotencyCount] = await Promise.all([User.countDocuments(), Contest.countDocuments(), Profile.countDocuments(), Reminder.countDocuments(), IdempotencyRecord.countDocuments()]);
    return { source, imported: { users: users.length, contests: contests.length, profiles: profiles.length, reminders: reminders.length, idempotencyRecords: idempotency.length }, verifiedMongoTotals: { users: userCount, contests: contestCount, profiles: profileCount, reminders: reminderCount, idempotencyRecords: idempotencyCount } };
}
