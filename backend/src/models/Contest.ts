import mongoose from "mongoose";
const { Schema } = mongoose;

const contestSchema = new Schema<any>({
  _id: { type: String, required: true }, title: { type: String, required: true, trim: true, maxlength: 200 },
  platform: { type: String, required: true }, startDate: String, startAt: { type: String, required: true }, startTime: String,
  url: { type: String, required: true }, duration: Schema.Types.Mixed, participants: Schema.Types.Mixed,
  tags: { type: [Schema.Types.Mixed], default: [] }, status: { type: String, enum: ["live", "upcoming", "completed"], required: true },
  description: String, createdBy: { type: String, required: true, ref: "User", index: true }, createdAt: { type: String, required: true },
  idempotencyKey: { type: String, select: false },
}, { versionKey: false });
contestSchema.index({ startAt: 1 });
contestSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });
export default mongoose.model<any>("Contest", contestSchema);
