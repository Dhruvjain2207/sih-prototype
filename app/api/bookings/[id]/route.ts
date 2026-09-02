import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Booking, Notification, User } from "@/lib/models";
import mongoose from "mongoose";

// Helper function to check if a user matches an ID or user object
function matchUserId(field: any, sessionUserId?: string, userMongoId?: string): boolean {
  if (!field) return false;
  const str = (field._id ? field._id.toString() : field.toString()).trim();
  if (sessionUserId && str === sessionUserId.trim()) return true;
  if (userMongoId && str === userMongoId.trim()) return true;
  return false;
}

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
      .populate("assignments.provider", "name email phone image rating skills bio")
      .populate("gig");

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    let dbUser = null;
    if (session.user.email) {
      dbUser = await User.findOne({ email: session.user.email.toLowerCase().trim() });
    }
    if (!dbUser && session.user.id && mongoose.Types.ObjectId.isValid(session.user.id)) {
      dbUser = await User.findById(session.user.id);
    }

    const sessionUserId = session.user.id?.toString();
    const userMongoId = dbUser?._id?.toString();

    const isClient = matchUserId(booking.client, sessionUserId, userMongoId);
    const isSingleProvider = matchUserId(booking.provider, sessionUserId, userMongoId);
    const isBulkProvider =
      booking.isBulk &&
      booking.assignments?.some((a: any) => matchUserId(a.provider, sessionUserId, userMongoId));

    if (
      !isClient &&
      !isSingleProvider &&
      !isBulkProvider &&
      session.user.role !== "admin" &&
      session.user.role !== "freelancer"
    ) {
      return NextResponse.json({ error: "Forbidden: You are not authorized to view this booking." }, { status: 403 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error("GET /api/bookings/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch booking details" }, { status: 500 });
  }
}

