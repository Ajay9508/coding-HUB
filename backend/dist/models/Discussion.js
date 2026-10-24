import mongoose from "mongoose";
const { Schema } = mongoose;
const discussionSchema = new Schema({
    _id: { type: String, required: true },
    authorId: { type: String, required: true, index: true },
    author: { type: String, required: true, trim: true, maxlength: 80 },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, trim: true, maxlength: 10000, default: "" },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    likes: { type: Number, default: 0, min: 0 },
    replies: { type: Number, default: 0, min: 0 },
    createdAt: { type: String, required: true },
}, { versionKey: false });
discussionSchema.index({ createdAt: -1 });
export default mongoose.model("Discussion", discussionSchema);
