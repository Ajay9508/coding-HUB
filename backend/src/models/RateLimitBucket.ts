import mongoose from "mongoose";
const { Schema } = mongoose;
const schema = new Schema<any>(
  { _id: String, count: Number, resetAt: Date },
  { versionKey: false },
);
schema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model<any>("RateLimitBucket", schema);
