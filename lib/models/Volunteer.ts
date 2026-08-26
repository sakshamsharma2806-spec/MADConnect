import mongoose, { Schema, Document } from "mongoose";

export interface IVolunteer extends Document {
  name: string;
  phone: string;
  shelter: string;
  chapterId: string;
  status: "Active" | "Inactive";
}

const VolunteerSchema = new Schema<IVolunteer>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  shelter: { type: String, required: true },
  chapterId: { type: String, required: true },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
});

export default mongoose.models.Volunteer || mongoose.model<IVolunteer>("Volunteer", VolunteerSchema);
