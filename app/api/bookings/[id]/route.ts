import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Booking, Notification, User } from "@/lib/models";
import mongoose from "mongoose";

// GET /api/bookings/[id] - Get single booking details
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || (!session.user.id && !session.user.email)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const booking = await Booking.findById(id)
      .populate("client", "name email phone image")
      .populate("provider", "name email phone image rating skills bio")
      .populate("gig");

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    let dbUser = null;
    if (session.user.email) {
      dbUser = await User.findOne({ email: session.user.email.toLowerCase().trim() });
    }

    const sessionUserId = session.user.id;
    const userMongoId = dbUser?._id?.toString();

    const isClient =
      booking.client?.toString() === sessionUserId ||
      booking.client?._id?.toString() === sessionUserId ||
      (userMongoId && (booking.client?.toString() === userMongoId || booking.client?._id?.toString() === userMongoId));

    const isProvider =
      booking.provider?.toString() === sessionUserId ||
      booking.provider?._id?.toString() === sessionUserId ||
      (userMongoId && (booking.provider?.toString() === userMongoId || booking.provider?._id?.toString() === userMongoId));

    if (!isClient && !isProvider && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: You are not authorized to view this booking." }, { status: 403 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error("GET /api/bookings/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch booking details" }, { status: 500 });
  }
}

// PATCH /api/bookings/[id] - Update booking status
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || (!session.user.id && !session.user.email)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status: targetStatus, rejectionReason } = body;

    if (!targetStatus) {
      return NextResponse.json({ error: "Target status is required" }, { status: 400 });
    }

    await connectToDatabase();
    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    let dbUser = null;
    if (session.user.email) {
      dbUser = await User.findOne({ email: session.user.email.toLowerCase().trim() });
    }

    const sessionUserId = session.user.id;
    const userMongoId = dbUser?._id?.toString();

    const isClient =
      booking.client?.toString() === sessionUserId ||
      booking.client?._id?.toString() === sessionUserId ||
      (userMongoId && (booking.client?.toString() === userMongoId || booking.client?._id?.toString() === userMongoId));

    const isProvider =
      booking.provider?.toString() === sessionUserId ||
      booking.provider?._id?.toString() === sessionUserId ||
      (userMongoId && (booking.provider?.toString() === userMongoId || booking.provider?._id?.toString() === userMongoId));

    const currentStatus = booking.status.toUpperCase();
    const requestedStatus = targetStatus.toUpperCase();

    // Authorization & State Machine Validation
    if (requestedStatus === "CANCELLED") {
      if (!isClient && !isProvider) {
        return NextResponse.json({ error: "Forbidden to cancel this booking" }, { status: 403 });
      }
      if (currentStatus === "COMPLETED" || currentStatus === "REJECTED" || currentStatus === "CANCELLED") {
        return NextResponse.json({ error: `Cannot cancel a booking that is already ${currentStatus}` }, { status: 400 });
      }
      booking.status = "CANCELLED";
      booking.cancelledAt = new Date();

      // Notify recipient
      const recipientId = isClient ? booking.provider : booking.client;
      await Notification.create({
        recipient: recipientId,
        sender: sessionUserId,
        type: "BOOKING_CANCELLED",
        title: "Booking Cancelled",
        message: `Booking for "${booking.serviceTitle}" was cancelled by the ${isClient ? "customer" : "provider"}.`,
        booking: booking._id,
      });

    } else if (requestedStatus === "ACCEPTED") {
      if (currentStatus !== "PENDING") {
        return NextResponse.json(
          { error: "This booking request has already been claimed by another service expert." },
          { status: 400 }
        );
      }
      const acceptingUserId = userMongoId || sessionUserId;
      booking.status = "ACCEPTED";
      booking.provider = acceptingUserId; // Claim booking for accepting freelancer
      booking.acceptedAt = new Date();

      // Notify Client with accepting freelancer's name
      const providerName = dbUser?.name || session.user.name || "A service expert";
      await Notification.create({
        recipient: booking.client,
        sender: acceptingUserId,
        type: "BOOKING_ACCEPTED",
        title: "Booking Accepted! 🎉",
        message: `Your booking for "${booking.serviceTitle}" was accepted by ${providerName}.`,
        booking: booking._id,
      });

    } else if (requestedStatus === "REJECTED") {
      if (!isProvider) {
        return NextResponse.json({ error: "Only the assigned service provider can reject this booking." }, { status: 403 });
      }
      if (currentStatus !== "PENDING") {
        return NextResponse.json({ error: `Cannot reject a booking that is ${currentStatus}` }, { status: 400 });
      }
      booking.status = "REJECTED";
      booking.rejectionReason = rejectionReason || "Provider is unavailable at the requested date/time.";
      booking.rejectedAt = new Date();

      // Notify Client
      await Notification.create({
        recipient: booking.client,
        sender: sessionUserId,
        type: "BOOKING_REJECTED",
        title: "Booking Request Declined",
        message: `Your booking for "${booking.serviceTitle}" was declined. Reason: ${booking.rejectionReason}`,
        booking: booking._id,
      });

    } else if (requestedStatus === "IN_PROGRESS") {
      if (!isProvider) {
        return NextResponse.json({ error: "Only the assigned service provider can start this service." }, { status: 403 });
      }
      if (currentStatus !== "ACCEPTED") {
        return NextResponse.json({ error: "Can only start a service that has been ACCEPTED." }, { status: 400 });
      }
      booking.status = "IN_PROGRESS";
      booking.startedAt = new Date();

      // Notify Client
      await Notification.create({
        recipient: booking.client,
        sender: sessionUserId,
        type: "SERVICE_STARTED",
        title: "Service Started 🛠️",
        message: `The provider has started work on "${booking.serviceTitle}".`,
        booking: booking._id,
      });

    } else if (requestedStatus === "COMPLETED") {
      if (!isProvider) {
        return NextResponse.json({ error: "Only the assigned service provider can mark work as completed." }, { status: 403 });
      }
      if (currentStatus !== "IN_PROGRESS" && currentStatus !== "ACCEPTED") {
        return NextResponse.json({ error: `Cannot complete a booking with status ${currentStatus}` }, { status: 400 });
      }
      booking.status = "COMPLETED";
      booking.completedAt = new Date();

      // Notify Client
      await Notification.create({
        recipient: booking.client,
        sender: sessionUserId,
        type: "SERVICE_COMPLETED",
        title: "Service Completed! ✅",
        message: `Work on "${booking.serviceTitle}" is complete! Please pay ₹${booking.totalAmount} cash directly to the provider.`,
        booking: booking._id,
      });

    } else {
      return NextResponse.json({ error: `Invalid status transition: ${targetStatus}` }, { status: 400 });
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("client", "name email phone image")
      .populate("provider", "name email phone image rating skills bio")
      .populate("gig");

    return NextResponse.json({
      success: true,
      message: `Booking status updated to ${booking.status}`,
      booking: updatedBooking,
    });
  } catch (error: any) {
    console.error("PATCH /api/bookings/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update booking status" }, { status: 500 });
  }
}
