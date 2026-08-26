import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Attendance from "@/lib/models/Attendance";
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

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    await connectToDatabase();
    const data = await request.json();
    const session = await Attendance.create(data);
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Error adding attendance:", error);
    return NextResponse.json({ error: "Failed to add attendance" }, { status: 500 });
  }
}
