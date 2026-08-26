import mongoose, { Schema, Document } from "mongoose";

export interface IGallery extends Document {
  title: string;
  description: string;
  chapterId: string;
  uploadedBy: string;
  uploadedByName: string;
  date: string;
  category: "class" | "event" | "milestone" | "community";
  color: string;
  status: "pending" | "approved" | "rejected";
}

const GallerySchema = new Schema<IGallery>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  chapterId: { type: String, required: true },
  uploadedBy: { type: String, required: true },
  uploadedByName: { type: String, required: true },
  date: { type: String, required: true },
  category: { type: String, enum: ["class", "event", "milestone", "community"], default: "class" },
  color: { type: String, default: "#e61e4d" },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
});

export default mongoose.models.Gallery || mongoose.model<IGallery>("Gallery", GallerySchema);
