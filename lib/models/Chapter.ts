import mongoose, { Schema, Document } from "mongoose";

export interface IChapter extends Document {
  chapterId: string;
  chapterName: string;
  city: string;
  choId: string | null;
  choName: string;
  choEmail: string;
  shelter: string;
  status: "active" | "inactive";
  createdAt: string;
}

const ChapterSchema = new Schema<IChapter>({
  chapterId: { type: String, required: true, unique: true },
  chapterName: { type: String, required: true },
  city: { type: String, required: true },
  choId: { type: String, default: null },
  choName: { type: String, default: "Vacant" },
  choEmail: { type: String, default: "" },
  shelter: { type: String, required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdAt: { type: String, required: true },
});

export default mongoose.models.Chapter || mongoose.model<IChapter>("Chapter", ChapterSchema);
