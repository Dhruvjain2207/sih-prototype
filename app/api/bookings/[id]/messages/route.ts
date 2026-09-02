import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import ChatMessage from "@/lib/models/ChatMessage";
import User from "@/lib/models/User";
import Notification from "@/lib/models/Notification";
import mongoose from "mongoose";

function matchUserId(field: any, sessionUserId?: string, userMongoId?: string): boolean {
  if (!field) return false;
  const str = (field._id ? field._id.toString() : field.toString()).trim();
  if (sessionUserId && str === sessionUserId.trim()) return true;
  if (userMongoId && str === userMongoId.trim()) return true;
  return false;
}

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
    const { text, recipientId: explicitRecipient } = body;

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
      dbUser = await User.findOne({ email: session.user.email.toLowerCase().trim() });
    }
    if (!dbUser && session.user.id && mongoose.Types.ObjectId.isValid(session.user.id)) {
      dbUser = await User.findById(session.user.id);
    }

    const sessionUserId = session.user.id?.toString();
    const userMongoId = dbUser?._id?.toString();
    const senderId = dbUser?._id || session.user.id;
    const senderRole = session.user.role || (dbUser?.role === "freelancer" ? "freelancer" : "client");
    const senderName = dbUser?.name || session.user.name || "User";

    // Verify user is a participant (client, single provider, or bulk provider)
    const isClient = matchUserId(booking.client, sessionUserId, userMongoId);
    const isSingleProvider = matchUserId(booking.provider, sessionUserId, userMongoId);
    const isBulkProvider =
      booking.isBulk &&
      (booking.assignments || []).some((a: any) => matchUserId(a.provider, sessionUserId, userMongoId));

    if (!isClient && !isSingleProvider && !isBulkProvider) {
      return NextResponse.json({ error: "You are not a participant in this booking." }, { status: 403 });
    }

    const newMessage = await ChatMessage.create({
      booking: bookingId,
      sender: senderId,
      senderName,
      senderRole: senderRole === "freelancer" ? "freelancer" : "client",
      text: text.trim(),
    });

    // Determine recipients to notify
    const recipientIds: any[] = [];
    if (isClient) {
      if (explicitRecipient) {
        recipientIds.push(explicitRecipient);
      } else if (booking.provider) {
        recipientIds.push(booking.provider);
      } else if (booking.isBulk && booking.assignments) {
        booking.assignments.forEach((a: any) => {
          if (a.provider) recipientIds.push(a.provider);
        });
      }
    } else {
      if (booking.client) {
        recipientIds.push(booking.client);
      }
    }

    // Send notifications
    const notifPromises = recipientIds.map((recId) =>
      Notification.create({
        recipient: recId,
        sender: senderId,
        type: "BOOKING_ACCEPTED",
        title: `New Message from ${senderName}`,
        message: `"${text.trim().slice(0, 60)}${text.trim().length > 60 ? "..." : ""}"`,
        booking: booking._id,
      })
    );
    await Promise.all(notifPromises);

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (error: any) {
    console.error("POST /api/bookings/[id]/messages error:", error);
    return NextResponse.json({ error: "Failed to send chat message" }, { status: 500 });
  }
}
