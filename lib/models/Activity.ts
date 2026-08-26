import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
  text: string;
  type: string;
  chapterId: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

const ActivitySchema = new Schema<IActivity>({
  text: { type: String, required: true },
  type: { type: String, enum: ["volunteer_added", "volunteer_updated", "volunteer_deleted", "attendance_submitted", "story_created", "story_approved", "chapter_update", "milestone"], default: "chapter_update" },
  chapterId: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdByName: { type: String, required: true },
  createdAt: { type: String, required: true },
});

export default mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema);
