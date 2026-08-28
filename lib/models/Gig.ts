import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGig extends Document {
  title: string;
  description: string;
  category: string;
  price: number;
  provider: mongoose.Types.ObjectId;
  images: string[];
  status: "active" | "inactive" | "draft";
  location?: string;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const GigSchema = new Schema<IGig>(
  {
    title: {
      type: String,
      required: [true, "Gig title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Gig description is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      index: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Provider (User) is required"],
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
    location: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Gig: Model<IGig> =
  mongoose.models.Gig || mongoose.model<IGig>("Gig", GigSchema);

export default Gig;
