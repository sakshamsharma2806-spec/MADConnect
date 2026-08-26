import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  role: "cho" | "admin" | "core";
  chapterId: string | null;
  password: string;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["cho", "admin", "core"], default: "cho" },
  chapterId: { type: String, default: null },
  password: { type: String, required: true },
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
