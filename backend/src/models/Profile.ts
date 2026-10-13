import mongoose from "mongoose";
const { Schema } = mongoose;

const profileSchema = new Schema<any>({
  userId: { type: String, required: true, ref: "User", index: true }, platformId: { type: String, required: true },
  name: { type: String, required: true }, handle: { type: String, required: true, maxlength: 80 },
  connectedAt: { type: String, required: true }, syncStatus: String, syncError: String, syncErrorAt: String,
  lastSyncedAt: String, rating: { type: Number, min: 0 }, maxRating: { type: Number, min: 0 }, rank: Schema.Types.Mixed, solved: { type: Number, min: 0 }, contests: { type: Number, min: 0 },
}, { versionKey: false });
profileSchema.index({ userId: 1, platformId: 1 }, { unique: true });
export default mongoose.model<any>("ConnectedProfile", profileSchema);
