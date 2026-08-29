import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 sm:p-12">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Protected Route</span>
            <h1 className="text-2xl font-bold mt-1">Gig Service Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome back, {session.user.name || session.user.email}!</p>
          </div>

          <LogoutButton />
        </div>

        {/* User Info Card */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-semibold border-b border-slate-100 dark:border-slate-800 pb-3">
            Authenticated User Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400 text-xs block">Name</span>
              <span className="font-medium">{session.user.name || "N/A"}</span>
            </div>

            <div>
              <span className="text-slate-400 text-xs block">Email Address</span>
              <span className="font-medium">{session.user.email}</span>
            </div>

            <div>
              <span className="text-slate-400 text-xs block">Account Role</span>
              <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 capitalize">
                {session.user.role || "client"}
              </span>
            </div>

            <div>
              <span className="text-slate-400 text-xs block">Email Verification Status</span>
              <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                session.user.isVerified
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
              }`}>
                {session.user.isVerified ? "✓ Verified Account" : "⚠ Pending Verification"}
              </span>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
