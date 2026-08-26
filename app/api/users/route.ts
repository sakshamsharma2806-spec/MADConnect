import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Chapter from "@/lib/models/Chapter";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const chapterId = searchParams.get("chapterId");

    if (email) {
      const user = await User.findOne({ email: email.toLowerCase() }).lean() as Record<string, unknown> | null;
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      const { password: _pw, ...userWithoutPassword } = user;
      return NextResponse.json(userWithoutPassword);
    }

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
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
