import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Gallery from "@/lib/models/Gallery";
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
    const item = await Gallery.findById(id).lean();
    if (!item) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching gallery item:", error);
    return NextResponse.json({ error: "Failed to fetch gallery item" }, { status: 500 });
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
    const item = await Gallery.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!item) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating gallery item:", error);
    return NextResponse.json({ error: "Failed to update gallery item" }, { status: 500 });
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
    const item = await Gallery.findByIdAndDelete(id).lean();
    if (!item) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Gallery item deleted" });
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    return NextResponse.json({ error: "Failed to delete gallery item" }, { status: 500 });
  }
}
