import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  recipient: any;
  sender?: any;
  type:
    | "NEW_BOOKING"
    | "BOOKING_ACCEPTED"
    | "BOOKING_REJECTED"
    | "BOOKING_CANCELLED"
    | "SERVICE_STARTED"
    | "SERVICE_COMPLETED"
    | "PAYMENT_SUCCESS";
  title: string;
  message: string;
  booking?: any;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.Mixed,
      ref: "User",
      required: [true, "Recipient ID is required"],
    },
    sender: {
      type: Schema.Types.Mixed,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "NEW_BOOKING",
        "BOOKING_ACCEPTED",
        "BOOKING_REJECTED",
        "BOOKING_CANCELLED",
        "SERVICE_STARTED",
        "SERVICE_COMPLETED",
        "PAYMENT_SUCCESS",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    booking: {
      type: Schema.Types.Mixed,
      ref: "Booking",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
