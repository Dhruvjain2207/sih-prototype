'use client';
import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import {
  Wrench,
  MessageSquare,
  MapPin,
  Clock,
  User,
  LogOut,
  X,
  CheckCircle,
  ArrowUpRight,
  ShieldCheck,
  Coins,
  Send,
  Zap,
  Bell,
  Check,
  Ban,
  Play,
  FileText,
  AlertCircle,
  CheckCircle2,
  Menu,
} from 'lucide-react';
import toast from 'react-hot-toast';
import './freelancer.css';
import './dashboard.css';

interface FreelancerDashboardProps {
  session: any;
}

export default function FreelancerDashboard({ session }: FreelancerDashboardProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  
  // Database States
  const [bookings, setBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Modal States
  const [selectedRejectBooking, setSelectedRejectBooking] = useState<any>(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Fetch Data on Mount & Poll every 4 seconds for real-time requests
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      // 1. Fetch Freelancer Bookings
      const bookingsRes = await fetch('/api/bookings');
      const bookingsData = await bookingsRes.json();
      if (bookingsData.success && bookingsData.bookings) {
        setBookings(bookingsData.bookings);
      }

      // 2. Fetch Notifications
      const notifRes = await fetch('/api/notifications');
      const notifData = await notifRes.json();
      if (notifData.success) {
        setNotifications(notifData.notifications || []);
        setUnreadNotificationsCount(notifData.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error fetching freelancer dashboard data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const toggleMenu = (menu: string) => setActiveMenu(activeMenu === menu ? null : menu);

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  // Status Transitions
  const handleUpdateStatus = async (bookingId: string, targetStatus: string, reason?: string) => {
    setSubmittingAction(true);
    const toastId = toast.loading(`Updating booking status...`);

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus, rejectionReason: reason }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Booking ${targetStatus.toLowerCase()} successfully!`, { id: toastId, duration: 4000 });
        setSelectedRejectBooking(null);
        setSelectedBookingDetail(null);
        setRejectionReason('');
        fetchData();
      } else {
        toast.error(data.error || 'Failed to update booking status', { id: toastId });
      }
    } catch {
      toast.error('Network error updating booking status', { id: toastId });
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setUnreadNotificationsCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const userInitials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'FL';

  // Categorize Real Bookings
  const pendingRequests = bookings.filter((b) => b.status === 'PENDING');
  const activeJobs = bookings.filter((b) => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS');
  const completedJobs = bookings.filter((b) => b.status === 'COMPLETED');
  const pastInactives = bookings.filter((b) => b.status === 'REJECTED' || b.status === 'CANCELLED');

  const totalCreditsEarned = completedJobs.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
  const totalHoursHelped = completedJobs.length * 2;

  return (
    <div className="freelancer-dashboard-container">
      {/* NAVBAR */}
      <nav className="navbar glass-panel" style={{ borderBottom: '1px solid rgba(56, 189, 248, 0.15)' }}>
        <div className="nav-left">
          <div className="brand">
            <div className="brand-logo" style={{ background: 'linear-gradient(135deg, #0284c7, #2563eb)' }}>⚡</div>
            <span>CoopConnect</span>
          </div>
          <div className="nav-divider"></div>
          <div className="freelancer-badge-pill">
            <Zap size={14} /> Freelancer Mode
          </div>
        </div>

        <div className="nav-right">
          {/* Notifications Bell */}
          <div className="nav-icon-container">
            <button
              className={`nav-icon ${activeMenu === 'notifications' ? 'active' : ''}`}
              onClick={() => {
                toggleMenu('notifications');
                if (unreadNotificationsCount > 0) handleMarkNotificationsRead();
              }}
            >
              <Bell size={20} />
              {unreadNotificationsCount > 0 && (
                <span className="badge-count" style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '10px', fontWeight: 800 }}>
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {activeMenu === 'notifications' && (
              <div className="dropdown-menu-responsive">
                <div style={{ padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bell size={16} className="text-sky-400" /> Notifications
                  </div>
                  <button onClick={handleMarkNotificationsRead} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Mark all read</button>
                </div>

                <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '0.5rem' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                      <Bell size={32} style={{ color: '#475569', margin: '0 auto 0.5rem' }} />
                      No new notifications right now.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: '12px',
                          marginBottom: '0.4rem',
                          background: n.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(56, 189, 248, 0.08)',
                          border: `1px solid ${n.isRead ? 'rgba(255,255,255,0.05)' : 'rgba(56, 189, 248, 0.2)'}`,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: n.type === 'NEW_BOOKING' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                          color: n.type === 'NEW_BOOKING' ? '#38bdf8' : '#22c55e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {n.type === 'NEW_BOOKING' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.2rem', lineHeight: 1.4 }}>{n.message}</div>
                          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.35rem' }}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Only Navigation Items */}
          <div className="desktop-only-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* User Profile */}
            <div className="nav-icon-container">
              <button className={`nav-icon ${activeMenu === 'profile' ? 'active' : ''}`} onClick={() => toggleMenu('profile')}>
                <User size={20} />
              </button>
              {activeMenu === 'profile' && (
                <div className="dropdown-menu profile-menu glass-panel" style={{ background: '#0b1329', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                  <div className="profile-header">
                    <div className="avatar-gradient" style={{ background: 'linear-gradient(135deg, #0284c7, #3b82f6)' }}>{userInitials}</div>
                    <div className="profile-titles">
                      <span className="profile-name">{session?.user?.name || 'Freelancer'}</span>
                      <span className="text-muted text-xs">{session?.user?.email || 'No email'}</span>
                    </div>
                  </div>
                  <div className="menu-divider"></div>
                  <div className="profile-details">
                    <div className="detail-row">
                      <span>Role:</span>
                      <span className="font-semibold text-xs text-sky-400 uppercase">Freelancer Pro</span>
                    </div>
                  </div>
                  <div className="menu-divider"></div>
                  <button className="action-btn danger-btn" onClick={handleLogout}>
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              className="nav-item danger-btn"
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>


          {/* Hamburger Menu Toggle Button for Mobile */}
          <button
            className="mobile-hamburger-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Sidebar"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* MOBILE HAMBURGER SIDEBAR / DRAWER */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div className="mobile-drawer-title">
                <div className="brand-logo" style={{ background: 'linear-gradient(135deg, #0284c7, #2563eb)', width: '28px', height: '28px', fontSize: '1rem' }}>⚡</div>
                <span>CoopConnect</span>
              </div>
              <button className="close-btn-modern" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="mobile-drawer-body">
              {/* User Profile Summary */}
              <div className="mobile-drawer-user-card" style={{ borderColor: 'rgba(56, 189, 248, 0.25)', background: 'rgba(14, 165, 233, 0.08)' }}>
                <div className="mobile-drawer-avatar" style={{ background: 'linear-gradient(135deg, #0284c7, #3b82f6)' }}>{userInitials}</div>
                <div className="mobile-drawer-user-info">
                  <div className="mobile-drawer-user-name">{session?.user?.name || 'Freelancer'}</div>
                  <div className="mobile-drawer-user-email">{session?.user?.email || 'Freelancer Pro'}</div>
                </div>
              </div>

              {/* Mode Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(14, 165, 233, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.65rem 0.85rem', borderRadius: '10px', fontSize: '0.85rem', color: '#38bdf8' }}>
                <Zap size={16} />
                <span>Mode: <strong style={{ color: '#ffffff' }}>Freelancer Pro (Active)</strong></span>
              </div>

              {/* Section Links */}
              <div>
                <div className="mobile-drawer-section-title">Jump to Section</div>
                <div className="mobile-drawer-nav">
                  <button
                    className="mobile-drawer-item"
                    onClick={() => {
                      const el = document.getElementById('pending-requests-sec');
                      el?.scrollIntoView({ behavior: 'smooth' });
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Clock size={16} /> New Booking Requests
                    </span>
                    {pendingRequests.length > 0 && (
                      <span style={{ background: '#f59e0b', color: '#000', fontSize: '0.7rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: '10px' }}>
                        {pendingRequests.length}
                      </span>
                    )}
                  </button>

                  <button
                    className="mobile-drawer-item"
                    onClick={() => {
                      const el = document.getElementById('active-jobs-sec');
                      el?.scrollIntoView({ behavior: 'smooth' });
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Play size={16} /> Active Jobs
                    </span>
                    {activeJobs.length > 0 && (
                      <span style={{ background: '#38bdf8', color: '#090d16', fontSize: '0.7rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: '10px' }}>
                        {activeJobs.length}
                      </span>
                    )}
                  </button>

                  <button
                    className="mobile-drawer-item"
                    onClick={() => {
                      const el = document.getElementById('cooperative-ledger-sec');
                      el?.scrollIntoView({ behavior: 'smooth' });
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Coins size={16} /> Cooperative Ledger
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>₹{totalCreditsEarned}</span>
                  </button>
                </div>
              </div>

              {/* Notifications Link */}
              <div>
                <div className="mobile-drawer-section-title">Notifications</div>
                <button
                  className="mobile-drawer-item"
                  onClick={() => {
                    toggleMenu('notifications');
                    if (unreadNotificationsCount > 0) handleMarkNotificationsRead();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Bell size={16} /> Notifications
                  </span>
                  {unreadNotificationsCount > 0 && (
                    <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '0.1rem 0.45rem', borderRadius: '10px' }}>
                      {unreadNotificationsCount} unread
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Logout Footer Option */}
            <div className="mobile-drawer-footer">
              <button className="mobile-drawer-item danger-item" onClick={handleLogout}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <LogOut size={16} /> Logout from Account
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main>
        {/* SECTION 1: NEW BOOKING REQUESTS (PENDING) */}
        <section id="pending-requests-sec" className="freelancer-section">
          <div className="freelancer-section-subtitle">RIGHT NOW</div>
          <div className="freelancer-section-header">
            <h1 className="freelancer-section-title">New Booking Requests ({pendingRequests.length})</h1>
          </div>


          {pendingRequests.length === 0 ? (
            <div style={{ background: 'rgba(13, 22, 44, 0.6)', border: '1px solid rgba(56, 189, 248, 0.12)', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
              <Clock size={36} style={{ color: '#38bdf8', margin: '0 auto 0.75rem' }} />
              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.1rem' }}>No New Requests Right Now</div>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>When a customer books your services, their request will appear here instantly.</p>
            </div>
          ) : (
            <div className="freelancer-cards-grid">
              {pendingRequests.map((req) => (
                <div key={req._id} className="freelancer-card">
                  <div>
                    <div className="freelancer-card-top">
                      <div className="freelancer-card-icon">
                        <Wrench size={22} />
                      </div>
                      <div className="freelancer-card-meta">
                        <div className="freelancer-card-title-row">
                          <span className="freelancer-card-title">{req.serviceTitle}</span>
                          <span className="freelancer-tag-badge">₹{req.totalAmount} (Cash)</span>
                        </div>
                        <div className="freelancer-card-subtext">
                          Customer: <strong>{req.client?.name || 'Customer'}</strong> ({req.address?.phone || req.client?.phone || 'No phone'})
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(56, 189, 248, 0.15)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                      <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '0.2rem' }}>Problem / Task Description:</div>
                      <div style={{ color: '#ffffff', fontWeight: 600, marginBottom: '0.4rem' }}>"{req.problemDescription || req.notes || 'No description'}"</div>
                      <div>📅 Date: {new Date(req.scheduledDate).toLocaleDateString()} ({req.timeSlot})</div>
                      <div>📍 Address: {req.address?.houseFlat}, {req.address?.streetArea}, {req.address?.city}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.75rem' }}>
                    <button
                      onClick={() => handleUpdateStatus(req._id, 'ACCEPTED')}
                      disabled={submittingAction}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(16, 185, 129, 0.35))',
                        border: '1px solid rgba(34, 197, 94, 0.5)',
                        color: '#4ade80',
                        padding: '0.75rem',
                        borderRadius: '12px',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        boxShadow: '0 4px 15px rgba(34, 197, 94, 0.15)',
                      }}
                    >
                      <Check size={18} /> Accept Request & Claim Job ↗
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 2: ACCEPTED / ACTIVE JOBS */}
        <section id="active-jobs-sec" className="freelancer-section" style={{ paddingTop: '1.5rem' }}>
          <div className="freelancer-section-subtitle">ACTIVE JOBS</div>
          <h2 className="freelancer-section-title">Upcoming & In-Progress Jobs ({activeJobs.length})</h2>

          {activeJobs.length === 0 ? (
            <div style={{ background: 'rgba(13, 22, 44, 0.6)', border: '1px solid rgba(56, 189, 248, 0.12)', borderRadius: '16px', padding: '2rem', textAlign: 'center', color: '#94a3b8', marginTop: '1rem' }}>
              No active jobs right now. Accept a pending request to get started.
            </div>
          ) : (
            <div className="freelancer-cards-grid" style={{ marginTop: '1.25rem' }}>
              {activeJobs.map((job) => (
                <div key={job._id} className="freelancer-person-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ color: '#ffffff', fontWeight: 700, margin: 0, fontSize: '1.1rem' }}>{job.serviceTitle}</h3>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Client: {job.client?.name} ({job.address?.phone})</span>
                    </div>
                    <span style={{
                      background: job.status === 'IN_PROGRESS' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                      color: job.status === 'IN_PROGRESS' ? '#38bdf8' : '#22c55e',
                      border: `1px solid ${job.status === 'IN_PROGRESS' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                    }}>
                      {job.status}
                    </span>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                    <div>📅 {new Date(job.scheduledDate).toLocaleDateString()} ({job.timeSlot})</div>
                    <div>📍 Address: {job.address?.houseFlat}, {job.address?.streetArea}, {job.address?.city}</div>
                    <div style={{ color: '#38bdf8', fontWeight: 700, marginTop: '0.3rem' }}>Collect Cash: ₹{job.totalAmount}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {job.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleUpdateStatus(job._id, 'IN_PROGRESS')}
                        disabled={submittingAction}
                        style={{ flex: 1, background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '0.55rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                      >
                        <Play size={14} /> Start Service
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateStatus(job._id, 'COMPLETED')}
                      disabled={submittingAction}
                      style={{ flex: 1, background: 'linear-gradient(135deg, #0284c7, #2563eb)', border: 'none', color: '#ffffff', padding: '0.55rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                    >
                      <CheckCircle size={14} /> Mark Completed
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 3: THE COOPERATIVE LEDGER & COMPLETED JOBS */}
        <section id="cooperative-ledger-sec" className="freelancer-ledger-container">

          <div className="freelancer-ledger-wrapper">
            <div className="freelancer-section-subtitle">THE COOPERATIVE LEDGER</div>

            <div className="freelancer-ledger-grid">
              <div>
                <h2 className="freelancer-ledger-headline">
                  Every hour makes the circle stronger.
                </h2>
                <p className="freelancer-ledger-subtext">
                  Your time is valuable. Track your completed jobs and direct cash earnings from your community.
                </p>

                <div className="freelancer-stats-row">
                  <div className="freelancer-stat-box">
                    <div className="freelancer-stat-number">{totalHoursHelped}</div>
                    <div className="freelancer-stat-label">hours helped</div>
                  </div>
                  <div className="freelancer-stat-box">
                    <div className="freelancer-stat-number">₹{totalCreditsEarned}</div>
                    <div className="freelancer-stat-label">cash earned</div>
                  </div>
                  <div className="freelancer-stat-box">
                    <div className="freelancer-stat-number">{completedJobs.length}</div>
                    <div className="freelancer-stat-label">jobs completed</div>
                  </div>
                </div>
              </div>

              <div className="freelancer-balance-box">
                <div className="freelancer-balance-header">
                  <span className="freelancer-balance-title">Completed Work Summary</span>
                  <Coins size={22} style={{ color: '#38bdf8' }} />
                </div>

                <div className="freelancer-balance-amount-row">
                  <span className="freelancer-balance-number">₹{totalCreditsEarned}</span>
                  <span className="freelancer-balance-unit">total cash collected</span>
                </div>

                <div className="freelancer-progress-bar-bg">
                  <div className="freelancer-progress-bar-fill" style={{ width: `${Math.min(100, completedJobs.length * 20)}%` }}></div>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Keep accepting booking requests to earn more cash directly from customers after work completion.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* REJECT REASON MODAL */}
      {selectedRejectBooking && (
        <div className="modal-overlay">
          <div className="modal-box glass-panel" style={{ background: '#0b1329', borderColor: 'rgba(56, 189, 248, 0.3)', maxWidth: '420px' }}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <Ban size={18} style={{ color: '#ef4444' }} />
                <span>Decline Booking Request</span>
              </div>
              <button className="close-btn-modern" onClick={() => setSelectedRejectBooking(null)}><X size={18} /></button>
            </div>

            <div className="modal-body" style={{ paddingTop: '1.25rem' }}>
              <p className="text-muted text-sm mb-3">Please state the reason for declining <strong>"{selectedRejectBooking.serviceTitle}"</strong>:</p>

              <textarea
                rows={3}
                placeholder="e.g. Not available at requested time slot..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                style={{
                  width: '100%',
                  background: '#030712',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  color: '#ffffff',
                  outline: 'none',
                  fontSize: '0.9rem',
                  marginBottom: '1.25rem',
                }}
              />

              <button
                onClick={() => handleUpdateStatus(selectedRejectBooking._id, 'REJECTED', rejectionReason)}
                disabled={submittingAction}
                style={{ width: '100%', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                Confirm Decline Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
