import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Attendance from "@/lib/models/Attendance";
import Volunteer from "@/lib/models/Volunteer";
import Activity from "@/lib/models/Activity";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId");

    let sessions;
    if (chapterId) {
      sessions = await Attendance.find({ chapterId }).lean();
    } else {
      sessions = await Attendance.find().lean();
    }

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error getting attendance:", error);
    return NextResponse.json({ error: "Failed to get attendance" }, { status: 500 });
  }
}

async function recalculateVolunteerStats(chapterId: string) {
  const volunteers = await Volunteer.find({ chapterId });
  const sessions = await Attendance.find({ chapterId });
  const totalSessions = sessions.length;

  for (const vol of volunteers) {
    const attended = sessions.filter((s) => s.present.includes(vol.name)).length;
    const pct = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0;
    await Volunteer.findByIdAndUpdate(vol._id, {
      attendedSessions: attended,
      totalSessions,
      attendancePercentage: pct,
      certificateEligible: pct >= 60,
    });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    await connectToDatabase();
    const data = await request.json();

    const existing = await Attendance.findOne({ chapterId: data.chapterId, date: data.date, shelter: data.shelter });
    if (existing) {
      return NextResponse.json({ error: "Attendance for this date and shelter already recorded." }, { status: 409 });
    }

    const session = await Attendance.create(data);

    await recalculateVolunteerStats(data.chapterId);

    await Activity.create({
      text: `Attendance submitted for ${data.shelter} — ${data.present.length} volunteers present`,
      type: "attendance_submitted",
      chapterId: data.chapterId,
      createdBy: auth.userId,
      createdByName: auth.name,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Error adding attendance:", error);
    return NextResponse.json({ error: "Failed to add attendance" }, { status: 500 });
  }
}
