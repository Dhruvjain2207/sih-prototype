import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User, Gig, Booking, Review } from "@/lib/models";

export async function GET() {
  try {
    const conn = await connectToDatabase();
    
    return NextResponse.json({
      status: "success",
      message: "MongoDB connected successfully!",
      databaseName: conn.connection.name,
      modelsRegistered: {
        User: !!User,
        Gig: !!Gig,
        Booking: !!Booking,
        Review: !!Review,
      },
      schemaDetails: {
        isUserPasswordRequired: User.schema.path("password").isRequired,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to MongoDB",
        error: errorMessage,
        tip: "Ensure MongoDB is running locally on port 27017 or provide MONGODB_URI in .env.local",
      },
      { status: 500 }
    );
  }
}
