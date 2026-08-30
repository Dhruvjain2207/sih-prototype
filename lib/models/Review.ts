import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  gig?: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  reviewer: mongoose.Types.ObjectId;
  reviewee: mongoose.Types.ObjectId;
  reviewType: "client_to_freelancer" | "freelancer_to_client";
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    gig: {
      type: Schema.Types.ObjectId,
      ref: "Gig",
      required: false,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking ID is required"],
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reviewer ID is required"],
    },
    reviewee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reviewee ID is required"],
    },
    reviewType: {
      type: String,
      enum: ["client_to_freelancer", "freelancer_to_client"],
      required: [true, "Review type is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ booking: 1, reviewer: 1 }, { unique: true });

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
