import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

// POST /api/users - Create a new user in MongoDB
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role, phone, skills, bio } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Optional password handling: hash if provided, otherwise leave undefined
    let hashedPassword = undefined;
    if (password && typeof password === "string" && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const newUser = await User.create({
      name: name || email.split("@")[0],
      email: email.toLowerCase(),
      password: hashedPassword, // Can be undefined (password is optional)
      role: role || "client",
      phone: phone || "",
      skills: Array.isArray(skills) ? skills : [],
      bio: bio || "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully in MongoDB!",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          hasPassword: !!newUser.password,
          role: newUser.role,
          createdAt: newUser.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// GET /api/users - Fetch users list from MongoDB for testing
export async function GET() {
  try {
    await connectToDatabase();
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
