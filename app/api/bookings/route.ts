import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Booking, User, Notification } from "@/lib/models";
import mongoose from "mongoose";

// GET /api/bookings - Get bookings for logged-in user or freelancer
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || (!session.user.id && !session.user.email)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
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

    const userId = dbUser?._id || session.user.id;
    const userRole = session.user.role || dbUser?.role || "client";

    let bookings;
    if (userRole === "freelancer") {
      bookings = await Booking.find({
        $or: [{ provider: userId }, { provider: session.user.id }],
      })
        .populate("client", "name email phone image")
        .populate("gig")
        .sort({ createdAt: -1 });
    } else {
      bookings = await Booking.find({
        $or: [{ client: userId }, { client: session.user.id }],
      })
        .populate("provider", "name email phone image rating skills bio")
        .populate("gig")
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    console.error("GET /api/bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

// POST /api/bookings - Create new booking with skill matching & problem description
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || (!session.user.id && !session.user.email)) {
      return NextResponse.json({ error: "Unauthorized. Please log in to book a service." }, { status: 401 });
    }

    const body = await req.json();
    const {
      gigId,
      category: requestedCategory,
      serviceTitle: requestedTitle,
      problemDescription,
      totalAmount,
      scheduledDate,
      timeSlot,
      address,
    } = body;

    // Address & Problem Description Validation
    if (!address || !address.fullName || !address.phone || !address.houseFlat || !address.streetArea || !address.city || !address.state || !address.pincode) {
      return NextResponse.json({ error: "Complete service address (Flat, Street, City, State, Pincode) is required." }, { status: 400 });
    }

    if (!problemDescription || !problemDescription.trim()) {
      return NextResponse.json({ error: "Please provide a description of the problem or task required." }, { status: 400 });
    }

    if (!scheduledDate) {
      return NextResponse.json({ error: "Scheduled date is required." }, { status: 400 });
    }

    await connectToDatabase();

    // Find or create DB Client user to ensure a valid ObjectId reference
    let dbClient = null;
    if (session.user.email) {
      dbClient = await User.findOne({ email: session.user.email.toLowerCase().trim() });
    }
    if (!dbClient && session.user.id && mongoose.Types.ObjectId.isValid(session.user.id)) {
      dbClient = await User.findById(session.user.id);
    }
    if (!dbClient) {
      dbClient = await User.create({
        name: session.user.name || address.fullName || "Customer",
        email: session.user.email || `client_${Date.now()}@coopconnect.com`,
        phone: address.phone || "",
        role: "client",
        isVerified: true,
      });
    }

    const clientId = dbClient._id;

    const targetCategory = requestedCategory || "Plumbing";
    const finalServiceTitle = requestedTitle || `${targetCategory} Service`;
    const finalPrice = totalAmount || 45;

    // 1. Skill-Based Freelancer Lookup
    let matchingFreelancer = await User.findOne({
      role: "freelancer",
      skills: { $elemMatch: { $regex: new RegExp(targetCategory.replace(/[^a-zA-Z]/g, ""), "i") } },
    });

    if (!matchingFreelancer) {
      matchingFreelancer = await User.findOne({
        role: "freelancer",
        skills: { $elemMatch: { $regex: new RegExp(targetCategory.split(" ")[0], "i") } },
      });
    }

    if (!matchingFreelancer) {
      matchingFreelancer = await User.findOne({ role: "freelancer" });
    }

    if (!matchingFreelancer) {
      return NextResponse.json(
        { error: `No ${targetCategory} professional is available right now. Please try again later or register as a freelancer with this skill.` },
        { status: 404 }
      );
    }

    const finalProviderId = matchingFreelancer._id;

    // 2. Create Booking in Database with PENDING status
    const newBooking = await Booking.create({
      gig: gigId || undefined,
      category: targetCategory,
      serviceTitle: finalServiceTitle,
      problemDescription: problemDescription.trim(),
      client: clientId,
      provider: finalProviderId,
      status: "PENDING",
      totalAmount: finalPrice,
      paymentMethod: "CASH_AFTER_WORK",
      scheduledDate: new Date(scheduledDate),
      timeSlot: timeSlot || "09:00 AM - 12:00 PM",
      address: {
        fullName: address.fullName,
        phone: address.phone,
        houseFlat: address.houseFlat,
        streetArea: address.streetArea,
        landmark: address.landmark || "",
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        instructions: address.instructions || "",
      },
      notes: problemDescription.trim(),
    });

    // 3. Create Notification for Freelancer
    const clientName = dbClient.name || session.user.name || "A customer";
    await Notification.create({
      recipient: finalProviderId,
      sender: clientId,
      type: "NEW_BOOKING",
      title: `New Request: ${finalServiceTitle}`,
      message: `${clientName} requested ${targetCategory} service on ${new Date(scheduledDate).toLocaleDateString()} (${timeSlot}). Problem: "${problemDescription.trim().slice(0, 60)}..."`,
      booking: newBooking._id,
      isRead: false,
    });

    const populatedBooking = await Booking.findById(newBooking._id)
      .populate("provider", "name email phone image rating skills")
      .populate("client", "name email phone image");

    return NextResponse.json({
      success: true,
      message: `Booking request sent to ${matchingFreelancer.name} (${targetCategory} Specialist)!`,
      booking: populatedBooking,
    });
  } catch (error: any) {
    console.error("POST /api/bookings error:", error);
    return NextResponse.json({ error: error.message || "Failed to create booking" }, { status: 500 });
  }
}
