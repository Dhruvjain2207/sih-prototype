'use client';
import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import {
  Wrench,
  Zap,
  Sparkles,
  Utensils,
  Hammer,
  Paintbrush,
  Wind,
  Trees,
  MapPin,
  User,
  LogOut,
  Clock,
  Calendar,
  Bell,
  CheckCircle2,
  X,
  AlertCircle,
  FileText,
  Ban,
  Search,
  Menu,
} from 'lucide-react';
import toast from 'react-hot-toast';
import './client.css';
import './dashboard.css';

interface ClientDashboardProps {
  session: any;
}

const SERVICE_CATEGORIES = [
  {
    id: 'Plumbing',
    name: 'Plumbing Repair',
    icon: Wrench,
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
    price: 45,
    desc: 'Pipe leakages, tap replacement, drain clearing, & bathroom fitting.',
  },
  {
    id: 'Electrician',
    name: 'Electrical Repair',
    icon: Zap,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    price: 50,
    desc: 'Wiring issues, short circuits, switchboard repair, & light installations.',
  },
  {
    id: 'House Cleaning',
    name: 'House Cleaning',
    icon: Sparkles,
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.12)',
    price: 60,
    desc: 'Deep home cleaning, bathroom sanitization, & sofa shampooing.',
  },
  {
    id: 'Cook / Chef',
    name: 'Cook / Chef',
    icon: Utensils,
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    price: 40,
    desc: 'Personal chef for daily home meal preparation & special dishes.',
  },
  {
    id: 'Carpentry & Woodwork',
    name: 'Carpentry & Woodwork',
    icon: Hammer,
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    price: 45,
    desc: 'Door lock fitting, custom woodwork, & furniture assembly.',
  },
  {
    id: 'Painting & Decorating',
    name: 'Painting & Decorating',
    icon: Paintbrush,
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.12)',
    price: 75,
    desc: 'Full house interior wall painting & waterproof coating.',
  },
  {
    id: 'AC & Appliance Repair',
    name: 'AC & Appliance Care',
    icon: Wind,
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.12)',
    price: 55,
    desc: 'AC gas refill, filter cleaning, & washing machine repair.',
  },
  {
    id: 'Gardening & Lawn Care',
    name: 'Gardening & Lawn Care',
    icon: Trees,
    color: '#84cc16',
    bg: 'rgba(132, 204, 22, 0.12)',
    price: 35,
    desc: 'Lawn trimming, weed removal, plant potting, & garden maintenance.',
  },
];

