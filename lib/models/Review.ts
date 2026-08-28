import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  gig: mongoose.Types.ObjectId;
  booking?: mongoose.Types.ObjectId;
  reviewer: mongoose.Types.ObjectId;
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
      required: [true, "Gig ID is required"],
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reviewer (User) ID is required"],
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

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
