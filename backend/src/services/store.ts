import fs from "node:fs";
import path from "node:path";
import Profile from "../models/Profile.js";
import Reminder from "../models/Reminder.js";
import Contest from "../models/Contest.js";
import IdempotencyRecord from "../models/IdempotencyRecord.js";
import User from "../models/User.js";
import RateLimitBucket from "../models/RateLimitBucket.js";
import Discussion from "../models/Discussion.js";
import { isMongoConnected } from "../config/db.js";

const storeFilePath = path.resolve(process.cwd(), "data", "store.json");

interface FallbackStore {
  users: Array<{
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: string;
    resetTokenHash?: string;
    resetTokenExpiresAt?: string;
  }>;
  profiles: Record<string, any[]>;
  reminders: Record<string, string[]>;
  contests: any[];
  discussions: any[];
}

function loadFallbackStore(): FallbackStore {
  try {
    if (fs.existsSync(storeFilePath)) {
      const raw = fs.readFileSync(storeFilePath, "utf8");
      const parsed = JSON.parse(raw);
      return {
        users: parsed.users || [],
        profiles: parsed.profiles || {},
        reminders: parsed.reminders || {},
        contests: parsed.contests || [],
        discussions: parsed.discussions || [],
      };
    }
  } catch (err) {
    console.warn("Could not read fallback store file", err);
  }
  return { users: [], profiles: {}, reminders: {}, contests: [], discussions: [] };
}

