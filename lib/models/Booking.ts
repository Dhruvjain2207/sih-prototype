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

export interface IBulkAssignment {
  _id?: any;
  provider: any;
  unitsClaimed: number;
  quotedPricePerUnit: number;
  totalAmount: number;
  status: "PENDING" | "ACCEPTED" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "IN_PROGRESS" | "COMPLETED";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  paymentMethod: "RAZORPAY" | "CASH_AFTER_WORK";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paidAt?: Date;
  claimedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
}

export interface IBooking extends Document {
  gig?: any;
  serviceTitle: string;
  category: string;
  problemDescription: string;
  client: any;
  provider: any;
  status: "PENDING" | "PARTIALLY_ACCEPTED" | "ACCEPTED" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "IN_PROGRESS" | "COMPLETED";
  totalAmount: number;
  quotedPrice?: number;
  paymentMethod: "RAZORPAY" | "CASH_AFTER_WORK";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paidAt?: Date;
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
  // Bulk booking fields
  isBulk?: boolean;
  totalUnits?: number;
  remainingUnits?: number;
  unitType?: string;
  selectedServices?: string[];
  assignments?: IBulkAssignment[];
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

const BulkAssignmentSchema = new Schema<IBulkAssignment>(
  {
    provider: {
      type: Schema.Types.Mixed,
      ref: "User",
      required: true,
    },
    unitsClaimed: {
      type: Number,
      required: true,
      min: 1,
    },
    quotedPricePerUnit: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "CONFIRMED", "REJECTED", "CANCELLED", "IN_PROGRESS", "COMPLETED"],
      default: "ACCEPTED",
      uppercase: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
      uppercase: true,
    },
    paymentMethod: {
      type: String,
      enum: ["RAZORPAY", "CASH_AFTER_WORK"],
      default: "CASH_AFTER_WORK",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    paidAt: { type: Date },
    claimedAt: {
      type: Date,
      default: Date.now,
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    notes: { type: String, default: "" },
  },
  { _id: true, timestamps: true }
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
      required: false,
    },
    status: {
      type: String,
      enum: ["PENDING", "PARTIALLY_ACCEPTED", "ACCEPTED", "CONFIRMED", "REJECTED", "CANCELLED", "IN_PROGRESS", "COMPLETED"],
      default: "PENDING",
      uppercase: true,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    quotedPrice: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["RAZORPAY", "CASH_AFTER_WORK"],
      default: "RAZORPAY",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
      uppercase: true,
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    paidAt: { type: Date },
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
    // Bulk Booking Fields
    isBulk: {
      type: Boolean,
      default: false,
      index: true,
    },
    totalUnits: {
      type: Number,
      default: 1,
    },
    remainingUnits: {
      type: Number,
      default: 1,
    },
    unitType: {
      type: String,
      default: "household",
    },
    selectedServices: {
      type: [String],
      default: [],
    },
    assignments: {
      type: [BulkAssignmentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