// PATCH /api/bookings/[id] - Update booking or bulk assignment status
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
    const {
      status: targetStatus,
      rejectionReason,
      quotedPrice,
      paymentMethod,
      // Bulk specific params
      action,
      assignmentId,
      unitsClaimed,
      quotedPricePerUnit,
    } = body;

    await connectToDatabase();
    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Resolve DB User
    let dbUser = null;
    if (session.user.email) {
      dbUser = await User.findOne({ email: session.user.email.toLowerCase().trim() });
    }
    if (!dbUser && session.user.id && mongoose.Types.ObjectId.isValid(session.user.id)) {
      dbUser = await User.findById(session.user.id);
    }

    const sessionUserId = session.user.id?.toString();
    const userMongoId = dbUser?._id?.toString();
    const currentUserId = userMongoId || sessionUserId;
    const currentObjectId = dbUser?._id || (currentUserId && mongoose.Types.ObjectId.isValid(currentUserId) ? new mongoose.Types.ObjectId(currentUserId) : currentUserId);

    const isClient = matchUserId(booking.client, sessionUserId, userMongoId);
    const isSingleProvider = matchUserId(booking.provider, sessionUserId, userMongoId);

    // =========================================================================
    // BULK BOOKING ACTION 1: CLAIM UNITS (FULL OR PARTIAL)
    // =========================================================================
    if (booking.isBulk && (action === "CLAIM_BULK_UNITS" || (targetStatus === "ACCEPTED" && !assignmentId))) {
      const currentRemaining = booking.remainingUnits ?? booking.totalUnits ?? 0;
      if (currentRemaining <= 0) {
        return NextResponse.json(
          { error: "All units for this bulk request have already been claimed by other service experts." },
          { status: 400 }
        );
      }

      const availableUnits = currentRemaining;
      const requestedUnits = parseInt(String(unitsClaimed || body.units || availableUnits), 10);

      if (isNaN(requestedUnits) || requestedUnits <= 0) {
        return NextResponse.json({ error: "Please specify a valid number of units/households to claim." }, { status: 400 });
      }

      if (requestedUnits > availableUnits) {
        return NextResponse.json(
          { error: `Only ${availableUnits} units remain available for this request.` },
          { status: 400 }
        );
      }

      // Calculate unit rate & total for this claim
      let unitPrice = Number(quotedPricePerUnit);
      if (!unitPrice || unitPrice <= 0) {
        if (quotedPrice && Number(quotedPrice) > 0) {
          unitPrice = Number(quotedPrice) / requestedUnits;
        } else {
          return NextResponse.json(
            { error: "Please enter a valid quoted price (₹) per household/unit to accept." },
            { status: 400 }
          );
        }
      }

      const assignmentTotal = Math.round(unitPrice * requestedUnits);

      // Create new assignment in assignments array
      const newAssignment: any = {
        provider: currentObjectId,
        unitsClaimed: requestedUnits,
        quotedPricePerUnit: unitPrice,
        totalAmount: assignmentTotal,
        status: "ACCEPTED",
        paymentStatus: "PENDING",
        paymentMethod: "CASH_AFTER_WORK",
        claimedAt: new Date(),
        notes: body.notes || "",
      };

      if (!booking.assignments) {
        booking.assignments = [];
      }
      booking.assignments.push(newAssignment);

      // Decrement remainingUnits
      booking.remainingUnits = Math.max(0, currentRemaining - requestedUnits);

      // Update total calculated quote for the bulk booking
      const totalClaimedQuotes = booking.assignments.reduce((sum: number, a: any) => sum + (a.totalAmount || 0), 0);
      booking.totalAmount = totalClaimedQuotes;
      booking.quotedPrice = totalClaimedQuotes;

      // Update bulk booking status
      if (booking.remainingUnits === 0) {
        booking.status = "ACCEPTED"; // Fully claimed by providers
      } else {
        booking.status = "PARTIALLY_ACCEPTED"; // Still open for other freelancers
      }

      await booking.save();

      // Notify Client about the claim
      const providerName = dbUser?.name || session.user.name || "A service expert";
      await Notification.create({
        recipient: booking.client,
        sender: currentObjectId,
        type: "BOOKING_ACCEPTED",
        title: "Bulk Units Claimed! 🎉",
        message: `${providerName} claimed ${requestedUnits} of ${booking.totalUnits} ${booking.unitType || "household"}s with a quote of ₹${assignmentTotal} (₹${unitPrice}/${booking.unitType || "unit"}). ${booking.remainingUnits > 0 ? `${booking.remainingUnits} units still awaiting experts.` : "All units are now claimed!"}`,
        booking: booking._id,
      });

      const updated = await Booking.findById(booking._id)
        .populate("client", "name email phone image")
        .populate("provider", "name email phone image rating skills bio")
        .populate("assignments.provider", "name email phone image rating skills bio")
        .populate("gig");

      return NextResponse.json({
        success: true,
        message: `Successfully claimed ${requestedUnits} ${booking.unitType || "household"}s! Your quote of ₹${assignmentTotal} has been submitted to the customer.`,
        booking: updated,
      });
    }

    // =========================================================================
    // BULK BOOKING ACTION 2: CONFIRM SPECIFIC ASSIGNMENT (CLIENT SIDE)
    // =========================================================================
    if (booking.isBulk && (action === "CONFIRM_ASSIGNMENT" || (targetStatus === "CONFIRMED" && assignmentId))) {
      if (!isClient) {
        return NextResponse.json({ error: "Only the customer can confirm quotes for assignments." }, { status: 403 });
      }

      const targetAssignment = booking.assignments?.find(
        (a: any) => a._id?.toString() === assignmentId || a._id === assignmentId
      );

      if (!targetAssignment) {
        return NextResponse.json({ error: "Assignment not found in this bulk booking." }, { status: 404 });
      }

      targetAssignment.status = "CONFIRMED";
      if (paymentMethod === "CASH_AFTER_WORK" || !targetAssignment.paymentMethod) {
        targetAssignment.paymentMethod = "CASH_AFTER_WORK";
      }

      // If all assignments are confirmed or beyond, update booking status
      const allConfirmed = booking.assignments?.every((a: any) =>
        a.status === "CONFIRMED" || a.status === "IN_PROGRESS" || a.status === "COMPLETED"
      );
      if (allConfirmed && booking.remainingUnits === 0) {
        booking.status = "CONFIRMED";
      }

      await booking.save();

      // Notify the assigned provider
      const clientName = dbUser?.name || session.user.name || "The customer";
      await Notification.create({
        recipient: targetAssignment.provider,
        sender: currentObjectId,
        type: "BOOKING_ACCEPTED",
        title: "Quote Confirmed! 🎉",
        message: `${clientName} confirmed your quote of ₹${targetAssignment.totalAmount} for ${targetAssignment.unitsClaimed} ${booking.unitType || "household"}s (${targetAssignment.paymentMethod === "CASH_AFTER_WORK" ? "Cash Payment After Work" : "Online Payment"}).`,
        booking: booking._id,
      });

      const updated = await Booking.findById(booking._id)
        .populate("client", "name email phone image")
        .populate("provider", "name email phone image rating skills bio")
        .populate("assignments.provider", "name email phone image rating skills bio")
        .populate("gig");

      return NextResponse.json({
        success: true,
        message: `Quote for ${targetAssignment.unitsClaimed} units confirmed successfully!`,
        booking: updated,
      });
    }

    // =========================================================================
    // BULK BOOKING ACTION 2B: DECLINE SPECIFIC ASSIGNMENT (CLIENT SIDE)
    // =========================================================================
    if (booking.isBulk && (action === "DECLINE_ASSIGNMENT" || (targetStatus === "REJECTED" && assignmentId))) {
      if (!isClient) {
        return NextResponse.json({ error: "Only the customer can decline quotes for assignments." }, { status: 403 });
      }

      if (!booking.assignments || booking.assignments.length === 0) {
        return NextResponse.json({ error: "No assignments found in this bulk booking." }, { status: 404 });
      }

      const assignmentIndex = booking.assignments.findIndex(
        (a: any) => a._id?.toString() === assignmentId || a._id === assignmentId
      );

      if (assignmentIndex === -1 || assignmentIndex === undefined) {
        return NextResponse.json({ error: "Assignment not found in this bulk booking." }, { status: 404 });
      }

      const targetAssignment = booking.assignments[assignmentIndex];
      const releasedUnits = targetAssignment.unitsClaimed || 0;
      const declinedProvider = targetAssignment.provider;

      // Remove assignment and release units back
      booking.assignments.splice(assignmentIndex, 1);
      const currentRem = booking.remainingUnits ?? booking.totalUnits ?? 0;
      booking.remainingUnits = Math.min(booking.totalUnits || 0, currentRem + releasedUnits);

      // Recalculate total amount
      const totalClaimedQuotes = (booking.assignments || []).reduce((sum: number, a: any) => sum + (a.totalAmount || 0), 0);
      booking.totalAmount = totalClaimedQuotes;
      booking.quotedPrice = totalClaimedQuotes;

      // Update status
      if ((booking.assignments || []).length === 0) {
        booking.status = "PENDING";
      } else {
        booking.status = "PARTIALLY_ACCEPTED";
      }

      await booking.save();

      // Notify the declined provider
      const clientName = dbUser?.name || session.user.name || "The customer";
      if (declinedProvider) {
        await Notification.create({
          recipient: declinedProvider,
          sender: currentObjectId,
          type: "BOOKING_REJECTED",
          title: "Quote Declined",
          message: `${clientName} declined your quote for ${releasedUnits} ${booking.unitType || "household"}s. The units have been returned to the live marketplace for other experts.`,
          booking: booking._id,
        });
      }

      const updated = await Booking.findById(booking._id)
        .populate("client", "name email phone image")
        .populate("provider", "name email phone image rating skills bio")
        .populate("assignments.provider", "name email phone image rating skills bio")
        .populate("gig");

      return NextResponse.json({
        success: true,
        message: `Quote declined. ${releasedUnits} units released back to the marketplace.`,
        booking: updated,
      });
    }

    // =========================================================================
    // BULK BOOKING ACTION 3: UPDATE ASSIGNMENT STATUS (START / COMPLETE)
    // =========================================================================
    if (booking.isBulk && (action === "UPDATE_ASSIGNMENT_STATUS" || assignmentId) && (targetStatus === "IN_PROGRESS" || targetStatus === "COMPLETED")) {
      const targetAssignment = booking.assignments?.find(
        (a: any) => a._id?.toString() === assignmentId || a._id === assignmentId
      );

      if (!targetAssignment) {
        return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
      }

      const isMatchingProvider = matchUserId(targetAssignment.provider, sessionUserId, userMongoId);

      if (!isMatchingProvider && !isClient) {
        return NextResponse.json({ error: "Only the assigned provider can update this assignment." }, { status: 403 });
      }

      const providerName = dbUser?.name || session.user.name || "Provider";

      if (targetStatus === "IN_PROGRESS") {
        targetAssignment.status = "IN_PROGRESS";
        targetAssignment.startedAt = new Date();

        booking.status = "IN_PROGRESS";
        await booking.save();

        await Notification.create({
          recipient: booking.client,
          sender: currentObjectId,
          type: "SERVICE_STARTED",
          title: "Service Started 🛠️",
          message: `${providerName} started work on their ${targetAssignment.unitsClaimed} assigned ${booking.unitType || "household"}s.`,
          booking: booking._id,
        });
      } else if (targetStatus === "COMPLETED") {
        targetAssignment.status = "COMPLETED";
        targetAssignment.completedAt = new Date();

        // Check if all assignments are completed
        const allCompleted = booking.assignments?.every((a: any) => a.status === "COMPLETED");
        if (allCompleted && booking.remainingUnits === 0) {
          booking.status = "COMPLETED";
          booking.completedAt = new Date();
        }

        await booking.save();

        await Notification.create({
          recipient: booking.client,
          sender: currentObjectId,
          type: "SERVICE_COMPLETED",
          title: "Service Completed! ✅",
          message: `${providerName} completed work for ${targetAssignment.unitsClaimed} ${booking.unitType || "household"}s (Amount: ₹${targetAssignment.totalAmount}).`,
          booking: booking._id,
        });
      }

      const updated = await Booking.findById(booking._id)
        .populate("client", "name email phone image")
        .populate("provider", "name email phone image rating skills bio")
        .populate("assignments.provider", "name email phone image rating skills bio")
        .populate("gig");

      return NextResponse.json({
        success: true,
        message: `Assignment marked as ${targetStatus.toLowerCase()}`,
        booking: updated,
      });
    }

    // =========================================================================
    // SINGLE BOOKING / GENERAL TRANSITIONS
    // =========================================================================
    const currentStatus = (booking.status || "").toUpperCase();
    const requestedStatus = (targetStatus || "").toUpperCase();

    if (requestedStatus === "CANCELLED") {
      if (!isClient && !isSingleProvider) {
        return NextResponse.json({ error: "Forbidden to cancel this booking" }, { status: 403 });
      }
      if (currentStatus === "COMPLETED" || currentStatus === "REJECTED" || currentStatus === "CANCELLED") {
        return NextResponse.json({ error: `Cannot cancel a booking that is already ${currentStatus}` }, { status: 400 });
      }
      booking.status = "CANCELLED";
      booking.cancelledAt = new Date();

      const recipientId = isClient ? (booking.provider || booking.assignments?.[0]?.provider) : booking.client;
      if (recipientId) {
        await Notification.create({
          recipient: recipientId,
          sender: currentObjectId,
          type: "BOOKING_CANCELLED",
          title: "Booking Cancelled",
          message: `Booking for "${booking.serviceTitle}" was cancelled by the ${isClient ? "customer" : "provider"}.`,
          booking: booking._id,
        });
      }

    } else if (requestedStatus === "ACCEPTED") {
      if (currentStatus !== "PENDING") {
        return NextResponse.json(
          { error: "This booking request has already been claimed by another service expert." },
          { status: 400 }
        );
      }
      const finalQuote = Number(quotedPrice || body.totalAmount);
      if (!finalQuote || finalQuote <= 0) {
        return NextResponse.json(
          { error: "Please enter a valid quoted price (₹) to accept this booking." },
          { status: 400 }
        );
      }

      booking.status = "ACCEPTED";
      booking.provider = currentObjectId;
      booking.totalAmount = finalQuote;
      booking.quotedPrice = finalQuote;
      booking.acceptedAt = new Date();

      const providerName = dbUser?.name || session.user.name || "A service expert";
      await Notification.create({
        recipient: booking.client,
        sender: currentObjectId,
        type: "BOOKING_ACCEPTED",
        title: "Quote Received & Accepted! 🎉",
        message: `Your booking for "${booking.serviceTitle}" was accepted by ${providerName} with a quoted price of ₹${finalQuote}. Please accept or decline the quote.`,
        booking: booking._id,
      });

    } else if (requestedStatus === "CONFIRMED") {
      if (currentStatus !== "ACCEPTED" && currentStatus !== "PARTIALLY_ACCEPTED") {
        return NextResponse.json(
          { error: "Can only confirm a booking that has been accepted by the freelancer." },
          { status: 400 }
        );
      }
      booking.status = "CONFIRMED";
      if (paymentMethod === "CASH_AFTER_WORK" || !booking.paymentMethod) {
        booking.paymentMethod = "CASH_AFTER_WORK";
      }

      const clientName = dbUser?.name || session.user.name || "The customer";
      if (booking.provider) {
        await Notification.create({
          recipient: booking.provider,
          sender: currentObjectId,
          type: "BOOKING_ACCEPTED",
          title: "Booking Confirmed! 🎉",
          message: `${clientName} accepted your quote of ₹${booking.totalAmount} (${booking.paymentMethod === "CASH_AFTER_WORK" ? "Cash After Work" : "Online"}). Booking confirmed!`,
          booking: booking._id,
        });
      }

    } else if (requestedStatus === "REJECTED") {
      if (!isSingleProvider && !booking.isBulk && currentStatus !== "PENDING") {
        return NextResponse.json({ error: "Only the assigned service provider can reject this booking." }, { status: 403 });
      }
      if (currentStatus !== "PENDING" && currentStatus !== "PARTIALLY_ACCEPTED") {
        return NextResponse.json({ error: `Cannot reject a booking that is ${currentStatus}` }, { status: 400 });
      }
      booking.status = "REJECTED";
      booking.rejectionReason = rejectionReason || "Provider is unavailable at the requested date/time.";
      booking.rejectedAt = new Date();

      await Notification.create({
        recipient: booking.client,
        sender: currentObjectId,
        type: "BOOKING_REJECTED",
        title: "Booking Request Declined",
        message: `Your booking for "${booking.serviceTitle}" was declined. Reason: ${booking.rejectionReason}`,
        booking: booking._id,
      });

    } else if (requestedStatus === "IN_PROGRESS") {
      if (!isSingleProvider) {
        return NextResponse.json({ error: "Only the assigned service provider can start this service." }, { status: 403 });
      }
      if (currentStatus !== "ACCEPTED" && currentStatus !== "CONFIRMED") {
        return NextResponse.json({ error: "Can only start a service that has been accepted or confirmed." }, { status: 400 });
      }
      booking.status = "IN_PROGRESS";
      booking.startedAt = new Date();

      const providerName = dbUser?.name || session.user.name || "The provider";
      await Notification.create({
        recipient: booking.client,
        sender: currentObjectId,
        type: "SERVICE_STARTED",
        title: "Service Started 🛠️",
        message: `${providerName} has started work on "${booking.serviceTitle}".`,
        booking: booking._id,
      });

    } else if (requestedStatus === "COMPLETED") {
      if (!isSingleProvider) {
        return NextResponse.json({ error: "Only the assigned service provider can mark work as completed." }, { status: 403 });
      }
      if (currentStatus !== "IN_PROGRESS" && currentStatus !== "ACCEPTED" && currentStatus !== "CONFIRMED") {
        return NextResponse.json({ error: `Cannot complete a booking with status ${currentStatus}` }, { status: 400 });
      }
      booking.status = "COMPLETED";
      booking.completedAt = new Date();

      const providerName = dbUser?.name || session.user.name || "The provider";
      await Notification.create({
        recipient: booking.client,
        sender: currentObjectId,
        type: "SERVICE_COMPLETED",
        title: "Service Completed! ✅",
        message: `Work on "${booking.serviceTitle}" is complete! ${booking.paymentStatus === "PAID" ? "Payment was already completed online." : `Please pay ₹${booking.totalAmount} cash directly to ${providerName}.`}`,
        booking: booking._id,
      });

    } else {
      return NextResponse.json({ error: `Invalid status transition: ${targetStatus}` }, { status: 400 });
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("client", "name email phone image")
      .populate("provider", "name email phone image rating skills bio")
      .populate("assignments.provider", "name email phone image rating skills bio")
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