function saveFallbackStore(data: FallbackStore) {
  try {
    const dir = path.dirname(storeFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(storeFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.warn("Could not write fallback store file", err);
  }
}

export const platforms = [
  { id: "codeforces", name: "Codeforces", category: "Competitive Programming", description: "Competitive programming contests, practice problems, and community.", syncSupported: true, profileUrl: "https://codeforces.com/profile/{handle}" },
  { id: "leetcode", name: "LeetCode", category: "Interview Prep", description: "Coding interview practice, curated problems, and contests.", syncSupported: true, profileUrl: "https://leetcode.com/{handle}/" },
  { id: "codechef", name: "CodeChef", category: "Competitive Programming", description: "Programming practice and competitive coding contests.", syncSupported: true, profileUrl: "https://www.codechef.com/users/{handle}" },
  { id: "hackerrank", name: "HackerRank", category: "Practice", description: "Coding practice, interview preparation, and skill assessments.", syncSupported: true, profileUrl: "https://www.hackerrank.com/profile/{handle}" },
  { id: "atcoder", name: "AtCoder", category: "Competitive Programming", description: "Programming contests and problems for all skill levels." },
  { id: "topcoder", name: "TopCoder", category: "Competitive Programming", description: "Algorithm contests, data science challenges, and development competitions." },
  { id: "spoj", name: "SPOJ", category: "Practice", description: "Massive archive of programming problems across many domains and difficulty levels." },
  { id: "geeksforgeeks", name: "GeeksforGeeks", category: "Interview Prep", description: "Data structures, algorithms, interview preparation, and tutorials for all levels.", syncSupported: true, profileUrl: "https://www.geeksforgeeks.org/user/{handle}/" },
  { id: "hackerearth", name: "HackerEarth", category: "Practice", description: "Programming challenges, hackathons, and hiring assessments for developers." },
  { id: "codewars", name: "CodeWars", category: "Practice", description: "Improve skills through coding challenges called kata, ranked by difficulty.", syncSupported: true, profileUrl: "https://www.codewars.com/users/{handle}" },
  { id: "exercism", name: "Exercism", category: "Learning", description: "Free mentored code practice across 70+ languages with community mentorship.", syncSupported: true, profileUrl: "https://exercism.org/profiles/{handle}" },
  { id: "projecteuler", name: "Project Euler", category: "Math & Logic", description: "Challenging mathematical and computational problems requiring creative problem solving." },
  { id: "dmoj", name: "DMOJ", category: "Competitive Programming", description: "Open-source online judge with contests, problems, and editorial support." },
  { id: "kattis", name: "Kattis", category: "Competitive Programming", description: "Problem archive used by universities worldwide for competitive programming training." },
  { id: "usaco", name: "USACO", category: "Competitive Programming", description: "USA Computing Olympiad training with guided progression from Bronze to Platinum." },
  { id: "googlekickstart", name: "Google Kick Start", category: "Competitive Programming", description: "Google's competitive programming archive including Kick Start and Code Jam problems." },
  { id: "csacademy", name: "CS Academy", category: "Competitive Programming", description: "Interactive competitive programming with real-time contests and visualizations." },
  { id: "toph", name: "Toph", category: "Competitive Programming", description: "Host and participate in programming contests with a clean, modern interface." },
  { id: "naukricode360", name: "Naukri Code360", category: "Interview Prep", description: "Curated coding problems, interview experiences, and guided learning paths for placements." },
  { id: "beecrowd", name: "beecrowd", category: "Practice", description: "Online judge with thousands of problems, contests, and academic integration." },
  { id: "kaggle", name: "Kaggle", category: "Math & Logic", description: "World's largest data science, machine learning, and algorithmic modeling competition community.", syncSupported: true, profileUrl: "https://www.kaggle.com/{handle}" },
  { id: "codesignal", name: "CodeSignal", category: "Interview Prep", description: "Industry-standard General Coding Assessment tasks, Arcade challenges, and technical prep.", syncSupported: true, profileUrl: "https://app.codesignal.com/profile/{handle}" },
  { id: "codingame", name: "CodinGame", category: "Learning", description: "Improve programming skills by playing online games, solving puzzles, and coding AI bots.", syncSupported: true, profileUrl: "https://www.codingame.com/profile/{handle}" },
  { id: "interviewbit", name: "InterviewBit", category: "Interview Prep", description: "Time-tested roadmap of DSA problems, company-specific test papers, and coding mock interviews.", syncSupported: true, profileUrl: "https://www.interviewbit.com/profile/{handle}" },
  { id: "algoexpert", name: "AlgoExpert", category: "Interview Prep", description: "Curated questions covering algorithms, data structures, and systems design interview fundamentals." },
  { id: "freecodecamp", name: "freeCodeCamp", category: "Learning", description: "Interactive coding curriculum covering JavaScript, algorithms, data structures, and backend systems.", syncSupported: true, profileUrl: "https://www.freecodecamp.org/{handle}" },
  { id: "lintcode", name: "LintCode", category: "Interview Prep", description: "Comprehensive problem ladder covering standard and high-frequency Silicon Valley technical questions.", syncSupported: true, profileUrl: "https://www.lintcode.com/user/{handle}" },
  { id: "binarysearch", name: "BinarySearch", category: "Practice", description: "Live competitive problem rooms, multi-coder speed challenges, and interactive peer problem discussions." },
  { id: "edx", name: "edX / MITx", category: "Learning", description: "Rigorous computer science, discrete math, and algorithmic engineering tracks from MIT and Harvard." },
  { id: "coursera", name: "Coursera", category: "Learning", description: "In-depth Stanford & Princeton algorithms courses, data structures mastery, and certificates." },
].map((platform) => ({
  syncSupported: false,
  profileUrl: null,
  ...platform,
}));

export const publicUser = ({ passwordHash: _passwordHash, ...user }: any) => {
  if (!user) return null;
  const { _id, id, ...rest } = user;
  return { id: id ?? _id, ...rest };
};

export { User, Profile, Reminder, Contest, IdempotencyRecord, RateLimitBucket, Discussion };

// Data Access Layer (DAL) following Repository Pattern (LLD)
export const findUserByEmail = async (email: string) => {
  const normalized = email.trim().toLowerCase();
  if (isMongoConnected) {
    try {
      const user = await User.findOne({ email: normalized }).select("+passwordHash").lean();
      if (user) return { ...user, id: user.id ?? user._id };
    } catch (e) {
      console.warn("Mongo findUserByEmail error:", e);
    }
  }
  const store = loadFallbackStore();
  return store.users.find((u) => u.email.toLowerCase() === normalized) || null;
};

export const findUserById = async (id: string) => {
  if (isMongoConnected) {
    try {
      const user = await User.findById(id).select("+passwordHash").lean();
      if (user) return { ...user, id: user.id ?? user._id };
    } catch (e) {
      console.warn("Mongo findUserById error:", e);
    }
  }
  const store = loadFallbackStore();
  return store.users.find((u) => u.id === id) || null;
};

export const createUser = async (userData: { id: string; name: string; email: string; passwordHash: string; createdAt: string }) => {
  if (isMongoConnected) {
    try {
      await User.create({ _id: userData.id, ...userData });
      return userData;
    } catch (e: any) {
      if (e?.code === 11000) throw e;
      console.warn("Mongo createUser error, saving to fallback store:", e);
    }
  }
  const store = loadFallbackStore();
  const existing = store.users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existing) {
    const conflict: any = new Error("An account with this email already exists.");
    conflict.code = 11000;
    conflict.status = 409;
    throw conflict;
  }
  store.users.push(userData);
  saveFallbackStore(store);
  return userData;
};

export const updateUserPassword = async (userId: string, passwordHash: string) => {
  if (isMongoConnected) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { passwordHash },
        { returnDocument: "after", runValidators: true },
      ).lean();
      if (user) return { ...user, id: user.id ?? user._id };
    } catch (e) {
      console.warn("Mongo updateUserPassword error:", e);
    }
  }
  const store = loadFallbackStore();
  const user = store.users.find((item) => item.id === userId);
  if (!user) return null;
  user.passwordHash = passwordHash;
  saveFallbackStore(store);
  return user;
};

