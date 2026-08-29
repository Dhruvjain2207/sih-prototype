import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAddress {
  fullName: string;
  phone: string;
  houseFlat: string;
  streetArea: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  instructions?: string;
}

export interface IBooking extends Document {
  gig?: any;
  serviceTitle: string;
  category: string;
  problemDescription: string;
  client: any;
  provider: any;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "IN_PROGRESS" | "COMPLETED";
  totalAmount: number;
  paymentMethod: "CASH_AFTER_WORK";
  scheduledDate: Date;
  timeSlot: string;
  address: IAddress;
  notes?: string;
  rejectionReason?: string;
  acceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  rejectedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    houseFlat: { type: String, required: true },
    streetArea: { type: String, required: true },
    landmark: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    instructions: { type: String, default: "" },
  },
  { _id: false }
);

const BookingSchema = new Schema<IBooking>(
  {
    gig: {
      type: Schema.Types.Mixed,
      ref: "Gig",
      required: false,
    },
    serviceTitle: {
      type: String,
      required: true,
      default: "Home Service",
    },
    category: {
      type: String,
      required: true,
      default: "General",
    },
    problemDescription: {
      type: String,
      required: true,
      default: "Service required",
    },
    client: {
      type: Schema.Types.Mixed,
      ref: "User",
      required: [true, "Client ID is required"],
    },
    provider: {
      type: Schema.Types.Mixed,
      ref: "User",
      required: [true, "Provider ID is required"],
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED", "IN_PROGRESS", "COMPLETED"],
      default: "PENDING",
      uppercase: true,
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
    },
    paymentMethod: {
      type: String,
      default: "CASH_AFTER_WORK",
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
      default: "09:00 AM - 12:00 PM",
    },
    address: {
      type: AddressSchema,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    acceptedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    rejectedAt: { type: Date },
    cancelledAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
