import Profile from "../models/Profile.js";
import Reminder from "../models/Reminder.js";
import Contest from "../models/Contest.js";
import IdempotencyRecord from "../models/IdempotencyRecord.js";
import User from "../models/User.js";
import RateLimitBucket from "../models/RateLimitBucket.js";
export const platforms = [
    { id: "codeforces", name: "Codeforces", category: "Competitive Programming", description: "Competitive programming contests and practice." },
    { id: "leetcode", name: "LeetCode", category: "Interview Prep", description: "Practice coding interview problems." },
    { id: "codechef", name: "CodeChef", category: "Competitive Programming", description: "Practice and compete in programming contests." },
    { id: "hackerrank", name: "HackerRank", category: "Practice", description: "Practice programming and interview skills." },
    { id: "atcoder", name: "AtCoder", category: "Competitive Programming", description: "Participate in rated programming contests." },
];
export const publicUser = ({ passwordHash: _passwordHash, ...user }) => user;
export { User, Profile, Reminder, Contest, IdempotencyRecord, RateLimitBucket };
export const getUserProfiles = async (userId) => Profile.find({ userId }).select("-userId -_id").lean();
export const setUserProfiles = async (userId, value) => {
    await Profile.deleteMany({ userId });
    if (value.length)
        await Profile.insertMany(value.map((profile) => ({ ...profile, userId })));
    return value;
};
export const getUserReminders = async (userId) => (await Reminder.find({ userId }).select("contestId -_id").lean()).map(({ contestId }) => contestId);
export const setUserReminders = async (userId, value) => {
    await Reminder.deleteMany({ userId });
    if (value.length)
        await Reminder.insertMany(value.map((contestId) => ({ userId, contestId })));
    return value;
};
