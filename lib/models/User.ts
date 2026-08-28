import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional for Google OAuth / OTP / Social Login
  role: "client" | "freelancer" | "admin";
  image?: string;
  phone?: string;
  skills?: string[];
  bio?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false, // Explicitly optional for OAuth / Passwordless authentications
    },
    role: {
      type: String,
      enum: ["client", "freelancer", "admin"],
      default: "client",
    },
    image: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
