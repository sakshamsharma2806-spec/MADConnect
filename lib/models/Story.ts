import mongoose, { Schema, Document } from "mongoose";

export interface IStory extends Document {
  title: string;
  content: string;
  chapterId: string;
  authorId: string;
  authorName: string;
  status: "draft" | "pending_review" | "published";
  tags: string[];
  createdAt: string;
}

const StorySchema = new Schema<IStory>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  chapterId: { type: String, required: true },
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  status: { type: String, enum: ["draft", "pending_review", "published"], default: "draft" },
  tags: [{ type: String }],
  createdAt: { type: String, required: true },
});

export default mongoose.models.Story || mongoose.model<IStory>("Story", StorySchema);
