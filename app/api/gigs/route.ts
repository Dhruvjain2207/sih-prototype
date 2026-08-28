import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Gig, User } from "@/lib/models";

// POST /api/gigs - Create a new Gig in MongoDB
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, category, price, providerId, location, images } = body;

    if (!title || !description || !category || price === undefined) {
      return NextResponse.json(
        { success: false, error: "Title, description, category, and price are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let targetProviderId = providerId;

    // If no providerId supplied, find or create a default provider user
    if (!targetProviderId) {
      let defaultProvider = await User.findOne({ role: "freelancer" });
      if (!defaultProvider) {
        defaultProvider = await User.findOne();
      }
      if (!defaultProvider) {
        defaultProvider = await User.create({
          name: "Demo Provider",
          email: `provider_${Date.now()}@example.com`,
          role: "freelancer",
          skills: ["General Service"],
        });
      }
      targetProviderId = defaultProvider._id;
    }

    const newGig = await Gig.create({
      title,
      description,
      category,
      price: Number(price),
      provider: targetProviderId,
      location: location || "Remote / On-site",
      images: Array.isArray(images) ? images : [],
      status: "active",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Gig created successfully in MongoDB!",
        gig: newGig,
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

// GET /api/gigs - Fetch all Gigs from MongoDB
export async function GET() {
  try {
    await connectToDatabase();
    const gigs = await Gig.find()
      .populate("provider", "name email role")
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      count: gigs.length,
      gigs,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
