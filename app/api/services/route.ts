import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Gig, User } from "@/lib/models";

const DEFAULT_SEED_GIGS = [
  {
    title: "Plumbing Repair & Pipe Fixtures",
    description: "Expert leak repairs, pipe fitting, faucet replacement, and drain unclogging.",
    category: "Plumbing",
    price: 45,
    location: "Patna, Bihar",
    rating: 4.9,
    reviewCount: 124,
    images: ["https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80"],
  },
  {
    title: "Electrical Inspection & Wiring Repairs",
    description: "Certified electrician for short circuits, switchboard repair, fan installation, and safety checks.",
    category: "Electrician",
    price: 50,
    location: "Patna, Bihar",
    rating: 4.8,
    reviewCount: 98,
    images: ["https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80"],
  },
  {
    title: "Full Home Deep Cleaning & Sanitization",
    description: "Comprehensive home cleaning covering kitchen, bathrooms, living rooms, and sofa shampooing.",
    category: "House Cleaning",
    price: 60,
    location: "Patna, Bihar",
    rating: 5.0,
    reviewCount: 210,
    images: ["https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80"],
  },
  {
    title: "Home Cook & Meal Preparation",
    description: "Hygiene-conscious personal cook for daily meals, breakfast, and dinner preparation.",
    category: "Cook / Chef",
    price: 40,
    location: "Patna, Bihar",
    rating: 4.9,
    reviewCount: 88,
    images: ["https://images.unsplash.com/photo-1556910103-1c02745a872f?auto=format&fit=crop&w=600&q=80"],
  },
  {
    title: "AC Service, Gas Refill & Maintenance",
    description: "Split & window AC servicing, filter cleaning, cooling coil wash, and gas recharging.",
    category: "AC & Appliance Repair",
    price: 55,
    location: "Patna, Bihar",
    rating: 4.9,
    reviewCount: 312,
    images: ["https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=600&q=80"],
  },
  {
    title: "Carpentry & Furniture Repair",
    description: "Custom woodwork, door lock fitting, furniture assembly, and wooden cabinet repairs.",
    category: "Carpentry & Woodwork",
    price: 45,
    location: "Patna, Bihar",
    rating: 4.7,
    reviewCount: 65,
    images: ["https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80"],
  },
];

// GET /api/services - Get active services/gigs
export async function GET() {
  try {
    await connectToDatabase();

    let gigs = await Gig.find({ status: "active" })
      .populate("provider", "name email phone image rating skills bio")
      .sort({ createdAt: -1 });

    // Seed default services if empty
    if (gigs.length === 0) {
      let defaultProvider = await User.findOne({ role: "freelancer" });
      if (!defaultProvider) {
        defaultProvider = await User.findOne();
      }

      if (defaultProvider) {
        const seedData = DEFAULT_SEED_GIGS.map((g) => ({
          ...g,
          provider: defaultProvider._id,
          status: "active",
        }));
        await Gig.insertMany(seedData);
        gigs = await Gig.find({ status: "active" })
          .populate("provider", "name email phone image rating skills bio")
          .sort({ createdAt: -1 });
      }
    }

    return NextResponse.json({ success: true, services: gigs });
  } catch (error: any) {
    console.error("GET /api/services error:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}
