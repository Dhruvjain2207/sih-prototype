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
  Star,
  CreditCard,
  MessageSquare,
  Send,
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

  // Review Modal States
  const [selectedReviewBooking, setSelectedReviewBooking] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  // Chat Window States
  const [activeChatBooking, setActiveChatBooking] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInputText, setChatInputText] = useState<string>('');
  const [sendingChatMessage, setSendingChatMessage] = useState<boolean>(false);
  const [chatIsClosed, setChatIsClosed] = useState<boolean>(false);

  const fetchChatMessages = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/messages`);
      const data = await res.json();
      if (res.ok && data.success) {
        setChatMessages(data.messages || []);
        setChatIsClosed(data.isClosed);
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  useEffect(() => {
    if (!activeChatBooking) return;
    fetchChatMessages(activeChatBooking._id);
    const interval = setInterval(() => {
      fetchChatMessages(activeChatBooking._id);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeChatBooking]);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatBooking || !chatInputText.trim()) return;

    setSendingChatMessage(true);
    const textToSend = chatInputText.trim();
    setChatInputText('');

    try {
      const res = await fetch(`/api/bookings/${activeChatBooking._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSend }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchChatMessages(activeChatBooking._id);
      } else {
        toast.error(data.error || 'Failed to send message');
        setChatInputText(textToSend);
      }
    } catch {
      toast.error('Network error sending message');
      setChatInputText(textToSend);
    } finally {
      setSendingChatMessage(false);
    }
  };

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

  const handleAcceptCashPayment = async (bookingId: string) => {
    const toastId = toast.loading('Confirming quote with Cash Payment After Work...');
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED', paymentMethod: 'CASH_AFTER_WORK' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Quote Accepted! Booking confirmed for Cash Payment after work 🎉', { id: toastId, duration: 4000 });
        fetchData();
      } else {
        toast.error(data.error || 'Failed to confirm booking', { id: toastId });
      }
    } catch {
      toast.error('Network error confirming booking', { id: toastId });
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewBooking) return;
    setSubmittingReview(true);
    const toastId = toast.loading('Submitting review & rating...');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedReviewBooking._id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Review & rating posted successfully!', { id: toastId });
        setSelectedReviewBooking(null);
        setReviewRating(5);
        setReviewComment('');
        fetchData();
      } else {
        toast.error(data.error || 'Failed to submit review', { id: toastId });
      }
    } catch {
      toast.error('Network error submitting review', { id: toastId });
    } finally {
      setSubmittingReview(false);
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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (booking: any) => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      toast.error('Razorpay SDK failed to load. Please check your network connection.');
      return;
    }

    const toastId = toast.loading('Initializing Razorpay Test mode payment...');

    try {
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking._id }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        toast.error(orderData.error || 'Failed to create payment order', { id: toastId });
        return;
      }

      toast.dismiss(toastId);

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'CoopConnect Services',
        description: `Payment for ${booking.serviceTitle}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          const verifyToastId = toast.loading('Verifying Razorpay payment signature...');
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookingId: booking._id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              toast.success('Payment Successful! Booking Confirmed 🎉', { id: verifyToastId, duration: 5000 });
              fetchData();
            } else {
              toast.error(verifyData.error || 'Payment verification failed', { id: verifyToastId });
            }
          } catch {
            toast.error('Network error during payment verification', { id: verifyToastId });
          }
        },
        prefill: {
          name: session?.user?.name || booking.address?.fullName || '',
          email: session?.user?.email || '',
          contact: booking.address?.phone || '',
        },
        theme: {
          color: '#6366f1',
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', function (response: any) {
        toast.error(`Payment failed: ${response.error?.description || 'Transaction cancelled'}`);
      });
      paymentObject.open();
    } catch (err: any) {
      toast.error(err.message || 'Error starting Razorpay checkout', { id: toastId });
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

  const activeBookings = bookings.filter((b) => b.status === 'PENDING' || b.status === 'ACCEPTED' || b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS');
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
                      No notifications yet. Updates will appear here.
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
                          background: n.type === 'BOOKING_ACCEPTED' ? 'rgba(34, 197, 94, 0.15)' : n.type === 'BOOKING_REJECTED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                          color: n.type === 'BOOKING_ACCEPTED' ? '#22c55e' : n.type === 'BOOKING_REJECTED' ? '#ef4444' : '#38bdf8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {n.type === 'BOOKING_ACCEPTED' ? <CheckCircle2 size={16} /> : n.type === 'BOOKING_REJECTED' ? <Ban size={16} /> : <AlertCircle size={16} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: n.type === 'BOOKING_ACCEPTED' ? '#22c55e' : n.type === 'BOOKING_REJECTED' ? '#ef4444' : '#ffffff' }}>
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
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>⚡ Custom Quote by Expert</span>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>{b.serviceTitle}</h3>
                          <span style={{
                            background: b.status === 'CONFIRMED' || b.paymentStatus === 'PAID' ? 'rgba(34, 197, 94, 0.15)' : b.status === 'ACCEPTED' ? 'rgba(245, 158, 11, 0.15)' : b.status === 'IN_PROGRESS' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                            color: b.status === 'CONFIRMED' || b.paymentStatus === 'PAID' ? '#22c55e' : b.status === 'ACCEPTED' ? '#f59e0b' : b.status === 'IN_PROGRESS' ? '#38bdf8' : '#94a3b8',
                            border: `1px solid ${b.status === 'CONFIRMED' || b.paymentStatus === 'PAID' ? 'rgba(34, 197, 94, 0.3)' : b.status === 'ACCEPTED' ? 'rgba(245, 158, 11, 0.3)' : b.status === 'IN_PROGRESS' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(148, 163, 184, 0.3)'}`,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                          }}>
                            {b.status === 'PENDING'
                              ? '⏳ PENDING (Awaiting Freelancer Quote)'
                              : b.status === 'ACCEPTED'
                              ? `⚡ QUOTE RECEIVED: ₹${b.totalAmount} (Awaiting Your Choice)`
                              : b.status === 'CONFIRMED' || b.paymentStatus === 'PAID'
                              ? `🎉 BOOKING CONFIRMED (${b.paymentStatus === 'PAID' ? 'PAID ONLINE' : 'CASH AFTER WORK'})`
                              : '🛠️ IN PROGRESS'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                          Assigned Freelancer: <strong style={{ color: '#ffffff' }}>{b.provider?.name || 'Assigned Expert'}</strong> ({b.provider?.phone || 'Contact via message'})
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        {b.status === 'PENDING' ? (
                          <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 }}>Custom Quote Pending</div>
                        ) : (
                          <>
                            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#38bdf8' }}>₹{b.totalAmount}</div>
                            <div style={{ fontSize: '0.75rem', color: b.paymentStatus === 'PAID' ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>
                              {b.paymentStatus === 'PAID' ? '✅ Paid via Razorpay' : b.status === 'CONFIRMED' ? '💵 Cash After Work' : 'Quoted Price by Expert'}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Problem Description Box */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.85rem', margin: '0.85rem 0', fontSize: '0.85rem' }}>
                      <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '0.2rem' }}>Problem Description:</div>
                      <div style={{ color: '#cbd5e1' }}>"{b.problemDescription || b.notes || 'No description provided'}"</div>
                      {b.razorpayPaymentId && (
                        <div style={{ color: '#22c55e', fontSize: '0.75rem', marginTop: '0.35rem', fontWeight: 600 }}>
                          Payment ID: {b.razorpayPaymentId}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        📅 Date: {new Date(b.scheduledDate).toLocaleDateString()} ({b.timeSlot}) · 📍 {b.address?.houseFlat}, {b.address?.streetArea}, {b.address?.city}
                      </div>

                      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* CUSTOMER DECISION BUTTONS FOR QUOTED JOB */}
                        {b.status === 'ACCEPTED' && (
                          <>
                            <button
                              onClick={() => handleRazorpayPayment(b)}
                              style={{
                                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                border: 'none',
                                color: '#ffffff',
                                padding: '0.55rem 0.95rem',
                                borderRadius: '10px',
                                fontSize: '0.82rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                              }}
                            >
                              <CreditCard size={15} /> Accept & Pay ₹{b.totalAmount} (Online)
                            </button>

                            <button
                              onClick={() => handleAcceptCashPayment(b._id)}
                              style={{
                                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.3))',
                                border: '1px solid rgba(34, 197, 94, 0.5)',
                                color: '#4ade80',
                                padding: '0.55rem 0.95rem',
                                borderRadius: '10px',
                                fontSize: '0.82rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                              }}
                            >
                              💵 Accept & Pay Cash
                            </button>

                            <button
                              onClick={() => handleCancelBooking(b._id)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.12)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#ef4444',
                                padding: '0.55rem 0.85rem',
                                borderRadius: '10px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              ❌ Decline Quote
                            </button>
                          </>
                        )}

                        {(b.status === 'ACCEPTED' || b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS') && (
                          <button
                            onClick={() => setActiveChatBooking(b)}
                            style={{
                              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(37, 99, 235, 0.3))',
                              border: '1px solid rgba(56, 189, 248, 0.5)',
                              color: '#38bdf8',
                              padding: '0.45rem 0.85rem',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                            }}
                          >
                            <MessageSquare size={14} /> Chat with Expert
                          </button>
                        )}

                        <button onClick={() => setSelectedBookingDetail(b)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                          View Details
                        </button>

                        {b.status === 'PENDING' && (
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

                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.2rem' }}>
                      <span>Provider: {b.provider?.name || 'Assigned Expert'} · Date: {new Date(b.scheduledDate).toLocaleDateString()}</span>
                      <span style={{ color: b.paymentStatus === 'PAID' || b.paymentMethod === 'RAZORPAY' ? '#38bdf8' : '#22c55e', fontWeight: 700 }}>
                        ₹{b.totalAmount} {b.paymentStatus === 'PAID' || b.paymentMethod === 'RAZORPAY' ? '(Paid via Razorpay)' : '(Cash)'}
                      </span>
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

                    {b.status === 'COMPLETED' && (
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {b.clientReview ? (
                          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '10px', padding: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                              <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 700 }}>Your Review for {b.provider?.name || 'Freelancer'}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', fontWeight: 800, fontSize: '0.85rem' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} size={14} fill={star <= b.clientReview.rating ? '#fbbf24' : 'none'} color={star <= b.clientReview.rating ? '#fbbf24' : '#64748b'} />
                                ))}
                                <span style={{ marginLeft: '0.25rem' }}>{b.clientReview.rating}/5</span>
                              </div>
                            </div>
                            {b.clientReview.comment ? (
                              <div style={{ fontSize: '0.8rem', color: '#e2e8f0', fontStyle: 'italic' }}>"{b.clientReview.comment}"</div>
                            ) : (
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No text comment provided.</div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedReviewBooking(b);
                              setReviewRating(5);
                              setReviewComment('');
                            }}
                            style={{
                              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.3))',
                              border: '1px solid rgba(245, 158, 11, 0.5)',
                              color: '#fbbf24',
                              padding: '0.5rem 0.9rem',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                            }}
                          >
                            <Star size={14} fill="#fbbf24" color="#fbbf24" /> Rate & Review Freelancer
                          </button>
                        )}

                        {b.providerReview && (
                          <div style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '10px', padding: '0.75rem', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                              <span style={{ fontSize: '0.78rem', color: '#4ade80', fontWeight: 700 }}>Freelancer's Rating for You</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', fontWeight: 800, fontSize: '0.85rem' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} size={14} fill={star <= b.providerReview.rating ? '#fbbf24' : 'none'} color={star <= b.providerReview.rating ? '#fbbf24' : '#64748b'} />
                                ))}
                                <span style={{ marginLeft: '0.25rem' }}>{b.providerReview.rating}/5</span>
                              </div>
                            </div>
                            {b.providerReview.comment && (
                              <div style={{ fontSize: '0.8rem', color: '#e2e8f0', fontStyle: 'italic' }}>"{b.providerReview.comment}"</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* BOOKING MODAL (REFINED & MODERN DESIGN) */}
      {selectedCategory && (
        <div className="modal-overlay">
          <div className="modal-box-modern" style={{ maxWidth: '600px', width: '92%', borderRadius: '20px', background: '#0b1329', border: '1px solid rgba(99, 102, 241, 0.25)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: selectedCategory.bg || 'rgba(99, 102, 241, 0.15)', color: selectedCategory.color || '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedCategory.icon ? <selectedCategory.icon size={22} style={{ margin: 'auto' }} /> : <Wrench size={22} style={{ margin: 'auto' }} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>Book {selectedCategory.name}</h3>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Connect with verified local experts</span>
                </div>
              </div>
              <button className="close-btn-modern" onClick={() => setSelectedCategory(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBookServiceSubmit} style={{ padding: '1.5rem', maxHeight: '82vh', overflowY: 'auto' }}>
              {/* PRICE & WORKFLOW BANNER */}
              <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(56, 189, 248, 0.1))', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Pricing Mode</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>⚡ Custom Quote by Expert</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', padding: '0.25rem 0.65rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    1. Submit Request $\rightarrow$ 2. Expert Quotes Price $\rightarrow$ 3. Accept & Pay
                  </span>
                </div>
              </div>

              {/* STEP 1: Problem Description */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1.1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={16} className="text-sky-400" />
                  <span>1. Describe the Problem or Required Work *</span>
                </div>
                <textarea
                  rows={3}
                  placeholder={`Describe your ${selectedCategory.name} requirements (e.g., Leaking pipe under kitchen sink, main switchboard trip repair, full house deep cleaning)...`}
                  value={bookingForm.problemDescription}
                  onChange={(e) => setBookingForm({ ...bookingForm, problemDescription: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    background: '#030712',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    borderRadius: '10px',
                    padding: '0.75rem',
                    color: '#ffffff',
                    outline: 'none',
                    fontSize: '0.88rem',
                    resize: 'none',
                  }}
                />
              </div>

              {/* STEP 2: Customer Contact Info */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1.1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={16} className="text-sky-400" />
                  <span>2. Customer Contact Details</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Full Name *</label>
                    <input
                      type="text"
                      value={bookingForm.fullName}
                      onChange={(e) => setBookingForm({ ...bookingForm, fullName: e.target.value })}
                      required
                      style={{ width: '100%', background: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.6rem 0.85rem', color: '#ffffff', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      required
                      style={{ width: '100%', background: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.6rem 0.85rem', color: '#ffffff', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* STEP 3: Service Address */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1.1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={16} className="text-sky-400" />
                  <span>3. Service Address / Location</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Flat / House / Apt No. *</label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 402, Sunshine Towers"
                      value={bookingForm.houseFlat}
                      onChange={(e) => setBookingForm({ ...bookingForm, houseFlat: e.target.value })}
                      required
                      style={{ width: '100%', background: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.6rem 0.85rem', color: '#ffffff', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Street / Landmark *</label>
                    <input
                      type="text"
                      placeholder="e.g. Near Boring Road Crossing"
                      value={bookingForm.streetArea}
                      onChange={(e) => setBookingForm({ ...bookingForm, streetArea: e.target.value })}
                      required
                      style={{ width: '100%', background: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.6rem 0.85rem', color: '#ffffff', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>City *</label>
                    <input
                      type="text"
                      value={bookingForm.city}
                      onChange={(e) => setBookingForm({ ...bookingForm, city: e.target.value })}
                      required
                      style={{ width: '100%', background: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.55rem 0.75rem', color: '#ffffff', fontSize: '0.82rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>State *</label>
                    <input
                      type="text"
                      value={bookingForm.state}
                      onChange={(e) => setBookingForm({ ...bookingForm, state: e.target.value })}
                      required
                      style={{ width: '100%', background: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.55rem 0.75rem', color: '#ffffff', fontSize: '0.82rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Pincode *</label>
                    <input
                      type="text"
                      value={bookingForm.pincode}
                      onChange={(e) => setBookingForm({ ...bookingForm, pincode: e.target.value })}
                      required
                      style={{ width: '100%', background: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.55rem 0.75rem', color: '#ffffff', fontSize: '0.82rem', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* STEP 4: Preferred Date & Time */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1.1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={16} className="text-sky-400" />
                  <span>4. Preferred Date & Time Slot</span>
                </div>
                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Date *</label>
                  <input
                    type="date"
                    value={bookingForm.scheduledDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, scheduledDate: e.target.value })}
                    required
                    style={{ width: '100%', background: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.6rem 0.85rem', color: '#ffffff', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Time Slot *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                    {[
                      '09:00 AM - 12:00 PM',
                      '12:00 PM - 03:00 PM',
                      '03:00 PM - 06:00 PM',
                      '06:00 PM - 09:00 PM',
                    ].map((slot) => {
                      const isSelected = bookingForm.timeSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setBookingForm({ ...bookingForm, timeSlot: slot })}
                          style={{
                            background: isSelected
                              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(56, 189, 248, 0.35))'
                              : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${isSelected ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
                            color: isSelected ? '#ffffff' : '#cbd5e1',
                            padding: '0.55rem 0.4rem',
                            borderRadius: '10px',
                            fontSize: '0.75rem',
                            fontWeight: isSelected ? 800 : 500,
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submittingBooking}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.95rem',
                  borderRadius: '14px',
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                  opacity: submittingBooking ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {submittingBooking ? 'Sending Request to Local Experts...' : `Request ${selectedCategory.name} Expert (Quote Pending) ↗`}
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

      {/* RATE & REVIEW FREELANCER MODAL */}
      {selectedReviewBooking && (
        <div className="modal-overlay">
          <div className="modal-box-modern" style={{ maxWidth: '440px' }}>
            <div className="modal-header-modern">
              <div className="flex items-center gap-2">
                <Star size={20} className="text-amber-400" fill="#fbbf24" />
                <span className="font-extrabold text-white text-base">Rate & Review Service</span>
              </div>
              <button className="close-btn-modern" onClick={() => setSelectedReviewBooking(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="modal-body-modern">
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 mb-4 text-xs">
                <div className="text-slate-300 font-semibold">Service: <strong className="text-white">{selectedReviewBooking.serviceTitle}</strong></div>
                <div className="text-slate-400 mt-0.5">Freelancer: <strong className="text-amber-300">{selectedReviewBooking.provider?.name || 'Assigned Expert'}</strong></div>
              </div>

              {/* STAR RATING SELECTION */}
              <div className="modal-form-step-card mb-4 text-center">
                <label className="modal-label mb-2 block text-slate-300 text-sm font-semibold">Select Your Rating</label>
                <div className="flex items-center justify-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1.5 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        size={32}
                        fill={star <= reviewRating ? '#fbbf24' : 'none'}
                        color={star <= reviewRating ? '#fbbf24' : '#475569'}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-xs font-bold text-amber-400 mt-1">
                  {reviewRating === 5 && '⭐⭐⭐⭐⭐ Exceptional Service!'}
                  {reviewRating === 4 && '⭐⭐⭐⭐ Very Good Work'}
                  {reviewRating === 3 && '⭐⭐⭐ Satisfactory Service'}
                  {reviewRating === 2 && '⭐⭐ Below Expectations'}
                  {reviewRating === 1 && '⭐ Poor Experience'}
                </div>
              </div>

              {/* COMMENT TEXTAREA */}
              <div className="modal-form-step-card mb-4">
                <label className="modal-label text-slate-300 font-semibold mb-1 block">Your Detailed Feedback (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Share your experience working with this freelancer (e.g., Punctual, polite, high quality work)..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="modal-input"
                  style={{ resize: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-3.5 rounded-xl font-extrabold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                {submittingReview ? 'Submitting Review...' : 'Submit Rating & Review ↗'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CHAT WINDOW MODAL */}
      {activeChatBooking && (
        <div className="modal-overlay">
          <div className="modal-box glass-panel" style={{ background: '#0b1329', borderColor: 'rgba(56, 189, 248, 0.3)', maxWidth: '560px', width: '92%', height: '580px', display: 'flex', flexDirection: 'column', padding: 0, borderRadius: '20px', overflow: 'hidden' }}>
            {/* Chat Header */}
            <div style={{ padding: '1rem 1.25rem', background: 'rgba(15, 23, 42, 0.95)', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Chat: {activeChatBooking.provider?.name || 'Service Expert'}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
                    {activeChatBooking.serviceTitle} ({activeChatBooking.status})
                  </span>
                </div>
              </div>
              <button className="close-btn-modern" onClick={() => setActiveChatBooking(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Chat Body - Messages List */}
            <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', background: 'rgba(3, 7, 18, 0.6)' }}>
              {chatMessages.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  <MessageSquare size={32} style={{ color: '#38bdf8', margin: '0 auto 0.5rem', opacity: 0.6 }} />
                  Start the conversation! Type a message below to discuss appointment details or address instructions.
                </div>
              ) : (
                chatMessages.map((msg, idx) => {
                  const isSelf = msg.senderRole === 'client';
                  return (
                    <div
                      key={msg._id || idx}
                      style={{
                        alignSelf: isSelf ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.2rem', textAlign: isSelf ? 'right' : 'left' }}>
                        {msg.senderName} ({msg.senderRole}) · {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div
                        style={{
                          background: isSelf
                            ? 'linear-gradient(135deg, #0284c7, #2563eb)'
                            : 'rgba(30, 41, 59, 0.9)',
                          border: `1px solid ${isSelf ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                          color: '#ffffff',
                          padding: '0.7rem 0.95rem',
                          borderRadius: isSelf ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                          fontSize: '0.88rem',
                          lineHeight: 1.4,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Footer - Input Form */}
            {chatIsClosed ? (
              <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(239, 68, 68, 0.1)', borderTop: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '0.8rem', textAlign: 'center', fontWeight: 600 }}>
                🔒 Chat session closed - Service completed or cancelled.
              </div>
            ) : (
              <form onSubmit={handleSendChatMessage} style={{ padding: '0.85rem 1.25rem', background: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '0.6rem' }}>
                <input
                  type="text"
                  placeholder="Type a message to the expert..."
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  style={{ flex: 1, background: '#030712', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '0.7rem 0.95rem', color: '#ffffff', fontSize: '0.88rem', outline: 'none' }}
                />
                <button
                  type="submit"
                  disabled={sendingChatMessage || !chatInputText.trim()}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '0.7rem 1.1rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    opacity: sendingChatMessage || !chatInputText.trim() ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Send size={16} /> Send
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
