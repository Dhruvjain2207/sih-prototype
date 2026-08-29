import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Email is required to resend OTP" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    await connectToDatabase();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Account not found. Please register first." },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { success: false, error: "Account is already verified. Please log in." },
        { status: 400 }
      );
    }

    // Generate fresh 6-digit OTP code and set 10-minute expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send email using Nodemailer helper
    await sendOtpEmail(cleanEmail, otp);

    return NextResponse.json(
      {
        success: true,
        message: "A new 6-digit OTP code has been sent to your email address.",
        devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to resend OTP";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
