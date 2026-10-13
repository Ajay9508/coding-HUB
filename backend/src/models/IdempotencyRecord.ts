import mongoose from "mongoose";
const { Schema } = mongoose;

const recordSchema = new Schema<any>({
  key: { type: String, required: true }, fingerprint: { type: String, required: true },
  status: { type: Number, default: 0 }, body: { type: Schema.Types.Mixed, default: null },
  ownerToken: String, leaseUntil: Date, expiresAt: { type: Date, required: true },
}, { versionKey: false });
recordSchema.index({ key: 1 }, { unique: true });
recordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model<any>("IdempotencyRecord", recordSchema);
