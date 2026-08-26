import mongoose, { Schema, Document } from "mongoose";

export interface IVolunteer extends Document {
  name: string;
  phone: string;
  shelter: string;
  chapterId: string;
  status: "Active" | "Inactive";
  attendedSessions: number;
  totalSessions: number;
  attendancePercentage: number;
  certificateEligible: boolean;
}

const VolunteerSchema = new Schema<IVolunteer>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  shelter: { type: String, required: true },
  chapterId: { type: String, required: true },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  attendedSessions: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 },
  attendancePercentage: { type: Number, default: 0 },
  certificateEligible: { type: Boolean, default: false },
});

export default mongoose.models.Volunteer || mongoose.model<IVolunteer>("Volunteer", VolunteerSchema);
