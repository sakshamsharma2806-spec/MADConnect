import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Chapter from "@/lib/models/Chapter";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).lean() as { password: string; chapterId?: string; _id: { toString(): string }; email: string; name: string; role: string } | null;
    if (!user) {
      return NextResponse.json({ error: "No account found with this email." }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    let chapterName = "";
    if (user.chapterId) {
      const chapter = await Chapter.findOne({ chapterId: user.chapterId }).lean() as { chapterName: string } | null;
      chapterName = chapter?.chapterName || "";
    }

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      chapterId: user.chapterId || "",
      chapterName,
    };

    const token = signToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      user: tokenPayload,
      token,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
