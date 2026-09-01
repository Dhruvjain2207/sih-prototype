import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import "next-auth/jwt";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";

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
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
            role: "client", // Default role; onboarding will refine to freelancer if desired
          });
        } else if (!dbUser.isVerified) {
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
      }
      
      if (token.email) {
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
