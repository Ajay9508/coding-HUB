import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema<any>({
  _id: { type: String, required: true },
  name: { type: String, required: true, minlength: 2, maxlength: 80, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  passwordHash: { type: String, required: true, select: false },
  createdAt: { type: String, required: true },
}, { versionKey: false });
userSchema.index({ email: 1 }, { unique: true });
export default mongoose.model<any>("User", userSchema);
