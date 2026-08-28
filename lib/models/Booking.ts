import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBooking extends Document {
  gig: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  totalAmount: number;
  scheduledDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    gig: {
      type: Schema.Types.ObjectId,
      ref: "Gig",
      required: [true, "Gig ID is required"],
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Client (User) ID is required"],
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Provider (User) ID is required"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
    },
    scheduledDate: {
      type: Date,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