export default function ClientDashboard({ session }: ClientDashboardProps) {
  const [activeTab, setActiveTab] = useState<'services' | 'bookings' | 'history'>('services');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Real Database States
  const [bookings, setBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);

  // Booking Modal States
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<any>(null);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    problemDescription: '',
    fullName: session?.user?.name || '',
    phone: '',
    houseFlat: '',
    streetArea: '',
    landmark: '',
    city: 'Patna',
    state: 'Bihar',
    pincode: '800001',
    instructions: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    timeSlot: '09:00 AM - 12:00 PM',
  });

  // Polling for live notifications and booking updates
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000); // 4-second poll for real-time feel
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch User Bookings
      const bookingsRes = await fetch('/api/bookings');
      const bookingsData = await bookingsRes.json();
      if (bookingsData.success && bookingsData.bookings) {
        setBookings(bookingsData.bookings);
      }

      // 2. Fetch User Notifications
      const notifRes = await fetch('/api/notifications');
      const notifData = await notifRes.json();
      if (notifData.success) {
        setNotifications(notifData.notifications || []);
        setUnreadNotificationsCount(notifData.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  const toggleMenu = (menu: string) => setActiveMenu(activeMenu === menu ? null : menu);

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const handleOpenCategoryModal = (category: any) => {
    setSelectedCategory(category);
    setBookingForm((prev) => ({
      ...prev,
      fullName: session?.user?.name || prev.fullName,
      problemDescription: '',
    }));
  };

  const handleBookServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingForm.problemDescription.trim()) {
      toast.error('Please enter a description of the problem or service task.');
      return;
    }

    if (!bookingForm.fullName || !bookingForm.phone || !bookingForm.houseFlat || !bookingForm.streetArea || !bookingForm.city || !bookingForm.pincode) {
      toast.error('Please complete all required address fields.');
      return;
    }

    setSubmittingBooking(true);
    const toastId = toast.loading(`Checking available ${selectedCategory.name} experts...`);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory.id,
          serviceTitle: selectedCategory.name,
          problemDescription: bookingForm.problemDescription,
          totalAmount: selectedCategory.price,
          scheduledDate: bookingForm.scheduledDate,
          timeSlot: bookingForm.timeSlot,
          address: {
            fullName: bookingForm.fullName,
            phone: bookingForm.phone,
            houseFlat: bookingForm.houseFlat,
            streetArea: bookingForm.streetArea,
            landmark: bookingForm.landmark,
            city: bookingForm.city,
            state: bookingForm.state,
            pincode: bookingForm.pincode,
            instructions: bookingForm.instructions,
          },
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || `Booking request sent to available ${selectedCategory.name} expert!`, { id: toastId, duration: 4500 });
        setSelectedCategory(null);
        fetchData();
        setActiveTab('bookings');
      } else {
        toast.error(data.error || `No ${selectedCategory.name} available right now.`, { id: toastId, duration: 5000 });
      }
    } catch {
      toast.error('Network error requesting booking', { id: toastId });
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const toastId = toast.loading('Cancelling booking...');
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Booking cancelled.', { id: toastId });
        fetchData();
        if (selectedBookingDetail?._id === bookingId) {
          setSelectedBookingDetail(null);
        }
      } else {
        toast.error(data.error || 'Failed to cancel booking', { id: toastId });
      }
    } catch {
      toast.error('Network error cancelling booking', { id: toastId });
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
    : 'US';

  const activeBookings = bookings.filter((b) => b.status === 'PENDING' || b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS');
  const pastBookings = bookings.filter((b) => b.status === 'COMPLETED' || b.status === 'REJECTED' || b.status === 'CANCELLED');

  const filteredCategories = SERVICE_CATEGORIES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="client-dashboard">
      {/* NAVBAR */}
      <nav className="navbar glass-panel">
        <div className="nav-left">
          <div className="brand">
            <div className="brand-logo">⚡</div>
            <span>CoopConnect</span>
          </div>
          <div className="nav-divider"></div>
          <button className="nav-item location-btn">
            <MapPin size={18} className="text-gradient" />
            <span>Patna, Bihar</span>
          </button>
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
              <div className="dropdown-menu history-menu glass-panel" style={{ width: '350px' }}>
                <div className="menu-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Notifications</span>
                  <button onClick={handleMarkNotificationsRead} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.75rem', cursor: 'pointer' }}>Mark all read</button>
                </div>

                <div className="favorites-list" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                      No notifications yet. Updates will appear here.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n._id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: n.isRead ? 'transparent' : 'rgba(56, 189, 248, 0.08)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: n.type === 'BOOKING_ACCEPTED' ? '#22c55e' : n.type === 'BOOKING_REJECTED' ? '#ef4444' : '#ffffff' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.15rem' }}>{n.message}</div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.3rem' }}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
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
                <div className="dropdown-menu profile-menu glass-panel">
                  <div className="profile-header">
                    <div className="avatar-gradient">{userInitials}</div>
                    <div className="profile-titles">
                      <span className="profile-name">{session?.user?.name || 'User'}</span>
                      <span className="text-muted text-xs">{session?.user?.email || 'No email'}</span>
                    </div>
                  </div>
                  <div className="menu-divider"></div>
                  <div className="profile-details">
                    <div className="detail-row">
                      <span>Account Role:</span>
                      <span className="text-gradient font-semibold capitalize">Customer / Client</span>
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
                <div className="brand-logo" style={{ width: '28px', height: '28px', fontSize: '1rem' }}>⚡</div>
                <span>CoopConnect</span>
              </div>
              <button className="close-btn-modern" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="mobile-drawer-body">
              {/* User Profile Summary */}
              <div className="mobile-drawer-user-card">
                <div className="mobile-drawer-avatar">{userInitials}</div>
                <div className="mobile-drawer-user-info">
                  <div className="mobile-drawer-user-name">{session?.user?.name || 'Customer'}</div>
                  <div className="mobile-drawer-user-email">{session?.user?.email || 'Client Account'}</div>
                </div>
              </div>

              {/* Location Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.65rem 0.85rem', borderRadius: '10px', fontSize: '0.85rem', color: '#94a3b8' }}>
                <MapPin size={16} className="text-gradient" />
                <span>Location: <strong style={{ color: '#ffffff' }}>Patna, Bihar</strong></span>
              </div>

              {/* Navigation Options */}
              <div>
                <div className="mobile-drawer-section-title">Navigation Options</div>
                <div className="mobile-drawer-nav">
                  <button
                    className={`mobile-drawer-item ${activeTab === 'services' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('services'); setIsMobileMenuOpen(false); }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Wrench size={16} /> Select & Book Service
                    </span>
                    <span>↗</span>
                  </button>

                  <button
                    className={`mobile-drawer-item ${activeTab === 'bookings' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('bookings'); setIsMobileMenuOpen(false); }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Calendar size={16} /> Active Bookings
                    </span>
                    {activeBookings.length > 0 && (
                      <span style={{ background: '#38bdf8', color: '#090d16', fontSize: '0.7rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: '10px' }}>
                        {activeBookings.length}
                      </span>
                    )}
                  </button>

                  <button
                    className={`mobile-drawer-item ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('history'); setIsMobileMenuOpen(false); }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Clock size={16} /> Past History
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({pastBookings.length})</span>
                  </button>
                </div>
              </div>

              {/* Notifications Link */}
              <div>
                <div className="mobile-drawer-section-title">Quick Actions</div>
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
                      {unreadNotificationsCount} new
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

      {/* MAIN CONTAINER */}
      <div className="client-container">
        {/* HERO BANNER */}
        <div className="client-hero">
          <div>
            <h1 className="client-welcome-title">
              Hello, <span className="text-gradient">{session?.user?.name || 'Customer'}</span>! 👋
            </h1>
            <p className="client-welcome-text">Select a service, describe your problem, and connect with local experts in real time.</p>
          </div>

          <div className="client-search-box">
            <Search size={18} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              className="client-search-input"
              placeholder="Search for plumbing, electrician, cleaning..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="client-tabs-container">
          <button
            onClick={() => setActiveTab('services')}
            className={`client-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          >
            <Wrench size={16} /> Select & Book Service
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`client-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          >
            <Calendar size={16} /> Active Bookings
            {activeBookings.length > 0 && (
              <span style={{ background: activeTab === 'bookings' ? '#ffffff' : '#38bdf8', color: activeTab === 'bookings' ? '#6366f1' : '#090d16', fontSize: '0.7rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: '10px' }}>
                {activeBookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`client-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          >
            <Clock size={16} /> Past History ({pastBookings.length})
          </button>
        </div>


        {/* TAB 1: SERVICE CATEGORIES SELECTION */}
        {activeTab === 'services' && (
          <section className="client-services-section">
            <div className="client-section-title-row">
              <div>
                <h2 className="client-section-h2">Available Service Categories</h2>
                <p className="client-section-sub">Choose a category to describe your problem and request an expert.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {filteredCategories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleOpenCategoryModal(cat)}
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                    className="client-service-card"
                  >
                    <div>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: cat.bg, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <IconComponent size={24} />
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>{cat.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4, margin: 0 }}>{cat.desc}</p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>₹{cat.price} <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>(Cash)</span></span>
                      <button style={{ background: '#6366f1', color: '#ffffff', border: 'none', padding: '0.45rem 0.9rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                        Book Now ↗
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 2: ACTIVE & UPCOMING BOOKINGS */}
        {activeTab === 'bookings' && (
          <section className="client-services-section">
            <h2 className="client-section-h2" style={{ marginBottom: '1.25rem' }}>Active & Upcoming Requests</h2>

            {activeBookings.length === 0 ? (
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '3rem', textAlign: 'center' }}>
                <Calendar size={48} style={{ color: '#64748b', margin: '0 auto 1rem' }} />
                <h3 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '0.5rem' }}>No Active Requests</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>You don't have any pending or accepted bookings.</p>
                <button onClick={() => setActiveTab('services')} className="btn-gradient-full" style={{ width: 'auto', padding: '0.75rem 2rem' }}>
                  Select & Book a Service ↗
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                {activeBookings.map((b) => (
                  <div key={b._id} style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>{b.serviceTitle}</h3>
                          <span style={{
                            background: b.status === 'ACCEPTED' ? 'rgba(34, 197, 94, 0.15)' : b.status === 'IN_PROGRESS' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: b.status === 'ACCEPTED' ? '#22c55e' : b.status === 'IN_PROGRESS' ? '#38bdf8' : '#f59e0b',
                            border: `1px solid ${b.status === 'ACCEPTED' ? 'rgba(34, 197, 94, 0.3)' : b.status === 'IN_PROGRESS' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                          }}>
                            {b.status === 'PENDING' ? '⏳ PENDING (Awaiting Freelancer Accept)' : b.status === 'ACCEPTED' ? '✓ ACCEPTED BY FREELANCER' : '🛠️ IN PROGRESS'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                          Assigned Freelancer: <strong style={{ color: '#ffffff' }}>{b.provider?.name || 'Assigned Expert'}</strong> ({b.provider?.phone || 'Contact via message'})
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>₹{b.totalAmount}</div>
                        <div style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>💵 Cash Payment After Work</div>
                      </div>
                    </div>

                    {/* Problem Description Box */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.85rem', margin: '0.85rem 0', fontSize: '0.85rem' }}>
                      <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '0.2rem' }}>Problem Description:</div>
                      <div style={{ color: '#cbd5e1' }}>"{b.problemDescription || b.notes || 'No description provided'}"</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        📅 Date: {new Date(b.scheduledDate).toLocaleDateString()} ({b.timeSlot}) · 📍 {b.address?.houseFlat}, {b.address?.streetArea}, {b.address?.city}
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={() => setSelectedBookingDetail(b)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                          View Details
                        </button>
                        {(b.status === 'PENDING' || b.status === 'ACCEPTED') && (
                          <button onClick={() => handleCancelBooking(b._id)} style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                            Cancel Request
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: PAST HISTORY */}
        {activeTab === 'history' && (
          <section className="client-services-section">
            <h2 className="client-section-h2" style={{ marginBottom: '1.25rem' }}>Past Booking History</h2>

            {pastBookings.length === 0 ? (
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '3rem', textAlign: 'center' }}>
                <Clock size={48} style={{ color: '#64748b', margin: '0 auto 1rem' }} />
                <h3 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '0.5rem' }}>No Past History</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Completed, declined, or cancelled requests will appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {pastBookings.map((b) => (
                  <div key={b._id} style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '1rem' }}>{b.serviceTitle}</div>
                      <span style={{
                        background: b.status === 'COMPLETED' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: b.status === 'COMPLETED' ? '#22c55e' : '#ef4444',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                      }}>
                        {b.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      Provider: {b.provider?.name || 'Assigned Expert'} · Date: {new Date(b.scheduledDate).toLocaleDateString()}
                    </div>

                    {b.problemDescription && (
                      <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.4rem', fontStyle: 'italic' }}>
                        Problem: "{b.problemDescription}"
                      </div>
                    )}

                    {b.status === 'REJECTED' && b.rejectionReason && (
                      <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.4rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.4rem 0.75rem', borderRadius: '6px' }}>
                        <strong>Declined Reason:</strong> {b.rejectionReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* BOOKING MODAL (PREMIUM & RESPONSIVE DESIGN) */}
      {selectedCategory && (
        <div className="modal-overlay">
          <div className="modal-box-modern">
            <div className="modal-header-modern">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  {selectedCategory.icon ? <selectedCategory.icon size={20} /> : <Wrench size={20} />}
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-lg leading-tight">Book {selectedCategory.name}</h3>
                  <span className="text-xs text-slate-400">Direct booking with verified experts</span>
                </div>
              </div>
              <button className="close-btn-modern" onClick={() => setSelectedCategory(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBookServiceSubmit} className="modal-body-modern">
              {/* Fee Snapshot Pill */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 mb-5">
                <div>
                  <span className="text-xs text-slate-400">Estimated Fee</span>
                  <div className="text-xl font-black text-sky-400">₹{selectedCategory.price}</div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                  💵 Cash Payment After Work
                </span>
              </div>

              {/* STEP 1: Problem Description */}
              <div className="modal-form-step-card">
                <div className="modal-step-title">
                  <span>1. Task / Problem Description *</span>
                </div>
                <textarea
                  rows={3}
                  placeholder={`Describe your ${selectedCategory.name} issue (e.g., Water leaking under sink, switchboard repair, deep cleaning required)...`}
                  value={bookingForm.problemDescription}
                  onChange={(e) => setBookingForm({ ...bookingForm, problemDescription: e.target.value })}
                  required
                  className="modal-input"
                  style={{ resize: 'none' }}
                />
              </div>

              {/* STEP 2: Customer Info */}
              <div className="modal-form-step-card">
                <div className="modal-step-title">
                  <span>2. Customer Details</span>
                </div>
                <div className="modal-form-grid-2">
                  <div>
                    <label className="modal-label">Full Name *</label>
                    <input
                      type="text"
                      className="modal-input"
                      value={bookingForm.fullName}
                      onChange={(e) => setBookingForm({ ...bookingForm, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="modal-label">Phone Number *</label>
                    <input
                      type="tel"
                      className="modal-input"
                      placeholder="+91 98765 43210"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* STEP 3: Address */}
              <div className="modal-form-step-card">
                <div className="modal-step-title">
                  <span>3. Service Location</span>
                </div>
                <div className="modal-form-grid-2">
                  <div>
                    <label className="modal-label">Flat / House No. *</label>
                    <input
                      type="text"
                      className="modal-input"
                      placeholder="e.g. Flat 302, Royal Apt"
                      value={bookingForm.houseFlat}
                      onChange={(e) => setBookingForm({ ...bookingForm, houseFlat: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="modal-label">Street / Landmark *</label>
                    <input
                      type="text"
                      className="modal-input"
                      placeholder="e.g. Fraser Road"
                      value={bookingForm.streetArea}
                      onChange={(e) => setBookingForm({ ...bookingForm, streetArea: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="modal-form-grid-3">
                  <div>
                    <label className="modal-label">City *</label>
                    <input
                      type="text"
                      className="modal-input"
                      value={bookingForm.city}
                      onChange={(e) => setBookingForm({ ...bookingForm, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="modal-label">State *</label>
                    <input
                      type="text"
                      className="modal-input"
                      value={bookingForm.state}
                      onChange={(e) => setBookingForm({ ...bookingForm, state: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="modal-label">Pincode *</label>
                    <input
                      type="text"
                      className="modal-input"
                      value={bookingForm.pincode}
                      onChange={(e) => setBookingForm({ ...bookingForm, pincode: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* STEP 4: Schedule */}
              <div className="modal-form-step-card">
                <div className="modal-step-title">
                  <span>4. Preferred Date & Time</span>
                </div>
                <div className="modal-form-grid-2">
                  <div>
                    <label className="modal-label">Date *</label>
                    <input
                      type="date"
                      className="modal-input"
                      value={bookingForm.scheduledDate}
                      onChange={(e) => setBookingForm({ ...bookingForm, scheduledDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="modal-label">Time Slot *</label>
                    <select
                      className="modal-select"
                      value={bookingForm.timeSlot}
                      onChange={(e) => setBookingForm({ ...bookingForm, timeSlot: e.target.value })}
                    >
                      <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM</option>
                      <option value="12:00 PM - 03:00 PM">12:00 PM - 03:00 PM</option>
                      <option value="03:00 PM - 06:00 PM">03:00 PM - 06:00 PM</option>
                      <option value="06:00 PM - 09:00 PM">06:00 PM - 09:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                className="btn-gradient-full mt-2"
                type="submit"
                disabled={submittingBooking}
                style={{ padding: '0.95rem', borderRadius: '14px', fontSize: '0.95rem', fontWeight: 800 }}
              >
                {submittingBooking ? 'Finding Available Expert & Requesting...' : `Request ${selectedCategory.name} Expert ↗`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BOOKING DETAILS VIEW MODAL (MODERN DESIGN) */}
      {selectedBookingDetail && (
        <div className="modal-overlay">
          <div className="modal-box-modern" style={{ maxWidth: '480px' }}>
            <div className="modal-header-modern">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-sky-400" />
                <span className="font-extrabold text-white text-base">Booking #{selectedBookingDetail._id.slice(-6).toUpperCase()}</span>
              </div>
              <button className="close-btn-modern" onClick={() => setSelectedBookingDetail(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-modern">
              {/* Header Info */}
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 mb-4">
                <span className="text-xs text-slate-400">Service Category</span>
                <h3 className="text-lg font-bold text-white mb-1">{selectedBookingDetail.serviceTitle}</h3>
                <span className="text-sky-400 font-extrabold text-base">₹{selectedBookingDetail.totalAmount} <span className="text-xs text-emerald-400 font-semibold">(Cash After Work)</span></span>
              </div>

              {/* Problem Description */}
              <div className="modal-form-step-card mb-3">
                <span className="modal-label text-sky-400">Problem Description</span>
                <p className="text-sm text-slate-200 mt-1">"{selectedBookingDetail.problemDescription || selectedBookingDetail.notes || 'No notes'}"</p>
              </div>

              {/* Status & Provider */}
              <div className="modal-form-step-card mb-3 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-sky-400">{selectedBookingDetail.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Provider:</span>
                  <span className="font-bold text-white">{selectedBookingDetail.provider?.name || 'Assigned Expert'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Scheduled Date:</span>
                  <span className="text-slate-200">{new Date(selectedBookingDetail.scheduledDate).toLocaleDateString()} ({selectedBookingDetail.timeSlot})</span>
                </div>
                {selectedBookingDetail.rejectionReason && (
                  <div className="pt-2 text-red-400 border-t border-slate-800">
                    <strong>Decline Reason:</strong> {selectedBookingDetail.rejectionReason}
                  </div>
                )}
              </div>

              {/* Address Snapshot */}
              <div className="modal-form-step-card mb-4 text-xs space-y-1">
                <span className="modal-label text-white font-bold mb-1">Service Address</span>
                <div className="text-slate-300 font-semibold">{selectedBookingDetail.address?.fullName} ({selectedBookingDetail.address?.phone})</div>
                <div className="text-slate-400">{selectedBookingDetail.address?.houseFlat}, {selectedBookingDetail.address?.streetArea}</div>
                <div className="text-slate-400">{selectedBookingDetail.address?.city}, {selectedBookingDetail.address?.state} - {selectedBookingDetail.address?.pincode}</div>
              </div>

              {(selectedBookingDetail.status === 'PENDING' || selectedBookingDetail.status === 'ACCEPTED') && (
                <button
                  onClick={() => handleCancelBooking(selectedBookingDetail._id)}
                  className="w-full py-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400 font-bold text-sm hover:bg-red-900/60 transition-colors"
                >
                  Cancel Booking Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
