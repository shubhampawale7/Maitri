import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mediaUrl: { type: String, required: true },
    mediaType: {
      type: String,
      enum: ["image", "video"], // Added 'video'
      default: "image",
    },
    expiresAt: { type: Date, required: true },
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const Story = mongoose.model("Story", storySchema);
export default Story;
