"use client";

import React, { useState, useEffect } from "react";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  hasPassword?: boolean;
  createdAt: string;
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
  createdAt: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"users" | "gigs">("users");
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; dbName?: string; message?: string }>({
    connected: false,
  });

  // User Form State
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [includePassword, setIncludePassword] = useState(true);
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("client");
  const [userLoading, setUserLoading] = useState(false);
  const [userAlert, setUserAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Gig Form State
  const [gigTitle, setGigTitle] = useState("");
  const [gigCategory, setGigCategory] = useState("Plumbing");
  const [gigPrice, setGigPrice] = useState("");
  const [gigLocation, setGigLocation] = useState("Mumbai, MH");
  const [gigDesc, setGigDesc] = useState("");
  const [gigLoading, setGigLoading] = useState(false);
  const [gigAlert, setGigAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Data Lists State
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [gigsList, setGigsList] = useState<GigItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Check DB status and fetch initial data
  useEffect(() => {
    checkDbHealth();
    fetchData();
  }, []);

  const checkDbHealth = async () => {
    try {
      const res = await fetch("/api/db-test");
      const data = await res.json();
      if (data.status === "success") {
        setDbStatus({ connected: true, dbName: data.databaseName, message: "MongoDB Connected" });
      } else {
        setDbStatus({ connected: false, message: data.message || "Failed to connect" });
      }
    } catch {
      setDbStatus({ connected: false, message: "Server API Unavailable" });
    }
  };

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [uRes, gRes] = await Promise.all([fetch("/api/users"), fetch("/api/gigs")]);
      const uData = await uRes.json();
      const gData = await gRes.json();

      if (uData.success) setUsersList(uData.users || []);
      if (gData.success) setGigsList(gData.gigs || []);
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setRefreshing(false);
    }
  };

  // Submit User Form
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserLoading(true);
    setUserAlert(null);

    try {
      const payload: Record<string, unknown> = {
        name: userName,
        email: userEmail,
        role: userRole,
      };

      if (includePassword && userPassword.trim()) {
        payload.password = userPassword;
      }

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUserAlert({
          type: "success",
          msg: `User "${data.user.email}" added to DB! Password was ${data.user.hasPassword ? "hashed & saved" : "omitted (Optional)"}.`,
        });
        setUserName("");
        setUserEmail("");
        setUserPassword("");
        fetchData();
      } else {
        setUserAlert({ type: "error", msg: data.error || "Failed to add user" });
      }
    } catch {
      setUserAlert({ type: "error", msg: "Network error connecting to API" });
    } finally {
      setUserLoading(false);
    }
  };

  // Submit Gig Form
  const handleGigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGigLoading(true);
    setGigAlert(null);

    try {
      const res = await fetch("/api/gigs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: gigTitle,
          category: gigCategory,
          price: Number(gigPrice),
          location: gigLocation,
          description: gigDesc,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setGigAlert({
          type: "success",
          msg: `Gig "${data.gig.title}" created successfully in MongoDB!`,
        });
        setGigTitle("");
        setGigPrice("");
        setGigDesc("");
        fetchData();
      } else {
        setGigAlert({ type: "error", msg: data.error || "Failed to create gig" });
      }
    } catch {
      setGigAlert({ type: "error", msg: "Network error connecting to API" });
    } finally {
      setGigLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <h1 className="text-2xl font-bold tracking-tight">Gig Service Prototype</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              MongoDB Database & Schema Management Tester
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {refreshing ? "Refreshing..." : "🔄 Refresh Data"}
            </button>
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
                dbStatus.connected
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${dbStatus.connected ? "bg-emerald-500" : "bg-amber-500"}`}></span>
              {dbStatus.connected ? `MongoDB: ${dbStatus.dbName}` : `DB Notice: ${dbStatus.message}`}
            </div>
          </div>
        </header>

        {/* Main Grid: Form Entry + DB Live Data View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input Forms */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              
              {/* Tab Navigation */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
                <button
                  onClick={() => setActiveTab("users")}
                  className={`pb-3 text-sm font-semibold px-4 transition-colors relative ${
                    activeTab === "users"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  ➕ Add User
                </button>
                <button
                  onClick={() => setActiveTab("gigs")}
                  className={`pb-3 text-sm font-semibold px-4 transition-colors relative ${
                    activeTab === "gigs"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  🛠️ Add Gig Service
                </button>
              </div>

              {/* USER FORM */}
              {activeTab === "users" && (
                <form onSubmit={handleUserSubmit} className="space-y-4">
                  <h2 className="text-base font-semibold">Add User to MongoDB</h2>
                  <p className="text-xs text-slate-500">
                    Test user schema insertion with optional password support.
                  </p>

                  {userAlert && (
                    <div
                      className={`p-3 rounded-lg text-xs border ${
                        userAlert.type === "success"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-red-50 text-red-800 border-red-200"
                      }`}
                    >
                      {userAlert.msg}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="alex@example.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">User Role</label>
                    <select
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="client">Client (Hire Services)</option>
                      <option value="freelancer">Freelancer / Gig Worker</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* Optional Password Toggle */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includePassword}
                        onChange={(e) => setIncludePassword(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-semibold">Include Password?</span>
                      <span className="text-[10px] text-slate-400 font-mono">(Schema: Password is Optional)</span>
                    </label>

                    {includePassword && (
                      <div>
                        <input
                          type="password"
                          placeholder="Set user password..."
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={userLoading}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50"
                  >
                    {userLoading ? "Saving to MongoDB..." : "Submit User to DB"}
                  </button>
                </form>
              )}

              {/* GIG FORM */}
              {activeTab === "gigs" && (
                <form onSubmit={handleGigSubmit} className="space-y-4">
                  <h2 className="text-base font-semibold">Create Gig Service</h2>
                  <p className="text-xs text-slate-500">
                    Insert a new gig listing into the MongoDB database.
                  </p>

                  {gigAlert && (
                    <div
                      className={`p-3 rounded-lg text-xs border ${
                        gigAlert.type === "success"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-red-50 text-red-800 border-red-200"
                      }`}
                    >
                      {gigAlert.msg}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium mb-1">Gig Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Professional Home Plumbing Repair"
                      value={gigTitle}
                      onChange={(e) => setGigTitle(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Category</label>
                      <select
                        value={gigCategory}
                        onChange={(e) => setGigCategory(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Plumbing">Plumbing</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Graphic Design">Graphic Design</option>
                        <option value="AC Repair">AC Repair</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">Price (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 499"
                        value={gigPrice}
                        onChange={(e) => setGigPrice(e.target.value)}
                        required
                        min="1"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai / Delhi / Remote"
                      value={gigLocation}
                      onChange={(e) => setGigLocation(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Service Description</label>
                    <textarea
                      placeholder="Describe the service details..."
                      value={gigDesc}
                      onChange={(e) => setGigDesc(e.target.value)}
                      required
                      rows={3}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={gigLoading}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50"
                  >
                    {gigLoading ? "Creating Gig..." : "Publish Gig to DB"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: DB Data Display */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Users in Database Section */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold flex items-center gap-2">
                    👥 Users Collection
                    <span className="text-xs font-normal text-slate-500">({usersList.length} stored)</span>
                  </h2>
                </div>
                <a
                  href="/api/users"
                  target="_blank"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Raw API JSON ↗
                </a>
              </div>

              {usersList.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <p className="text-sm text-slate-500">No users found in MongoDB yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Use the form on the left to add a user!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {usersList.map((user) => (
                    <div
                      key={user._id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm truncate">{user.name}</span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            user.role === "freelancer"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="text-slate-400 font-mono text-[10px]">
                          ID: ...{user._id.slice(-6)}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Saved in DB
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Gigs in Database Section */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold flex items-center gap-2">
                    🛠️ Gigs Collection
                    <span className="text-xs font-normal text-slate-500">({gigsList.length} stored)</span>
                  </h2>
                </div>
                <a
                  href="/api/gigs"
                  target="_blank"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Raw API JSON ↗
                </a>
              </div>

              {gigsList.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <p className="text-sm text-slate-500">No gig services found in MongoDB yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Use the "Add Gig Service" tab to publish one!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {gigsList.map((gig) => (
                    <div
                      key={gig._id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-sm">{gig.title}</h3>
                          <span className="inline-block mt-1 text-[11px] font-medium text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                            {gig.category}
                          </span>
                        </div>
                        <span className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                          ₹{gig.price}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {gig.description}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                        <span>Location: {gig.location || "Remote"}</span>
                        <span>Provider: {gig.provider?.name || "Verified Freelancer"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Footer info */}
        <footer className="text-center text-xs text-slate-400 py-4">
          Gig Service Prototype • Next.js 16 + Mongoose + Tailwind CSS
        </footer>

      </div>
    </div>
  );
}
