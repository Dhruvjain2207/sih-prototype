import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Booking } from "@/lib/models";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { bookingId, assignmentId } = await req.json();
    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required." }, { status: 400 });
    }

    await connectToDatabase();
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    let targetAmount = booking.totalAmount;
    let targetAssignment: any = null;

    if (booking.isBulk && assignmentId) {
      targetAssignment = booking.assignments?.find(
        (a: any) => a._id?.toString() === assignmentId || a._id === assignmentId
      );

      if (!targetAssignment) {
        return NextResponse.json({ error: "Assignment not found in this bulk booking." }, { status: 404 });
      }

      if (targetAssignment.paymentStatus === "PAID") {
        return NextResponse.json({ error: "This assignment quote has already been paid for." }, { status: 400 });
      }

      targetAmount = targetAssignment.totalAmount;
    } else {
      if (booking.status !== "ACCEPTED" && booking.status !== "CONFIRMED" && booking.status !== "PARTIALLY_ACCEPTED") {
        return NextResponse.json(
          { error: "Payment can only be made after the service expert accepts/quotes the booking." },
          { status: 400 }
        );
      }

      if (booking.paymentStatus === "PAID") {
        return NextResponse.json({ error: "This booking has already been paid for." }, { status: 400 });
      }
    }

    if (!targetAmount || targetAmount <= 0) {
      return NextResponse.json({ error: "Invalid payment amount. Quote must be greater than 0." }, { status: 400 });
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId === "rzp_test_your_key_id_here") {
      return NextResponse.json(
        { error: "Razorpay Test Mode credentials are missing in environment configuration." },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Create Razorpay Order (amount in paise)
    const amountInPaise = Math.round(targetAmount * 100);
    const receipt = `bkg_${booking._id.toString().slice(-8)}_${assignmentId ? assignmentId.slice(-4) : "full"}_${Date.now().toString().slice(-4)}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        bookingId: booking._id.toString(),
        assignmentId: assignmentId || "",
        serviceTitle: booking.serviceTitle,
      },
    });

    if (targetAssignment) {
      targetAssignment.razorpayOrderId = order.id;
    } else {
      booking.razorpayOrderId = order.id;
    }
    await booking.save();

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}

