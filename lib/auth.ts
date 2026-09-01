import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
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
    skills?: string[];
  }

  interface Session {
    user: {
      id?: string;
      role?: "client" | "freelancer" | "admin";
      isVerified?: boolean;
      skills?: string[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "client" | "freelancer" | "admin";
    isVerified?: boolean;
    skills?: string[];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
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
          skills: user.skills || [],
          image: user.image || "",
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        const email = user.email.toLowerCase().trim();

        await connectToDatabase();

        let dbUser = await User.findOne({ email });

        if (!dbUser) {
          // Create user in MongoDB for Google Auth (no OTP required, set isVerified: true)
          dbUser = await User.create({
            name: user.name || profile?.name || email.split("@")[0],
            email,
            image: user.image || (profile as { picture?: string })?.picture || "",
            isVerified: true,
            role: "client",
          });
        } else if (!dbUser.isVerified) {
          // Google authentication confirms ownership of the email address
          dbUser.isVerified = true;
          await dbUser.save();
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified ?? true;
        token.skills = user.skills || [];
      } else if (token.email) {
        try {
          await connectToDatabase();
          const email = token.email.toLowerCase().trim();
          const dbUser = await User.findOne({ email }).lean();
          if (dbUser) {
            token.id = (dbUser._id as { toString(): string }).toString();
            token.role = dbUser.role;
            token.isVerified = dbUser.isVerified;
            token.skills = dbUser.skills || [];
          }
        } catch (err) {
          console.error("[Auth JWT Error]", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "client" | "freelancer" | "admin";
        session.user.isVerified = token.isVerified as boolean;
        session.user.skills = (token.skills as string[]) || [];
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
