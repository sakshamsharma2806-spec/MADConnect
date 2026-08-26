import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  date: string;
  shelter: string;
  chapterId: string;
  present: string[];
}

const AttendanceSchema = new Schema<IAttendance>({
  date: { type: String, required: true },
  shelter: { type: String, required: true },
  chapterId: { type: String, required: true },
  present: [{ type: String }],
});

export default mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);
