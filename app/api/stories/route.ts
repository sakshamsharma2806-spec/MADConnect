import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Story from "@/lib/models/Story";
import Activity from "@/lib/models/Activity";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId");
    const status = searchParams.get("status");

    const filter: Record<string, string> = {};
    if (chapterId) filter.chapterId = chapterId;
    if (status) filter.status = status;

    const stories = await Story.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json(stories);
  } catch (error) {
    console.error("Error getting stories:", error);
    return NextResponse.json({ error: "Failed to get stories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    await connectToDatabase();
    const data = await request.json();
    const story = await Story.create(data);

    await Activity.create({
      text: `Story "${story.title}" submitted for review`,
      type: "story_created",
      chapterId: story.chapterId,
      createdBy: auth.userId,
      createdByName: auth.name,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error("Error adding story:", error);
    return NextResponse.json({ error: "Failed to add story" }, { status: 500 });
  }
}
