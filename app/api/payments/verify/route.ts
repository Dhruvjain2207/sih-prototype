import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Booking, Notification } from "@/lib/models";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { bookingId, assignmentId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json();

    if (!bookingId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required payment parameters." }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: "Server error: Missing Razorpay Key Secret." }, { status: 500 });
    }

    // Verify HMAC SHA256 signature
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature verification failed." }, { status: 400 });
    }

    await connectToDatabase();
    const booking = await Booking.findById(bookingId).populate("client provider assignments.provider");

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (booking.isBulk && assignmentId) {
      const targetAssignment = booking.assignments?.find(
        (a: any) => a._id?.toString() === assignmentId || a._id === assignmentId
      );

      if (!targetAssignment) {
        return NextResponse.json({ error: "Assignment not found in bulk booking." }, { status: 404 });
      }

      targetAssignment.paymentStatus = "PAID";
      targetAssignment.paymentMethod = "RAZORPAY";
      targetAssignment.status = "CONFIRMED";
      targetAssignment.razorpayOrderId = razorpay_order_id;
      targetAssignment.razorpayPaymentId = razorpay_payment_id;
      targetAssignment.razorpaySignature = razorpay_signature;
      targetAssignment.paidAt = new Date();

      // Check if all assignments are paid
      const allPaid = booking.assignments?.every((a: any) => a.paymentStatus === "PAID");
      if (allPaid && booking.remainingUnits === 0) {
        booking.paymentStatus = "PAID";
        booking.status = "CONFIRMED";
      }

      await booking.save();

      // Notify Client and Assigned Provider
      const clientUser = booking.client;
      const assignedProvider = targetAssignment.provider;

      if (clientUser) {
        await Notification.create({
          recipient: clientUser._id || clientUser,
          sender: assignedProvider?._id || assignedProvider || clientUser._id,
          type: "PAYMENT_SUCCESS",
          title: "Payment Received & Assignment Confirmed! 🎉",
          message: `Your payment of ₹${targetAssignment.totalAmount} for ${targetAssignment.unitsClaimed} ${booking.unitType || "household"}s was successful!`,
          booking: booking._id,
        });
      }

      if (assignedProvider) {
        await Notification.create({
          recipient: assignedProvider._id || assignedProvider,
          sender: clientUser?._id || clientUser || assignedProvider._id,
          type: "PAYMENT_SUCCESS",
          title: "Payment Received! 💳",
          message: `Customer paid ₹${targetAssignment.totalAmount} via Razorpay for your ${targetAssignment.unitsClaimed} assigned ${booking.unitType || "household"}s. Assignment confirmed!`,
          booking: booking._id,
        });
      }

      const updatedBooking = await Booking.findById(booking._id)
        .populate("client", "name email phone image")
        .populate("assignments.provider", "name email phone image rating skills bio")
        .populate("gig");

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully and assignment confirmed!",
        booking: updatedBooking,
      });
    } else {
      // Single Booking Payment Verification
      booking.paymentStatus = "PAID";
      booking.paymentMethod = "RAZORPAY";
      booking.status = "CONFIRMED";
      booking.razorpayOrderId = razorpay_order_id;
      booking.razorpayPaymentId = razorpay_payment_id;
      booking.razorpaySignature = razorpay_signature;
      booking.paidAt = new Date();

      await booking.save();

      // Create notifications for Client and Freelancer
      const clientUser = booking.client;
      const providerUser = booking.provider;

      if (clientUser) {
        await Notification.create({
          recipient: clientUser._id || clientUser,
          sender: providerUser?._id || providerUser || clientUser._id,
          type: "PAYMENT_SUCCESS",
          title: "Payment Received & Booking Confirmed! 🎉",
          message: `Your payment of ₹${booking.totalAmount} for "${booking.serviceTitle}" was successful. Booking confirmed!`,
          booking: booking._id,
        });
      }

      if (providerUser) {
        await Notification.create({
          recipient: providerUser._id || providerUser,
          sender: clientUser?._id || clientUser || providerUser._id,
          type: "PAYMENT_SUCCESS",
          title: "Payment Received! 💳",
          message: `Customer paid ₹${booking.totalAmount} via Razorpay for "${booking.serviceTitle}". Booking confirmed!`,
          booking: booking._id,
        });
      }

      const updatedBooking = await Booking.findById(booking._id)
        .populate("client", "name email phone image")
        .populate("provider", "name email phone image rating skills bio")
        .populate("gig");

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully and booking confirmed!",
        booking: updatedBooking,
      });
    }
  } catch (error: any) {
    console.error("Error verifying payment signature:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}

