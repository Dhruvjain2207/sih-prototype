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

    const { bookingId } = await req.json();
    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required." }, { status: 400 });
    }

    await connectToDatabase();
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (booking.status !== "ACCEPTED" && booking.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Payment can only be made after the freelancer accepts the booking." },
        { status: 400 }
      );
    }

    if (booking.paymentStatus === "PAID") {
      return NextResponse.json({ error: "This booking has already been paid for." }, { status: 400 });
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
    const amountInPaise = Math.round(booking.totalAmount * 100);
    const receipt = `bkg_${booking._id.toString().slice(-10)}_${Date.now().toString().slice(-4)}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        bookingId: booking._id.toString(),
        serviceTitle: booking.serviceTitle,
      },
    });

    booking.razorpayOrderId = order.id;
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
