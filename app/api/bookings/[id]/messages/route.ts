import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import ChatMessage from "@/lib/models/ChatMessage";
import User from "@/lib/models/User";
import Notification from "@/lib/models/Notification";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || (!session.user.id && !session.user.email)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id: bookingId } = await params;
    await connectToDatabase();

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const messages = await ChatMessage.find({ booking: bookingId })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      messages,
      bookingStatus: booking.status,
      isClosed: ["COMPLETED", "CANCELLED", "REJECTED"].includes(booking.status),
    });
  } catch (error: any) {
    console.error("GET /api/bookings/[id]/messages error:", error);
    return NextResponse.json({ error: "Failed to fetch chat messages" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || (!session.user.id && !session.user.email)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id: bookingId } = await params;
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    await connectToDatabase();

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if chat is closed
    if (["COMPLETED", "CANCELLED", "REJECTED"].includes(booking.status)) {
      return NextResponse.json({ error: "Chat session is closed for this booking." }, { status: 400 });
    }

    // Determine logged in user Mongo ID
    let dbUser = null;
    if (session.user.email) {
      dbUser = await User.findOne({ email: session.user.email.toLowerCase() });
    }
    const senderId = dbUser?._id || session.user.id;
    const senderRole = session.user.role || (dbUser?.role === "freelancer" ? "freelancer" : "client");
    const senderName = dbUser?.name || session.user.name || "User";

    // Verify user is a participant
    const isClient = String(booking.client) === String(senderId);
    const isProvider = booking.provider && String(booking.provider) === String(senderId);

    if (!isClient && !isProvider) {
      return NextResponse.json({ error: "You are not a participant in this booking." }, { status: 403 });
    }

    const newMessage = await ChatMessage.create({
      booking: bookingId,
      sender: senderId,
      senderName,
      senderRole: senderRole === "freelancer" ? "freelancer" : "client",
      text: text.trim(),
    });

    // Notify recipient
    const recipientId = isClient ? booking.provider : booking.client;
    if (recipientId) {
      await Notification.create({
        recipient: recipientId,
        sender: senderId,
        type: "BOOKING_ACCEPTED",
        title: `New Message from ${senderName}`,
        message: `"${text.trim().slice(0, 60)}${text.trim().length > 60 ? "..." : ""}"`,
        booking: booking._id,
      });
    }

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (error: any) {
    console.error("POST /api/bookings/[id]/messages error:", error);
    return NextResponse.json({ error: "Failed to send chat message" }, { status: 500 });
  }
}
