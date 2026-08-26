import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Activity from "@/lib/models/Activity";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId");
    const limit = parseInt(searchParams.get("limit") || "20");

    const filter: Record<string, string> = {};
    if (chapterId) filter.chapterId = chapterId;

    const activities = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { text, type, chapterId, createdBy, createdByName } = body;

    if (!text || !chapterId || !createdBy) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const activity = await Activity.create({
      text,
      type: type || "chapter_update",
      chapterId,
      createdBy,
      createdByName: createdByName || "",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
