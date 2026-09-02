import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Booking, User, Notification, Review } from "@/lib/models";
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
      // Get freelancer's skills array
      const userSkills: string[] = dbUser?.skills && dbUser.skills.length > 0 ? dbUser.skills : [];

      // Build category regex matching rules
      const skillRegexes = userSkills.map(
        (skill) => new RegExp(skill.replace(/[^a-zA-Z0-9]/g, ".*"), "i")
      );

      // Query 1A: Pending single jobs matching this freelancer's category skills
      const singlePendingQuery: any = {
        isBulk: { $ne: true },
        status: "PENDING",
      };
      if (skillRegexes.length > 0) {
        singlePendingQuery.$or = [
          { category: { $in: skillRegexes } },
          { serviceTitle: { $in: skillRegexes } },
        ];
      }

      // Query 1B: Available bulk jobs with remaining units > 0 matching skills
      const bulkPendingQuery: any = {
        isBulk: true,
        remainingUnits: { $gt: 0 },
        status: { $in: ["PENDING", "PARTIALLY_ACCEPTED"] },
      };
      if (skillRegexes.length > 0) {
        bulkPendingQuery.$or = [
          { selectedServices: { $in: skillRegexes } },
          { category: { $in: skillRegexes } },
          { serviceTitle: { $in: skillRegexes } },
        ];
      }

      // Query 2: Jobs claimed/accepted/completed by THIS specific freelancer
      const userQueryIds = [userId];
      if (session.user.id && session.user.id !== userId?.toString()) {
        userQueryIds.push(session.user.id);
      }

      const mySingleJobsQuery: any = {
        isBulk: { $ne: true },
        provider: { $in: userQueryIds },
        status: { $ne: "PENDING" },
      };

      const myBulkJobsQuery: any = {
        isBulk: true,
        "assignments.provider": { $in: userQueryIds },
      };

      const [pendingSingle, pendingBulk, mySingleJobs, myBulkJobs] = await Promise.all([
        Booking.find(singlePendingQuery)
          .populate("client", "name email phone image")
          .populate("gig")
          .sort({ createdAt: -1 }),
        Booking.find(bulkPendingQuery)
          .populate("client", "name email phone image")
          .populate("assignments.provider", "name email phone image rating skills")
          .populate("gig")
          .sort({ createdAt: -1 }),
        Booking.find(mySingleJobsQuery)
          .populate("client", "name email phone image")
          .populate("gig")
          .sort({ createdAt: -1 }),
        Booking.find(myBulkJobsQuery)
          .populate("client", "name email phone image")
          .populate("assignments.provider", "name email phone image rating skills")
          .populate("gig")
          .sort({ createdAt: -1 }),
      ]);

      // Combine lists avoiding duplicates
      const bookingMap = new Map();
      pendingSingle.forEach((b) => bookingMap.set(b._id.toString(), b));
      pendingBulk.forEach((b) => bookingMap.set(b._id.toString(), b));
      mySingleJobs.forEach((b) => bookingMap.set(b._id.toString(), b));
      myBulkJobs.forEach((b) => bookingMap.set(b._id.toString(), b));

      bookings = Array.from(bookingMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      bookings = await Booking.find({
        $or: [{ client: userId }, { client: session.user.id }],
      })
        .populate("provider", "name email phone image rating skills bio")
        .populate("assignments.provider", "name email phone image rating skills bio")
        .populate("gig")
        .sort({ createdAt: -1 });
    }

    const bookingIds = bookings.map((b: any) => b._id);
    const reviews = await Review.find({ booking: { $in: bookingIds } }).lean();

    const reviewsMap = new Map<string, { clientReview?: any; providerReview?: any }>();
    reviews.forEach((r: any) => {
      const bId = r.booking.toString();
      if (!reviewsMap.has(bId)) {
        reviewsMap.set(bId, {});
      }
      const entry = reviewsMap.get(bId)!;
      if (r.reviewType === "client_to_freelancer") {
        entry.clientReview = r;
      } else if (r.reviewType === "freelancer_to_client") {
        entry.providerReview = r;
      }
    });

    const bookingsWithReviews = bookings.map((b: any) => {
      const plain = b.toObject ? b.toObject() : { ...b };
      const revs = reviewsMap.get(b._id.toString()) || {};
      return {
        ...plain,
        clientReview: revs.clientReview || null,
        providerReview: revs.providerReview || null,
      };
    });

    return NextResponse.json({ success: true, bookings: bookingsWithReviews });
  } catch (error: any) {
    console.error("GET /api/bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

// POST /api/bookings - Create new single or bulk booking
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
      // Bulk Booking parameters
      isBulk = false,
      totalUnits = 1,
      unitType = "household",
      selectedServices = [],
    } = body;

    // Address & Problem Description Validation
    if (!address || !address.fullName || !address.phone || !address.houseFlat || !address.streetArea || !address.city || !address.state || !address.pincode) {
      return NextResponse.json({ error: "Complete service address (Flat/House, Street/Society, City, State, Pincode) is required." }, { status: 400 });
    }

    if (!problemDescription || !problemDescription.trim()) {
      return NextResponse.json({ error: "Please provide a description of the problem or task required." }, { status: 400 });
    }

    if (!scheduledDate) {
      return NextResponse.json({ error: "Scheduled date is required." }, { status: 400 });
    }

    await connectToDatabase();

    // Find or create DB Client user
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

    if (isBulk) {
      // BULK BOOKING FLOW
      const parsedUnits = Math.max(1, parseInt(String(totalUnits), 10) || 1);
      const servicesList: string[] = Array.isArray(selectedServices) && selectedServices.length > 0
        ? selectedServices
        : [requestedCategory || "General Maintenance"];

      const bulkCategory = servicesList.join(", ");
      const bulkTitle = requestedTitle || `Bulk Booking: ${parsedUnits} ${unitType === "household" ? "Households" : unitType} (${bulkCategory})`;

      // 1. Find all freelancers matching ANY of the selected services
      const skillKeywords = servicesList.map((s) => s.split(" ")[0].replace(/[^a-zA-Z]/g, ""));
      const skillRegexes = skillKeywords.map((kw) => new RegExp(kw, "i"));

      let matchingFreelancers = await User.find({
        role: "freelancer",
        skills: { $elemMatch: { $in: skillRegexes } },
      });

      if (!matchingFreelancers || matchingFreelancers.length === 0) {
        matchingFreelancers = await User.find({ role: "freelancer" });
      }

      // 2. Create Bulk Booking
      const newBooking = await Booking.create({
        isBulk: true,
        totalUnits: parsedUnits,
        remainingUnits: parsedUnits,
        unitType: unitType || "household",
        selectedServices: servicesList,
        category: bulkCategory,
        serviceTitle: bulkTitle,
        problemDescription: problemDescription.trim(),
        client: clientId,
        status: "PENDING",
        totalAmount: 0,
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
        assignments: [],
      });

      // 3. Notify all matching freelancers about bulk opportunity
      const clientName = dbClient.name || session.user.name || "A client";
      const notificationPromises = matchingFreelancers.map((fl) =>
        Notification.create({
          recipient: fl._id,
          sender: clientId,
          type: "NEW_BOOKING",
          title: `🏢 Bulk Request: ${parsedUnits} ${unitType === "household" ? "Households" : unitType}`,
          message: `${clientName} posted a bulk service request for ${parsedUnits} ${unitType}s (${bulkCategory}) on ${new Date(scheduledDate).toLocaleDateString()} (${timeSlot}). Claim full or partial units now!`,
          booking: newBooking._id,
          isRead: false,
        })
      );
      await Promise.all(notificationPromises);

      const populatedBooking = await Booking.findById(newBooking._id)
        .populate("client", "name email phone image")
        .populate("assignments.provider", "name email phone image rating skills");

      return NextResponse.json({
        success: true,
        message: `Bulk booking request for ${parsedUnits} ${unitType}s dispatched to available local experts!`,
        booking: populatedBooking,
      });
    } else {
      // SINGLE SERVICE BOOKING FLOW
      const targetCategory = requestedCategory || "Plumbing";
      const finalServiceTitle = requestedTitle || `${targetCategory} Service`;

      // 1. Find Freelancers matching this specific category skill
      const categoryKeyword = targetCategory.split(" ")[0].replace(/[^a-zA-Z]/g, "");
      let matchingFreelancers = await User.find({
        role: "freelancer",
        skills: { $elemMatch: { $regex: new RegExp(categoryKeyword, "i") } },
      });

      if (!matchingFreelancers || matchingFreelancers.length === 0) {
        matchingFreelancers = await User.find({ role: "freelancer" });
      }

      // 2. Create Single Booking
      const newBooking = await Booking.create({
        gig: gigId || undefined,
        isBulk: false,
        totalUnits: 1,
        remainingUnits: 1,
        category: targetCategory,
        serviceTitle: finalServiceTitle,
        problemDescription: problemDescription.trim(),
        client: clientId,
        provider: matchingFreelancers.length === 1 ? matchingFreelancers[0]._id : undefined,
        status: "PENDING",
        totalAmount: 0,
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

      // 3. Notify matching category freelancers
      const clientName = dbClient.name || session.user.name || "A customer";
      const notificationPromises = matchingFreelancers.map((fl) =>
        Notification.create({
          recipient: fl._id,
          sender: clientId,
          type: "NEW_BOOKING",
          title: `New Request: ${finalServiceTitle}`,
          message: `${clientName} requested ${targetCategory} service on ${new Date(scheduledDate).toLocaleDateString()} (${timeSlot}). Problem: "${problemDescription.trim().slice(0, 60)}..."`,
          booking: newBooking._id,
          isRead: false,
        })
      );
      await Promise.all(notificationPromises);

      const populatedBooking = await Booking.findById(newBooking._id)
        .populate("provider", "name email phone image rating skills")
        .populate("client", "name email phone image");

      return NextResponse.json({
        success: true,
        message: `Booking request dispatched to available ${targetCategory} experts!`,
        booking: populatedBooking,
      });
    }
  } catch (error: any) {
    console.error("POST /api/bookings error:", error);
    return NextResponse.json({ error: error.message || "Failed to create booking" }, { status: 500 });
  }
}

