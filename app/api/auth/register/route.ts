import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role, phone, skills, bio } = body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const userName = name && typeof name === "string" && name.trim() ? name.trim() : cleanEmail.split("@")[0];

    await connectToDatabase();

    const existingUser = await User.findOne({ email: cleanEmail });

    // If user exists and is ALREADY verified, reject registration
    if (existingUser && existingUser.isVerified) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists and is verified. Please log in." },
        { status: 400 }
      );
    }

    // Generate 6-digit numeric OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // Valid for 10 minutes

    // Hash password if provided
    let hashedPassword = undefined;
    if (password && typeof password === "string" && password.trim().length > 0) {
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: "Password must be at least 6 characters long" },
          { status: 400 }
        );
      }
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const userRole = role && ["client", "freelancer", "admin"].includes(role) ? role : "client";

    // Format skills array
    let skillsArray: string[] = [];
    if (Array.isArray(skills)) {
      skillsArray = skills.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof skills === "string" && skills.trim()) {
      skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
    }

    if (existingUser && !existingUser.isVerified) {
      // User exists but is NOT verified -> update OTP & credentials and resend code
      existingUser.name = userName;
      if (hashedPassword) existingUser.password = hashedPassword;
      existingUser.role = userRole;
      if (phone && typeof phone === "string") existingUser.phone = phone.trim();
      if (skillsArray.length > 0) existingUser.skills = skillsArray;
      if (bio && typeof bio === "string") existingUser.bio = bio.trim();
      existingUser.otp = otp;
      existingUser.otpExpiresAt = otpExpiresAt;
      await existingUser.save();
    } else {
      // Create new user record in MongoDB with isVerified: false
      await User.create({
        name: userName,
        email: cleanEmail,
        password: hashedPassword,
        role: userRole,
        phone: typeof phone === "string" ? phone.trim() : "",
        skills: skillsArray,
        bio: typeof bio === "string" ? bio.trim() : "",
        isVerified: false,
        otp,
        otpExpiresAt,
      });
    }

    // Send 6-digit OTP email using Resend email helper
    await sendOtpEmail(cleanEmail, otp);

    return NextResponse.json(
      {
        success: true,
        requiresOtp: true,
        email: cleanEmail,
        message: "Registration initiated! Your CoopConnect verification code has been sent to your email.",
        devOtp: process.env.NODE_ENV !== "production" ? otp : undefined, // For local dev convenience
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
