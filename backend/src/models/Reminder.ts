import mongoose from "mongoose";
const { Schema } = mongoose;

const reminderSchema = new Schema<any>(
  {
    userId: { type: String, required: true, ref: "User" },
    contestId: { type: String, required: true, ref: "Contest" },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);
reminderSchema.index({ userId: 1, contestId: 1 }, { unique: true });
export default mongoose.model<any>("Reminder", reminderSchema);
