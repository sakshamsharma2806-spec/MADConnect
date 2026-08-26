import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Volunteer from "@/lib/models/Volunteer";
import Activity from "@/lib/models/Activity";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    await connectToDatabase();
    const { id } = await params;
    const volunteer = await Volunteer.findById(id).lean();
    if (!volunteer) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
    }
    return NextResponse.json(volunteer);
  } catch (error) {
    console.error("Error getting volunteer:", error);
    return NextResponse.json({ error: "Failed to get volunteer" }, { status: 500 });
  }
}

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
    const volunteer = await Volunteer.findByIdAndUpdate(id, data, { new: true }).lean() as { name: string; chapterId: string } | null;
    if (!volunteer) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
    }

    await Activity.create({
      text: `Volunteer "${volunteer.name}" updated`,
      type: "volunteer_updated",
      chapterId: volunteer.chapterId,
      createdBy: auth.userId,
      createdByName: auth.name,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(volunteer);
  } catch (error) {
    console.error("Error updating volunteer:", error);
    return NextResponse.json({ error: "Failed to update volunteer" }, { status: 500 });
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
    const volunteer = await Volunteer.findByIdAndDelete(id).lean() as { name: string; chapterId: string } | null;
    if (!volunteer) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
    }

    await Activity.create({
      text: `Volunteer "${volunteer.name}" removed`,
      type: "volunteer_deleted",
      chapterId: volunteer.chapterId,
      createdBy: auth.userId,
      createdByName: auth.name,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting volunteer:", error);
    return NextResponse.json({ error: "Failed to delete volunteer" }, { status: 500 });
  }
}
