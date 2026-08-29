import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== "string" || !otp.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter the 6-digit OTP code" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

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
        { success: true, message: "Account is already verified. You can log in." },
        { status: 200 }
      );
    }

    if (!user.otp || user.otp !== cleanOtp) {
      return NextResponse.json(
        { success: false, error: "Invalid OTP code. Please check your email and try again." },
        { status: 400 }
      );
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "OTP code has expired. Please click 'Resend OTP'." },
        { status: 400 }
      );
    }

    // Mark user as verified and clear OTP credentials
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully! You can now log in.",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          isVerified: true,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
