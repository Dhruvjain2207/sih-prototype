import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/lib/models";
import mongoose from "mongoose";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { skills } = body;

    if (!Array.isArray(skills)) {
      return NextResponse.json({ error: "Skills must be an array of domain names." }, { status: 400 });
    }

    await connectToDatabase();

    // Find DB User by Email or ID
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

    const cleanedSkills = skills.map((s) => String(s).trim()).filter(Boolean);
    dbUser.skills = cleanedSkills;
    await dbUser.save();

    return NextResponse.json({
      success: true,
      message: "Work domains updated successfully!",
      skills: dbUser.skills,
    });
  } catch (error: any) {
    console.error("PATCH /api/freelancer/skills error:", error);
    return NextResponse.json({ error: error.message || "Failed to update skills" }, { status: 500 });
  }
}
