import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Volunteer from "@/lib/models/Volunteer";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId");

    let volunteers;
    if (chapterId) {
      volunteers = await Volunteer.find({ chapterId }).lean();
    } else {
      volunteers = await Volunteer.find().lean();
    }

    return NextResponse.json(volunteers);
  } catch (error) {
    console.error("Error getting volunteers:", error);
    return NextResponse.json({ error: "Failed to get volunteers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    await connectToDatabase();
    const data = await request.json();
    const volunteer = await Volunteer.create(data);
    return NextResponse.json(volunteer, { status: 201 });
  } catch (error) {
    console.error("Error adding volunteer:", error);
    return NextResponse.json({ error: "Failed to add volunteer" }, { status: 500 });
  }
}
