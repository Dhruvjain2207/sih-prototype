import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import "next-auth/jwt";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

// NextAuth TypeScript Module Augmentation
declare module "next-auth" {
  interface User {
    id?: string;
    role?: "client" | "freelancer" | "admin";
    isVerified?: boolean;
  }

  interface Session {
    user: {
      id?: string;
      role?: "client" | "freelancer" | "admin";
      isVerified?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "client" | "freelancer" | "admin";
    isVerified?: boolean;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password.");
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        await connectToDatabase();

        const user = await User.findOne({ email });

        if (!user) {
          throw new Error("No user found with this email.");
        }

        // Handle optional password check (e.g., user signed up via Google OAuth or OTP)
        if (!user.password) {
          throw new Error("This account was created without a password. Please sign in via Google/OTP.");
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
          throw new Error("Incorrect password.");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified ?? false,
          image: user.image || "",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "client" | "freelancer" | "admin";
        session.user.isVerified = token.isVerified as boolean;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "gig_service_prototype_auth_secret",
});
