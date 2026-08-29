import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Notification, User } from "@/lib/models";
import mongoose from "mongoose";

// GET /api/notifications - Get notifications for logged-in user
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || (!session.user.id && !session.user.email)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();

    let dbUser = null;
    if (session.user.email) {
      dbUser = await User.findOne({ email: session.user.email.toLowerCase().trim() });
    }
    if (!dbUser && session.user.id && mongoose.Types.ObjectId.isValid(session.user.id)) {
      dbUser = await User.findById(session.user.id);
    }

    const userId = dbUser?._id || session.user.id;

    const notifications = await Notification.find({
      $or: [{ recipient: userId }, { recipient: session.user.id }],
    })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      $or: [{ recipient: userId }, { recipient: session.user.id }],
      isRead: false,
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// PATCH /api/notifications - Mark notification(s) as read
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || (!session.user.id && !session.user.email)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await connectToDatabase();

    let dbUser = null;
    if (session.user.email) {
      dbUser = await User.findOne({ email: session.user.email.toLowerCase().trim() });
    }
    if (!dbUser && session.user.id && mongoose.Types.ObjectId.isValid(session.user.id)) {
      dbUser = await User.findById(session.user.id);
    }

    const userId = dbUser?._id || session.user.id;
    const body = await req.json().catch(() => ({}));
    const { notificationId, markAll } = body;

    if (markAll) {
      await Notification.updateMany(
        { $or: [{ recipient: userId }, { recipient: session.user.id }], isRead: false },
        { $set: { isRead: true } }
      );
    } else if (notificationId) {
      await Notification.updateOne(
        { _id: notificationId },
        { $set: { isRead: true } }
      );
    } else {
      await Notification.updateMany(
        { $or: [{ recipient: userId }, { recipient: session.user.id }], isRead: false },
        { $set: { isRead: true } }
      );
    }

    return NextResponse.json({ success: true, message: "Notifications marked as read" });
  } catch (error: any) {
    console.error("PATCH /api/notifications error:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
