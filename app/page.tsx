"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified?: boolean;
}

interface GigItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  location?: string;
  provider?: {
    name?: string;
    email?: string;
  };
}

export default function Home() {
  const [dbConnected, setDbConnected] = useState(false);
  const [showDbTester, setShowDbTester] = useState(false);

  // Test data counts
  const [usersCount, setUsersCount] = useState(0);
  const [gigsCount, setGigsCount] = useState(0);
  const [recentGigs, setRecentGigs] = useState<GigItem[]>([]);

  useEffect(() => {
    fetchDbStatus();
  }, []);

  const fetchDbStatus = async () => {
    try {
      const [dbRes, uRes, gRes] = await Promise.all([
        fetch("/api/db-test"),
        fetch("/api/users"),
        fetch("/api/gigs"),
      ]);

      const dbData = await dbRes.json();
      if (dbData.status === "success") setDbConnected(true);

      const uData = await uRes.json();
      if (uData.success) setUsersCount(uData.count || 0);

      const gData = await gRes.json();
      if (gData.success) {
        setGigsCount(gData.count || 0);
        setRecentGigs((gData.gigs || []).slice(0, 4));
      }
    } catch {
      setDbConnected(false);
    }
  };

  const categories = [
    { title: "Home Repair & Plumbing", count: "120+ Experts", icon: "🔧" },
    { title: "Electrical & AC Repair", count: "95+ Experts", icon: "⚡" },
    { title: "Web & Software Dev", count: "210+ Freelancers", icon: "💻" },
    { title: "Graphic Design & Media", count: "150+ Designers", icon: "🎨" },
    { title: "Cleaning & Housekeeping", count: "80+ Workers", icon: "🧹" },
    { title: "Event Management", count: "45+ Organizers", icon: "🎉" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/" className="flex items-center gap-2 text-lg sm:text-xl font-extrabold tracking-tight group">
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center text-white text-base sm:text-lg shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                ⚡
              </span>
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                CoopConnect
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 text-sm font-semibold text-indigo-400 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/50 rounded-lg transition-colors"
              >
                Register
              </Link>
            </nav>
          </div>

          {/* Right Aligned Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowDbTester(!showDbTester)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-800 bg-slate-900 hover:border-slate-700 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${dbConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
              <span className="text-slate-300">
                {dbConnected ? "MongoDB Online" : "Check DB Status"}
              </span>
            </button>

            <Link
              href="/login"
              className="md:hidden px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors"
            >
              Login
            </Link>

            <Link
              href="/dashboard"
              className="px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              Dashboard →
            </Link>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <span>🚀 SIH 2026 Smart Prototype</span>
            <span className="w-1 h-1 rounded-full bg-indigo-400"></span>
            <span>Email OTP & MongoDB Verified</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Connect with Skilled Local Experts & Services on{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              CoopConnect
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-400 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            The next-generation gig platform built for seamless service discovery, verified worker identity, instant OTP email activation, and direct booking.
          </p>

          {/* Action Call to Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              Get Started for Free
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-base rounded-2xl border border-slate-800 transition-all"
            >
              Sign In to Your Account
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-2xl mx-auto pt-12 border-t border-slate-800/80 text-center">
            <div>
              <div className="text-3xl font-extrabold text-white">{usersCount > 0 ? `${usersCount}+` : "100%"}</div>
              <div className="text-xs text-slate-400 mt-1">Verified Users Stored</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-indigo-400">{gigsCount > 0 ? `${gigsCount}+` : "Instant"}</div>
              <div className="text-xs text-slate-400 mt-1">Active Gig Listings</div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-3xl font-extrabold text-cyan-400">Resend OTP</div>
              <div className="text-xs text-slate-400 mt-1">Email Verification</div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 px-6 bg-slate-900/40 border-y border-slate-900">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-white">Why Choose CoopConnect?</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Empowering workers and service seekers with secure authentication and modern digital infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800/50 flex items-center justify-center text-2xl">
                🔐
              </div>
              <h3 className="text-lg font-bold text-white">Email OTP Verification</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                6-digit numeric verification code sent via Resend API ensuring only authentic users activate accounts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800/50 flex items-center justify-center text-2xl">
                🍃
              </div>
              <h3 className="text-lg font-bold text-white">MongoDB Atlas Core</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Scalable database models for Users, Gigs, Bookings, and Reviews with Mongoose TypeScript definitions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800/50 flex items-center justify-center text-2xl">
                🛡️
              </div>
              <h3 className="text-lg font-bold text-white">Auth.js & Next.js 16</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Protected `/dashboard` routes secured with Next.js 16 `proxy.ts` middleware and JWT sessions.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white">Popular Gig Categories</h2>
              <p className="text-slate-400 text-sm mt-1">Browse verified service offerings across top industries</p>
            </div>
            <Link href="/register" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
              Join as a Service Provider →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl p-3 bg-slate-800/80 rounded-xl group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors">
                      {cat.title}
                    </h3>
                    <span className="text-xs text-slate-400">{cat.count}</span>
                  </div>
                </div>
                <span className="text-slate-600 group-hover:text-indigo-400 transition-colors">→</span>
              </div>
            ))}
          </div>

          {/* Recent Gigs from MongoDB */}
          {recentGigs.length > 0 && (
            <div className="pt-8 space-y-6">
              <h3 className="text-xl font-bold text-white">Recent Gigs in Database</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentGigs.map((gig) => (
                  <div key={gig._id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white">{gig.title}</h4>
                      <span className="text-indigo-400 font-extrabold text-sm">₹{gig.price}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{gig.description}</p>
                    <div className="text-[11px] text-slate-500 pt-2 flex justify-between">
                      <span>Category: {gig.category}</span>
                      <span>Provider: {gig.provider?.name || "Verified Expert"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-slate-400 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-lg">⚡</span>
            <span className="font-bold text-slate-200">CoopConnect</span>
            <span>• Smart India Hackathon Prototype</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>

          <div>
            &copy; {new Date().getFullYear()} CoopConnect. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}