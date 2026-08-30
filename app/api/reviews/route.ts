import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Booking, Review, User, Gig, Notification } from "@/lib/models";
import mongoose from "mongoose";

// POST /api/reviews - Submit a review & rating for a completed booking
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || (!session.user.id && !session.user.email)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, rating, comment } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required." }, { status: 400 });
    }

    const parsedRating = Number(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: "Rating must be a number between 1 and 5." }, { status: 400 });
    }

    await connectToDatabase();

    // Find DB User
    let dbUser = null;
    if (session.user.email) {
      dbUser = await User.findOne({ email: session.user.email.toLowerCase().trim() });
    }
    if (!dbUser && session.user.id && mongoose.Types.ObjectId.isValid(session.user.id)) {
      dbUser = await User.findById(session.user.id);
    }
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    const sessionUserId = dbUser._id.toString();

    // Find Booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (booking.status.toUpperCase() !== "COMPLETED") {
      return NextResponse.json(
        { error: "Reviews can only be submitted after the service is marked as COMPLETED." },
        { status: 400 }
      );
    }

    // Determine reviewer & reviewee
    const clientMongoId = booking.client?._id
      ? booking.client._id.toString()
      : booking.client?.toString();
    const providerMongoId = booking.provider?._id
      ? booking.provider._id.toString()
      : booking.provider?.toString();

    let reviewerId: string;
    let revieweeId: string;
    let reviewType: "client_to_freelancer" | "freelancer_to_client";

    if (sessionUserId === clientMongoId) {
      reviewerId = clientMongoId;
      revieweeId = providerMongoId;
      reviewType = "client_to_freelancer";
    } else if (sessionUserId === providerMongoId) {
      reviewerId = providerMongoId;
      revieweeId = clientMongoId;
      reviewType = "freelancer_to_client";
    } else {
      return NextResponse.json(
        { error: "Forbidden: You were not part of this booking." },
        { status: 403 }
      );
    }

    if (!revieweeId) {
      return NextResponse.json(
        { error: "Target user for review was not found on this booking." },
        { status: 400 }
      );
    }

    // Check if review already submitted by this reviewer for this booking
    const existingReview = await Review.findOne({ booking: bookingId, reviewer: reviewerId });
    if (existingReview) {
      return NextResponse.json(
        { error: "You have already submitted a review for this completed booking." },
        { status: 400 }
      );
    }

    // Create Review
    const newReview = await Review.create({
      gig: booking.gig || undefined,
      booking: booking._id,
      reviewer: reviewerId,
      reviewee: revieweeId,
      reviewType,
      rating: parsedRating,
      comment: comment ? comment.trim() : "",
    });

    // Recalculate average rating for reviewee User
    const allUserReviews = await Review.find({ reviewee: revieweeId });
    const totalRating = allUserReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = allUserReviews.length > 0 ? parseFloat((totalRating / allUserReviews.length).toFixed(1)) : 0;
    await User.findByIdAndUpdate(revieweeId, { rating: avgRating });

    // If client reviewing freelancer gig, update Gig stats
    if (reviewType === "client_to_freelancer" && booking.gig) {
      const gigId = booking.gig?._id ? booking.gig._id : booking.gig;
      const gigReviews = await Review.find({ gig: gigId, reviewType: "client_to_freelancer" });
      const gigTotal = gigReviews.reduce((sum, r) => sum + r.rating, 0);
      const gigAvg = gigReviews.length > 0 ? parseFloat((gigTotal / gigReviews.length).toFixed(1)) : 0;
      await Gig.findByIdAndUpdate(gigId, { rating: gigAvg, reviewCount: gigReviews.length });
    }

    // Send Notification to Reviewee
    const reviewerName = dbUser.name || "A user";
    await Notification.create({
      recipient: revieweeId,
      sender: reviewerId,
      type: "SERVICE_COMPLETED",
      title: "New Review & Rating Received ⭐",
      message: `${reviewerName} gave you a ${parsedRating}★ rating for "${booking.serviceTitle}": "${comment ? comment.trim() : "No comment provided."}"`,
      booking: booking._id,
      isRead: false,
    });

    return NextResponse.json({
      success: true,
      message: "Review and rating submitted successfully!",
      review: newReview,
    });
  } catch (error: any) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit review" }, { status: 500 });
  }
}

// GET /api/reviews - Get reviews for a booking or user
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId");
    const userId = searchParams.get("userId");

    await connectToDatabase();

    const query: any = {};
    if (bookingId) query.booking = bookingId;
    if (userId) query.reviewee = userId;

    const reviews = await Review.find(query)
      .populate("reviewer", "name image role")
      .populate("reviewee", "name image role")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
