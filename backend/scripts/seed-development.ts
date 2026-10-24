import dotenv from "dotenv";
import { closeDatabase, connectDatabase, isMongoConnected, mongoose } from "../src/config/db.js";
import Profile from "../src/models/Profile.js";
import User from "../src/models/User.js";
import { hashPassword } from "../src/services/authService.js";

dotenv.config({ path: [".env", "../.env.local"] });

const firstNames = [
  "Aarav", "Ananya", "Arjun", "Bhavna", "Dev", "Diya", "Farhan", "Isha", "Kabir", "Kavya",
  "Manav", "Meera", "Neel", "Nisha", "Rohan", "Riya", "Samar", "Sana", "Varun", "Zoya",
  "Aditi", "Arnav", "Ira", "Kunal", "Maya", "Nikhil", "Pooja", "Rahul", "Saanvi", "Tara",
  "Vikram", "Yash", "Aanya", "Dhruv", "Ishita", "Krish", "Lavanya", "Mihir", "Navya", "Om",
  "Prisha", "Reyansh", "Shreya", "Tanvi", "Uday", "Vanya", "Yuvraj", "Aisha", "Harsh", "Jiya",
];

const lastNames = [
  "Sharma", "Iyer", "Mehta", "Kapoor", "Reddy", "Bose", "Nair", "Patel", "Gupta", "Singh",
];

const platforms = ["codeforces", "leetcode"];
const now = Date.now();
const seedPassword = process.env.SEED_USER_PASSWORD || "CodingHub123!";

const createUsers = async () => {
  const passwordHash = await hashPassword(seedPassword);
  return firstNames.map((firstName, index) => {
    const ordinal = String(index + 1).padStart(2, "0");
    return {
      _id: `development-seed-user-${ordinal}`,
      name: `${firstName} ${lastNames[index % lastNames.length]}`,
      email: `development.user.${ordinal}@seed.codinghub.test`,
      passwordHash,
      createdAt: new Date(now - (index + 1) * 86_400_000).toISOString(),
    };
  });
};

const main = async () => {
  await connectDatabase();
  if (!isMongoConnected) {
    throw new Error("MongoDB is not connected. Start MongoDB and configure MONGODB_URI before seeding.");
  }

  const users = await createUsers();
  await User.bulkWrite(
    users.map((user) => ({
      updateOne: {
        filter: { email: user.email },
        update: { $set: user },
        upsert: true,
      },
    })),
  );

  const profiles = users.flatMap((user, userIndex) =>
    platforms.map((platformId, platformIndex) => {
      const score = 60 + ((userIndex * 37 + platformIndex * 19) % 520);
      const rating = 1200 + ((userIndex * 43 + platformIndex * 67) % 1500);
      return {
        userId: user._id,
        platformId,
        name: platformId === "codeforces" ? "Codeforces" : "LeetCode",
        handle: `codinghub_seed_${String(userIndex + 1).padStart(2, "0")}_${platformId}`,
        connectedAt: user.createdAt,
        lastSyncedAt: new Date(now - (userIndex % 7) * 3_600_000).toISOString(),
        syncStatus: "seeded",
        solved: score,
        rating,
        maxRating: rating + 100,
        rank: platformId === "codeforces" ? "Specialist" : 10_000 + userIndex,
        contests: 3 + (userIndex % 15),
      };
    }),
  );
  await Profile.bulkWrite(
    profiles.map((profile) => ({
      updateOne: {
        filter: { userId: profile.userId, platformId: profile.platformId },
        update: { $set: profile },
        upsert: true,
      },
    })),
  );

  const [userCount, profileCount] = await Promise.all([
    User.countDocuments({ email: /@seed\.codinghub\.test$/ }),
    Profile.countDocuments({ userId: /^development-seed-user-/ }),
  ]);
  console.log(JSON.stringify({ seededUsers: userCount, seededProfiles: profileCount, database: mongoose.connection.name }));
};

try {
  await main();
} finally {
  await closeDatabase();
}