export const setPasswordResetToken = async (email: string, tokenHash: string, expiresAt: Date) => {
  if (isMongoConnected) {
    const user = await User.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      { resetTokenHash: tokenHash, resetTokenExpiresAt: expiresAt },
      { returnDocument: "after" },
    ).lean();
    if (user) return { ...user, id: user.id ?? user._id };
  }
  const store = loadFallbackStore();
  const user = store.users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) return null;
  user.resetTokenHash = tokenHash;
  user.resetTokenExpiresAt = expiresAt.toISOString();
  saveFallbackStore(store);
  return user;
};

export const resetPasswordWithToken = async (tokenHash: string, passwordHash: string) => {
  if (isMongoConnected) {
    const user = await User.findOneAndUpdate(
      { resetTokenHash: tokenHash, resetTokenExpiresAt: { $gt: new Date() } },
      { passwordHash, $unset: { resetTokenHash: 1, resetTokenExpiresAt: 1 } },
      { returnDocument: "after" },
    ).lean();
    if (user) return { ...user, id: user.id ?? user._id };
  }
  const store = loadFallbackStore();
  const user = store.users.find(
    (item) => item.resetTokenHash === tokenHash && item.resetTokenExpiresAt && new Date(item.resetTokenExpiresAt) > new Date(),
  );
  if (!user) return null;
  user.passwordHash = passwordHash;
  delete user.resetTokenHash;
  delete user.resetTokenExpiresAt;
  saveFallbackStore(store);
  return user;
};

export const getUserProfiles = async (userId: string) => {
  if (isMongoConnected) {
    try {
      return await Profile.find({ userId }).select("-userId -_id").lean();
    } catch (e) {
      console.warn("Mongo getUserProfiles error:", e);
    }
  }
  const store = loadFallbackStore();
  return store.profiles[userId] || [];
};

export const setUserProfiles = async (userId: string, value: any[]) => {
  if (isMongoConnected) {
    try {
      await Profile.deleteMany({ userId });
      if (value.length) {
        await Profile.insertMany(value.map((profile) => ({ ...profile, userId })));
      }
      return value;
    } catch (e) {
      console.warn("Mongo setUserProfiles error:", e);
    }
  }
  const store = loadFallbackStore();
  store.profiles[userId] = value;
  saveFallbackStore(store);
  return value;
};

export const getUserReminders = async (userId: string) => {
  if (isMongoConnected) {
    try {
      return (await Reminder.find({ userId }).select("contestId -_id").lean()).map(
        ({ contestId }: any) => contestId,
      );
    } catch (e) {
      console.warn("Mongo getUserReminders error:", e);
    }
  }
  const store = loadFallbackStore();
  return store.reminders[userId] || [];
};

export const setUserReminders = async (userId: string, value: string[]) => {
  if (isMongoConnected) {
    try {
      await Reminder.deleteMany({ userId });
      if (value.length) {
        await Reminder.insertMany(value.map((contestId) => ({ userId, contestId })));
      }
      return value;
    } catch (e) {
      console.warn("Mongo setUserReminders error:", e);
    }
  }
  const store = loadFallbackStore();
  store.reminders[userId] = value;
  saveFallbackStore(store);
  return value;
};

export const getDiscussions = async () => {
  if (isMongoConnected) {
    try {
      return await Discussion.find().sort({ createdAt: -1 }).limit(100).lean();
    } catch (error) {
      console.warn("Mongo getDiscussions error:", error);
    }
  }
  return loadFallbackStore().discussions
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, 100);
};

export const createDiscussion = async (discussion: any) => {
  if (isMongoConnected) {
    try {
      await new Discussion(discussion).save();
      return discussion;
    } catch (error) {
      console.warn("Mongo createDiscussion error:", error);
    }
  }
  const store = loadFallbackStore();
  store.discussions.push(discussion);
  saveFallbackStore(store);
  return discussion;
};

export const likeDiscussion = async (id: string) => {
  if (isMongoConnected) {
    try {
      return await Discussion.findByIdAndUpdate(
        id,
        { $inc: { likes: 1 } },
        { returnDocument: "after" },
      ).lean();
    } catch (error) {
      console.warn("Mongo likeDiscussion error:", error);
    }
  }
  const store = loadFallbackStore();
  const discussion = store.discussions.find((item) => item._id === id);
  if (!discussion) return null;
  discussion.likes = Number(discussion.likes || 0) + 1;
  saveFallbackStore(store);
  return discussion;
};
