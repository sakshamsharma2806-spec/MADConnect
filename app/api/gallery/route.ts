import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Gallery from "@/lib/models/Gallery";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    await connectToDatabase();
    const items = await Gallery.find().sort({ date: -1 }).lean();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error getting gallery:", error);
    return NextResponse.json({ error: "Failed to get gallery" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    await connectToDatabase();
    const data = await request.json();
    const item = await Gallery.create(data);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error adding gallery item:", error);
    return NextResponse.json({ error: "Failed to add gallery item" }, { status: 500 });
  }
}
