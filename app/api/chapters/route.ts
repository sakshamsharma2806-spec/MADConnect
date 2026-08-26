import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Chapter from "@/lib/models/Chapter";
import Volunteer from "@/lib/models/Volunteer";
import Attendance from "@/lib/models/Attendance";

function computeHealth(attendanceRate: number, volunteerCount: number, sessionCount: number): string {
  if (attendanceRate >= 70 && volunteerCount >= 5 && sessionCount >= 3) return "healthy";
  if (attendanceRate >= 40 || (volunteerCount >= 3 && sessionCount >= 2)) return "needs_attention";
  return "critical";
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId");

    if (chapterId) {
      const chapter = await Chapter.findOne({ chapterId }).lean() as Record<string, unknown> | null;
      if (!chapter) {
        return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
      }

      const volunteers = await Volunteer.find({ chapterId }).lean();
      const sessions = await Attendance.find({ chapterId }).lean();
      const volunteerCount = volunteers.length;
      const activeVolunteers = volunteers.filter((v) => v.status === "Active").length;
      const sessionCount = sessions.length;
      let totalPossible = 0;
      let totalPresent = 0;
      sessions.forEach((s) => {
        totalPossible += volunteerCount;
        totalPresent += s.present.length;
      });
      const attendanceRate = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;
      const health = computeHealth(attendanceRate, volunteerCount, sessionCount);

      return NextResponse.json({
        ...chapter,
        volunteerCount,
        activeVolunteers,
        sessionCount,
        attendanceRate,
        health,
      });
    }

    const chapters = await Chapter.find().lean();
    const enriched = await Promise.all(
      chapters.map(async (ch) => {
        const chapterId = (ch as Record<string, unknown>).chapterId as string;
        const volunteers = await Volunteer.find({ chapterId }).lean();
        const sessions = await Attendance.find({ chapterId }).lean();
        const volunteerCount = volunteers.length;
        const activeVolunteers = volunteers.filter((v) => v.status === "Active").length;
        const sessionCount = sessions.length;
        let totalPossible = 0;
        let totalPresent = 0;
        sessions.forEach((s) => {
          totalPossible += volunteerCount;
          totalPresent += s.present.length;
        });
        const attendanceRate = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;
        const health = computeHealth(attendanceRate, volunteerCount, sessionCount);
        return { ...ch, volunteerCount, activeVolunteers, sessionCount, attendanceRate, health };
      })
    );

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Error getting chapters:", error);
    return NextResponse.json({ error: "Failed to get chapters" }, { status: 500 });
  }
}
