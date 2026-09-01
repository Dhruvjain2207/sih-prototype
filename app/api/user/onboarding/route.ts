import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { name, role, phone, skills, bio, city } = body;

    if (!role || !["client", "freelancer"].includes(role)) {
      return NextResponse.json({ error: "Please select a valid role (Client or Freelancer)." }, { status: 400 });
    }

    await connectToDatabase();

    let dbUser = null;
    if (session.user.email) {
      dbUser = await User.findOne({ email: session.user.email.toLowerCase().trim() });
    }
    if (!dbUser && session.user.id && mongoose.Types.ObjectId.isValid(session.user.id)) {
      dbUser = await User.findById(session.user.id);
    }

    if (!dbUser) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 });
    }

    dbUser.role = role;
    if (name && typeof name === "string" && name.trim()) {
      dbUser.name = name.trim();
    }
    if (phone && typeof phone === "string") {
      dbUser.phone = phone.trim();
    }
    if (bio && typeof bio === "string") {
      dbUser.bio = bio.trim();
    }
    if (city && typeof city === "string") {
      dbUser.city = city.trim();
    }

    if (role === "freelancer") {
      let skillsArray: string[] = [];
      if (Array.isArray(skills)) {
        skillsArray = skills.map((s) => String(s).trim()).filter(Boolean);
      } else if (typeof skills === "string" && skills.trim()) {
        skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
      }
      dbUser.skills = skillsArray;
    }

    await dbUser.save();

    return NextResponse.json({
      success: true,
      message: "Profile setup completed successfully!",
      user: {
        id: dbUser._id.toString(),
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        phone: dbUser.phone,
        skills: dbUser.skills,
        bio: dbUser.bio,
      },
    });
  } catch (error: any) {
    console.error("POST /api/user/onboarding error:", error);
    return NextResponse.json({ error: error.message || "Failed to complete onboarding" }, { status: 500 });
  }
}
