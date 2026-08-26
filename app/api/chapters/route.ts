import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Chapter from "@/lib/models/Chapter";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId");

    if (chapterId) {
      const chapter = await Chapter.findOne({ chapterId }).lean();
      if (!chapter) {
        return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
      }
      return NextResponse.json(chapter);
    }

    const chapters = await Chapter.find().lean();
    return NextResponse.json(chapters);
  } catch (error) {
    console.error("Error getting chapters:", error);
    return NextResponse.json({ error: "Failed to get chapters" }, { status: 500 });
  }
}
