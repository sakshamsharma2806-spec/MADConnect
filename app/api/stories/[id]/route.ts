import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Story from "@/lib/models/Story";
import { requireAuth } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    await connectToDatabase();
    const { id } = await params;
    const data = await request.json();
    const story = await Story.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }
    return NextResponse.json(story);
  } catch (error) {
    console.error("Error updating story:", error);
    return NextResponse.json({ error: "Failed to update story" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    await connectToDatabase();
    const { id } = await params;
    const story = await Story.findByIdAndDelete(id).lean();
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting story:", error);
    return NextResponse.json({ error: "Failed to delete story" }, { status: 500 });
  }
}
