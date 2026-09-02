'use client';
import React, { useState, useEffect, useRef } from 'react';
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
  Star,
  Volume2,
  Building,
  Layers,
  Boxes,
  Users,
  Minus,
  Plus,
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

  // Review Modal States
  const [selectedReviewBooking, setSelectedReviewBooking] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  // Work Domains State
  const [freelancerSkills, setFreelancerSkills] = useState<string[]>(session?.user?.skills || []);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [submittingSkills, setSubmittingSkills] = useState(false);

  // Quoting State
  const [quotePrices, setQuotePrices] = useState<Record<string, string>>({});
  const [bulkClaimUnits, setBulkClaimUnits] = useState<Record<string, number>>({});
  const [bulkClaimPricePerUnit, setBulkClaimPricePerUnit] = useState<Record<string, string>>({});

  const handleQuoteChange = (bookingId: string, val: string) => {
    setQuotePrices((prev) => ({ ...prev, [bookingId]: val }));
  };

  const handleBulkUnitsChange = (bookingId: string, val: number) => {
    setBulkClaimUnits((prev) => ({ ...prev, [bookingId]: val }));
  };

  const handleBulkPriceChange = (bookingId: string, val: string) => {
    setBulkClaimPricePerUnit((prev) => ({ ...prev, [bookingId]: val }));
  };

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

  // Audio Alert State & 5-Second Ring Sound Function (Web Audio API)
  const prevPendingCountRef = useRef<number>(-1);

  const playNotificationRing = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      let elapsedMs = 0;

      const ringInterval = setInterval(() => {
        if (elapsedMs >= 5000) {
          clearInterval(ringInterval);
          ctx.close();
          return;
        }

        // Chime tone 1 (A5 880Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, ctx.currentTime);
        gain1.gain.setValueAtTime(0.25, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.35);

        // Chime tone 2 (C6 1046.5Hz) after 180ms delay
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.18);
        gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.18);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime + 0.18);
        osc2.stop(ctx.currentTime + 0.55);

        elapsedMs += 750;
      }, 750);
    } catch (e) {
      console.error('Audio playback error:', e);
    }
  };

  const DOMAIN_OPTIONS = [
    'Plumbing',
    'Electrician',
    'House Cleaning',
    'Cook / Chef',
    'Carpentry & Woodwork',
    'Painting & Decorating',
    'AC & Appliance Repair',
    'Gardening & Lawn Care',
  ];

  const handleToggleDomainSkill = (domain: string) => {
    setFreelancerSkills((prev) =>
      prev.includes(domain) ? prev.filter((s) => s !== domain) : [...prev, domain]
    );
  };

  const handleSaveSkills = async () => {
    setSubmittingSkills(true);
    const toastId = toast.loading('Saving work domains...');
    try {
      const res = await fetch('/api/freelancer/skills', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: freelancerSkills }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Work domains updated successfully!', { id: toastId });
        setIsSkillsModalOpen(false);
        fetchData();
      } else {
        toast.error(data.error || 'Failed to update work domains', { id: toastId });
      }
    } catch {
      toast.error('Network error updating work domains', { id: toastId });
    } finally {
      setSubmittingSkills(false);
    }
  };

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

        // Check for new pending booking requests to trigger 5-second ring sound
        const newPendingList = bookingsData.bookings.filter((b: any) => b.status === 'PENDING');
        const newPendingCount = newPendingList.length;

        if (prevPendingCountRef.current !== -1 && newPendingCount > prevPendingCountRef.current) {
          playNotificationRing();
          toast.success('🔔 NEW SERVICE REQUEST RECEIVED! (Ringing for 5s)', {
            duration: 5000,
            style: { background: '#0284c7', color: '#ffffff', fontWeight: 800 },
          });
        }
        prevPendingCountRef.current = newPendingCount;
      }

      // 2. Fetch Notifications
      const notifRes = await fetch('/api/notifications');
      const notifData = await notifRes.json();
      if (notifData.success) {
        setNotifications(notifData.notifications || []);
        setUnreadNotificationsCount(notifData.unreadCount || 0);
      }

      // 3. Fetch Freelancer Skills/Work Domains
      const skillsRes = await fetch('/api/freelancer/skills');
      const skillsData = await skillsRes.json();
      if (skillsData.success && Array.isArray(skillsData.skills)) {
        setFreelancerSkills(skillsData.skills);
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
  const handleUpdateStatus = async (bookingId: string, targetStatus: string, reason?: string, price?: number) => {
    setSubmittingAction(true);
    const toastId = toast.loading(`Updating booking status...`);

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus, rejectionReason: reason, quotedPrice: price }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(targetStatus === 'ACCEPTED' ? `Quote sent (₹${price}) & request accepted!` : `Booking ${targetStatus.toLowerCase()} successfully!`, { id: toastId, duration: 4000 });
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

  const handleClaimBulkUnits = async (bookingId: string, maxRemaining: number) => {
    const rawUnits = bulkClaimUnits[bookingId] !== undefined ? bulkClaimUnits[bookingId] : maxRemaining;
    const units = Math.max(1, Math.min(maxRemaining, rawUnits));
    const priceStr = bulkClaimPricePerUnit[bookingId];
    const unitPrice = Number(priceStr);

    if (!units || units <= 0 || units > maxRemaining) {
      toast.error(`Please select between 1 and ${maxRemaining} units to claim.`);
      return;
    }

    if (!unitPrice || unitPrice <= 0) {
      toast.error('Please enter a valid quoted price per unit (₹).');
      return;
    }

    setSubmittingAction(true);
    const toastId = toast.loading(`Claiming ${units} households at ₹${unitPrice}/unit...`);

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CLAIM_BULK_UNITS',
          unitsClaimed: units,
          quotedPricePerUnit: unitPrice,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Successfully claimed ${units} households (Total: ₹${units * unitPrice})! Quote sent to customer 🎉`, { id: toastId, duration: 5000 });
        fetchData();
      } else {
        toast.error(data.error || 'Failed to claim bulk units', { id: toastId });
      }
    } catch {
      toast.error('Network error claiming bulk units', { id: toastId });
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleUpdateAssignmentStatus = async (bookingId: string, assignmentId: string, status: string) => {
    setSubmittingAction(true);
    const toastId = toast.loading(`Updating your assigned units to ${status}...`);

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_ASSIGNMENT_STATUS',
          assignmentId,
          status,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Units marked as ${status.toLowerCase()}!`, { id: toastId, duration: 4000 });
        fetchData();
      } else {
        toast.error(data.error || 'Failed to update assignment status', { id: toastId });
      }
    } catch {
      toast.error('Network error updating assignment status', { id: toastId });
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewBooking) return;
    setSubmittingReview(true);
    const toastId = toast.loading('Submitting rating & review for customer...');
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
        toast.success('Customer rating & review submitted successfully!', { id: toastId });
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

  const userInitials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'FL';

  const currentUserId = (session?.user?.id || (session?.user as any)?._id || '').toString().trim();

  const isMyAssignment = (a: any) => {
    if (!a || !a.provider) return false;
    const provId = (a.provider?._id ? a.provider._id.toString() : a.provider?.toString() || '').trim();
    return (
      (currentUserId && provId === currentUserId) ||
      (session?.user?.id && provId === session.user.id.toString().trim()) ||
      ((session?.user as any)?._id && provId === (session?.user as any)._id.toString().trim())
    );
  };

  // Categorize Real Bookings (supporting single + bulk bookings)
  const pendingRequests = bookings.filter((b) => {
    if (b.isBulk) {
      const alreadyAssigned = (b.assignments || []).some(isMyAssignment);
      return (b.remainingUnits || 0) > 0 && !alreadyAssigned;
    }
    return b.status === 'PENDING';
  });

  const activeJobs = bookings.filter((b) => {
    if (b.isBulk) {
      return (b.assignments || []).some(
        (a: any) =>
          isMyAssignment(a) &&
          (a.status === 'ACCEPTED' || a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS')
      );
    }
    return b.status === 'ACCEPTED' || b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS';
  });

  const completedJobs = bookings.filter((b) => {
    if (b.isBulk) {
      return (b.assignments || []).some(
        (a: any) => isMyAssignment(a) && a.status === 'COMPLETED'
      );
    }
    return b.status === 'COMPLETED';
  });

  const pastInactives = bookings.filter((b) => {
    if (b.isBulk) return false;
    return b.status === 'REJECTED' || b.status === 'CANCELLED';
  });

  const totalCreditsEarned = completedJobs.reduce((acc, b) => {
    if (b.isBulk) {
      const myA = (b.assignments || []).find(isMyAssignment);
      return acc + (myA?.totalAmount || 0);
    }
    return acc + (b.totalAmount || 0);
  }, 0);

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
        {/* WORK DOMAINS SUMMARY BANNER */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.7))',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          margin: '1.5rem 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={14} /> My Active Service Domains
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.6rem' }}>
              {freelancerSkills.length === 0 ? (
                <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontStyle: 'italic' }}>
                  No service domains selected yet. Click "Manage Domains" to select your skills!
                </span>
              ) : (
                freelancerSkills.map((sk) => (
                  <span
                    key={sk}
                    style={{
                      background: 'rgba(56, 189, 248, 0.12)',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      color: '#38bdf8',
                      padding: '0.25rem 0.7rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    ✓ {sk}
                  </span>
                ))
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                playNotificationRing();
                toast.success('🔔 Playing 5-second test ring chime sound!', { duration: 5000 });
              }}
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: '#fbbf24',
                padding: '0.6rem 1rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Volume2 size={15} /> Test 5s Ring Sound
            </button>

            <button
              onClick={() => setIsSkillsModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(37, 99, 235, 0.3))',
                border: '1px solid rgba(56, 189, 248, 0.5)',
                color: '#38bdf8',
                padding: '0.6rem 1.25rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease',
              }}
            >
              ⚙️ Manage Work Domains
            </button>
          </div>
        </div>

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
              {pendingRequests.map((req) => {
                // ==========================================
                // BULK REQUEST CARD (MULTI-UNIT / MULTI-SERVICE)
                // ==========================================
                if (req.isBulk) {
                  const remaining = req.remainingUnits || 1;
                  const rawUnits = bulkClaimUnits[req._id] !== undefined ? bulkClaimUnits[req._id] : remaining;
                  const selectedUnits = Math.max(1, Math.min(remaining, rawUnits));
                  const pricePerUnit = Number(bulkClaimPricePerUnit[req._id]) || 0;
                  const totalQuotedAmount = selectedUnits * pricePerUnit;

                  return (
                    <div
                      key={req._id}
                      className="freelancer-card"
                      style={{
                        background: 'linear-gradient(135deg, rgba(13, 22, 44, 0.95), rgba(30, 41, 59, 0.9))',
                        border: '1px solid rgba(99, 102, 241, 0.45)',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      <div>
                        {/* Header */}
                        <div className="freelancer-card-top">
                          <div className="freelancer-card-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)', color: '#ffffff' }}>
                            <Building size={22} />
                          </div>
                          <div className="freelancer-card-meta">
                            <div className="freelancer-card-title-row">
                              <span className="freelancer-card-title" style={{ fontSize: '1.15rem' }}>{req.serviceTitle}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                              <span style={{
                                background: 'rgba(245, 158, 11, 0.15)',
                                color: '#f59e0b',
                                border: '1px solid rgba(245, 158, 11, 0.35)',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                              }}>
                                ⚡ {remaining} of {req.totalUnits} Units Remaining Open
                              </span>
                              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                Client: <strong style={{ color: '#ffffff' }}>{req.client?.name || 'Society Organizer'}</strong> ({req.address?.phone || req.client?.phone || 'No phone'})
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Multi-Service Chips */}
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', margin: '0.75rem 0' }}>
                          {(req.selectedServices || []).map((srv: string) => (
                            <span key={srv} style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: '6px' }}>
                              ✓ {srv}
                            </span>
                          ))}
                        </div>

                        {/* Problem & Location Info */}
                        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(56, 189, 248, 0.15)', padding: '0.85rem', borderRadius: '10px', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                          <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '0.2rem' }}>Society / Task Scope:</div>
                          <div style={{ color: '#ffffff', fontWeight: 600, marginBottom: '0.4rem' }}>"{req.problemDescription || req.notes || 'Bulk work for units'}"</div>
                          <div>📅 Date: {new Date(req.scheduledDate).toLocaleDateString()} ({req.timeSlot})</div>
                          <div>📍 Address: {req.address?.houseFlat}, {req.address?.streetArea}, {req.address?.city}</div>
                        </div>
                      </div>

                      {/* Bulk Claim Form */}
                      <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '12px', padding: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {/* 1. Unit Selector */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <label style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 800 }}>
                              How many households will you claim?
                            </label>
                            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>
                              Max: {remaining} {req.unitType || 'households'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', background: '#030712', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '8px', padding: '0.2rem 0.5rem' }}>
                              <button
                                type="button"
                                onClick={() => handleBulkUnitsChange(req._id, Math.max(1, selectedUnits - 1))}
                                style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '0.25rem 0.4rem' }}
                              >
                                <Minus size={15} />
                              </button>
                              <span style={{ color: '#ffffff', fontWeight: 900, fontSize: '0.95rem', minWidth: '40px', textAlign: 'center' }}>
                                {selectedUnits}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleBulkUnitsChange(req._id, Math.min(remaining, selectedUnits + 1))}
                                style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '0.25rem 0.4rem' }}
                              >
                                <Plus size={15} />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleBulkUnitsChange(req._id, remaining)}
                              style={{
                                background: selectedUnits === remaining ? '#6366f1' : 'rgba(255,255,255,0.05)',
                                border: `1px solid ${selectedUnits === remaining ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                                color: selectedUnits === remaining ? '#ffffff' : '#cbd5e1',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                              }}
                            >
                              Accept All ({remaining} units)
                            </button>
                          </div>
                        </div>

                        {/* 2. Rate per unit input */}
                        <div>
                          <label style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                            Quoted Rate Per Household/Unit (₹):
                          </label>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(56,189,248,0.2)', padding: '0.55rem 0.85rem', borderRadius: '8px', color: '#38bdf8', fontWeight: 800 }}>₹</span>
                            <input
                              type="number"
                              placeholder="e.g. 350"
                              value={bulkClaimPricePerUnit[req._id] || ''}
                              onChange={(e) => handleBulkPriceChange(req._id, e.target.value)}
                              style={{
                                flex: 1,
                                background: '#030712',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                borderRadius: '8px',
                                padding: '0.55rem 0.85rem',
                                color: '#ffffff',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                outline: 'none',
                              }}
                            />
                          </div>
                        </div>

                        {/* 3. Live Total calculation badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem' }}>
                          <span style={{ color: '#94a3b8' }}>Total Quoted for {selectedUnits} Units:</span>
                          <span style={{ color: '#4ade80', fontWeight: 900, fontSize: '1.05rem' }}>
                            ₹{totalQuotedAmount}
                          </span>
                        </div>

                        {/* 4. Action button */}
                        <button
                          onClick={() => handleClaimBulkUnits(req._id, remaining)}
                          disabled={submittingAction}
                          style={{
                            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                            border: 'none',
                            color: '#ffffff',
                            padding: '0.85rem',
                            borderRadius: '12px',
                            fontWeight: 900,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.45rem',
                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                          }}
                        >
                          <Check size={18} /> Claim {selectedUnits} Units & Send Quote (₹{totalQuotedAmount}) ↗
                        </button>
                      </div>
                    </div>
                  );
                }

                // ==========================================
                // SINGLE SERVICE REQUEST CARD
                // ==========================================
                return (
                  <div key={req._id} className="freelancer-card">
                    <div>
                      <div className="freelancer-card-top">
                        <div className="freelancer-card-icon">
                          <Wrench size={22} />
                        </div>
                        <div className="freelancer-card-meta">
                          <div className="freelancer-card-title-row">
                            <span className="freelancer-card-title">{req.serviceTitle}</span>
                            <span className="freelancer-tag-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>⚡ Quote Pending</span>
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

                    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <div>
                        <label style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                          Enter Your Quoted Price (₹) for this job:
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(56,189,248,0.2)', padding: '0.55rem 0.85rem', borderRadius: '8px', color: '#38bdf8', fontWeight: 800 }}>₹</span>
                          <input
                            type="number"
                            placeholder="e.g. 250"
                            value={quotePrices[req._id] || ''}
                            onChange={(e) => handleQuoteChange(req._id, e.target.value)}
                            style={{
                              flex: 1,
                              background: '#030712',
                              border: '1px solid rgba(56, 189, 248, 0.3)',
                              borderRadius: '8px',
                              padding: '0.55rem 0.85rem',
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              outline: 'none',
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setSelectedRejectBooking(req)}
                          disabled={submittingAction}
                          style={{
                            flex: 1,
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            color: '#ef4444',
                            padding: '0.75rem',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <Ban size={16} /> Decline Request
                        </button>

                        <button
                          onClick={() => {
                            const price = Number(quotePrices[req._id]);
                            if (!price || price <= 0) {
                              toast.error('Please enter a valid price quote (₹) before accepting!');
                              return;
                            }
                            handleUpdateStatus(req._id, 'ACCEPTED', undefined, price);
                          }}
                          disabled={submittingAction}
                          style={{
                            flex: 2,
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(16, 185, 129, 0.35))',
                            border: '1px solid rgba(34, 197, 94, 0.5)',
                            color: '#4ade80',
                            padding: '0.75rem',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            boxShadow: '0 4px 15px rgba(34, 197, 94, 0.15)',
                          }}
                        >
                          <Check size={18} /> Send Quote & Accept ↗
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
              {activeJobs.map((job) => {
                // ==========================================
                // BULK ACTIVE JOB CARD
                // ==========================================
                if (job.isBulk) {
                  const myAssignment = (job.assignments || []).find(isMyAssignment);
                  const isPaid = myAssignment?.paymentStatus === 'PAID';
                  const isCashConfirmed = myAssignment?.status === 'CONFIRMED' && myAssignment?.paymentMethod === 'CASH_AFTER_WORK';
                  const isInProgress = myAssignment?.status === 'IN_PROGRESS';
                  const isCompleted = myAssignment?.status === 'COMPLETED';

                  return (
                    <div
                      key={job._id}
                      className="freelancer-person-card"
                      style={{
                        background: 'linear-gradient(135deg, rgba(13, 22, 44, 0.9), rgba(30, 41, 59, 0.85))',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)', color: '#ffffff', fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                              🏢 BULK ORDER
                            </span>
                            <h3 style={{ color: '#ffffff', fontWeight: 800, margin: 0, fontSize: '1.1rem' }}>
                              {job.serviceTitle}
                            </h3>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                            Client: <strong>{job.client?.name}</strong> ({job.address?.phone || 'No phone'})
                          </div>
                        </div>

                        <span style={{
                          background: isCompleted ? 'rgba(34, 197, 94, 0.2)' : isPaid ? 'rgba(34, 197, 94, 0.15)' : isCashConfirmed ? 'rgba(34, 197, 94, 0.15)' : isInProgress ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: isCompleted ? '#4ade80' : isPaid ? '#22c55e' : isCashConfirmed ? '#22c55e' : isInProgress ? '#38bdf8' : '#f59e0b',
                          border: `1px solid ${isCompleted || isPaid || isCashConfirmed ? 'rgba(34, 197, 94, 0.3)' : isInProgress ? 'rgba(56, 189, 248, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '10px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                        }}>
                          {isCompleted
                            ? '✅ UNITS COMPLETED'
                            : isPaid
                            ? '✅ CONFIRMED (PAID ONLINE)'
                            : isCashConfirmed
                            ? '💵 CONFIRMED (CASH AFTER WORK)'
                            : isInProgress
                            ? '🛠️ IN PROGRESS'
                            : '⏳ QUOTE SENT (AWAITING CLIENT)'}
                        </span>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                        <div style={{ color: '#38bdf8', fontWeight: 800, marginBottom: '0.3rem' }}>
                          Your Assigned Portion: {myAssignment?.unitsClaimed || 0} {job.unitType || 'Households'} @ ₹{myAssignment?.quotedPricePerUnit}/unit
                        </div>
                        <div>📅 Scheduled: {new Date(job.scheduledDate).toLocaleDateString()} ({job.timeSlot})</div>
                        <div>📍 Address: {job.address?.houseFlat}, {job.address?.streetArea}, {job.address?.city}</div>
                        <div style={{ color: isPaid ? '#22c55e' : '#f59e0b', fontWeight: 800, marginTop: '0.35rem' }}>
                          {isPaid
                            ? `✅ Payment Received: ₹${myAssignment?.totalAmount}`
                            : isCashConfirmed
                            ? `💵 Direct Cash Due After Completion: ₹${myAssignment?.totalAmount}`
                            : `Quoted Amount: ₹${myAssignment?.totalAmount}`}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setActiveChatBooking(job)}
                          style={{ flex: 1, background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.35)', color: '#38bdf8', padding: '0.55rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                        >
                          <MessageSquare size={15} /> Chat with Customer
                        </button>

                        {myAssignment && !isCompleted && (
                          <>
                            {!isInProgress && (
                              <button
                                onClick={() => handleUpdateAssignmentStatus(job._id, myAssignment._id, 'IN_PROGRESS')}
                                disabled={submittingAction}
                                style={{ flex: 1, background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '0.55rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                              >
                                <Play size={14} /> Start Service
                              </button>
                            )}

                            <button
                              onClick={() => handleUpdateAssignmentStatus(job._id, myAssignment._id, 'COMPLETED')}
                              disabled={submittingAction}
                              style={{ flex: 1, background: 'linear-gradient(135deg, #0284c7, #2563eb)', border: 'none', color: '#ffffff', padding: '0.55rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                            >
                              <CheckCircle size={14} /> Mark Completed
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                }

                // ==========================================
                // SINGLE ACTIVE JOB CARD
                // ==========================================
                return (
                  <div key={job._id} className="freelancer-person-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <h3 style={{ color: '#ffffff', fontWeight: 700, margin: 0, fontSize: '1.1rem' }}>{job.serviceTitle}</h3>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Client: {job.client?.name} ({job.address?.phone || 'No phone'})</span>
                      </div>
                      <span style={{
                        background: job.status === 'CONFIRMED' || job.paymentStatus === 'PAID' ? 'rgba(34, 197, 94, 0.15)' : job.status === 'IN_PROGRESS' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: job.status === 'CONFIRMED' || job.paymentStatus === 'PAID' ? '#22c55e' : job.status === 'IN_PROGRESS' ? '#38bdf8' : '#f59e0b',
                        border: `1px solid ${job.status === 'CONFIRMED' || job.paymentStatus === 'PAID' ? 'rgba(34, 197, 94, 0.3)' : job.status === 'IN_PROGRESS' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                      }}>
                        {job.status === 'CONFIRMED' || job.paymentStatus === 'PAID'
                          ? '✅ CONFIRMED & PAID'
                          : job.status === 'IN_PROGRESS'
                          ? '🛠️ IN PROGRESS'
                          : '⏳ ACCEPTED (Awaiting Payment)'}
                      </span>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                      <div>📅 {new Date(job.scheduledDate).toLocaleDateString()} ({job.timeSlot})</div>
                      <div>📍 Address: {job.address?.houseFlat}, {job.address?.streetArea}, {job.address?.city}</div>
                      {job.paymentStatus === 'PAID' ? (
                        <div style={{ color: '#22c55e', fontWeight: 700, marginTop: '0.3rem' }}>
                          ✅ Payment Received via Razorpay: ₹{job.totalAmount} (ID: {job.razorpayPaymentId || 'Paid'})
                        </div>
                      ) : (
                        <div style={{ color: '#f59e0b', fontWeight: 700, marginTop: '0.3rem' }}>
                          ⏳ Customer Payment Pending: ₹{job.totalAmount}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setActiveChatBooking(job)}
                        style={{ flex: 1, background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.35)', color: '#38bdf8', padding: '0.55rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                      >
                        <MessageSquare size={15} /> Chat with Customer
                      </button>

                      {(job.status === 'ACCEPTED' || job.status === 'CONFIRMED') && (
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
                );
              })}
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
                    <div className="freelancer-stat-label">total earned</div>
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
                  <span className="freelancer-balance-unit">total earnings</span>
                </div>

                <div className="freelancer-progress-bar-bg">
                  <div className="freelancer-progress-bar-fill" style={{ width: `${Math.min(100, completedJobs.length * 20)}%` }}></div>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Accept booking requests and receive earnings directly via online Razorpay or cash.
                </div>
              </div>
            </div>

            {/* COMPLETED JOBS & CLIENT RATING SECTION */}
            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(56, 189, 248, 0.15)' }}>
              <h3 style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={20} className="text-sky-400" /> Completed Jobs & Customer Reviews ({completedJobs.length})
              </h3>

              {completedJobs.length === 0 ? (
                <div style={{ background: 'rgba(13, 22, 44, 0.5)', border: '1px solid rgba(56, 189, 248, 0.1)', borderRadius: '14px', padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem' }}>
                  No completed jobs yet. Completed jobs will be listed here with options to rate & review your customers.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {completedJobs.map((job) => {
                    const myA = job.isBulk ? (job.assignments || []).find(isMyAssignment) : null;
                    const finalAmount = myA ? myA.totalAmount : job.totalAmount;
                    const isPaid = myA
                      ? myA.paymentStatus === 'PAID' || myA.paymentMethod === 'RAZORPAY'
                      : job.paymentStatus === 'PAID' || job.paymentMethod === 'RAZORPAY';

                    return (
                      <div key={job._id} style={{ background: 'rgba(13, 22, 44, 0.7)', border: '1px solid rgba(56, 189, 248, 0.15)', borderRadius: '14px', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {job.isBulk && (
                                <span style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                  🏢 BULK ({myA?.unitsClaimed || 1} units)
                                </span>
                              )}
                              <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '1.05rem' }}>{job.serviceTitle}</div>
                            </div>
                            <div style={{ fontSize: '0.83rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                              Customer: <strong style={{ color: '#ffffff' }}>{job.client?.name || 'Customer'}</strong> ({job.address?.phone || 'No phone'}) · Date: {new Date(job.scheduledDate).toLocaleDateString()}
                            </div>
                          </div>
                          <span style={{
                            background: isPaid ? 'rgba(56, 189, 248, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                            color: isPaid ? '#38bdf8' : '#22c55e',
                            border: `1px solid ${isPaid ? 'rgba(56, 189, 248, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                            padding: '0.25rem 0.65rem',
                            borderRadius: '10px',
                            fontSize: '0.78rem',
                            fontWeight: 800
                          }}>
                            ₹{finalAmount} {isPaid ? '(Paid via Razorpay)' : '(Cash Collected)'}
                          </span>
                        </div>

                        {job.problemDescription && (
                          <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontStyle: 'italic', marginBottom: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                            Problem: "{job.problemDescription}"
                          </div>
                        )}

                      {/* RATINGS & REVIEWS AREA */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {/* Freelancer's review for Client */}
                        {job.providerReview ? (
                          <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '10px', padding: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                              <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700 }}>Your Review for Customer ({job.client?.name || 'Customer'})</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', fontWeight: 800, fontSize: '0.85rem' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} size={14} fill={star <= job.providerReview.rating ? '#fbbf24' : 'none'} color={star <= job.providerReview.rating ? '#fbbf24' : '#64748b'} />
                                ))}
                                <span style={{ marginLeft: '0.25rem' }}>{job.providerReview.rating}/5</span>
                              </div>
                            </div>
                            {job.providerReview.comment ? (
                              <div style={{ fontSize: '0.8rem', color: '#e2e8f0', fontStyle: 'italic' }}>"{job.providerReview.comment}"</div>
                            ) : (
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No text comment provided.</div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <button
                              onClick={() => {
                                setSelectedReviewBooking(job);
                                setReviewRating(5);
                                setReviewComment('');
                              }}
                              style={{
                                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(37, 99, 235, 0.3))',
                                border: '1px solid rgba(56, 189, 248, 0.5)',
                                color: '#38bdf8',
                                padding: '0.55rem 1rem',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                              }}
                            >
                              <Star size={14} fill="#38bdf8" color="#38bdf8" /> Rate & Review Customer ↗
                            </button>
                          </div>
                        )}

                        {/* Client's review for Freelancer */}
                        {job.clientReview && (
                          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '10px', padding: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                              <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 700 }}>Customer's Rating & Review for You</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', fontWeight: 800, fontSize: '0.85rem' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} size={14} fill={star <= job.clientReview.rating ? '#fbbf24' : 'none'} color={star <= job.clientReview.rating ? '#fbbf24' : '#64748b'} />
                                ))}
                                <span style={{ marginLeft: '0.25rem' }}>{job.clientReview.rating}/5</span>
                              </div>
                            </div>
                            {job.clientReview.comment ? (
                              <div style={{ fontSize: '0.8rem', color: '#e2e8f0', fontStyle: 'italic' }}>"{job.clientReview.comment}"</div>
                            ) : (
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No text comment provided.</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
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
      {/* RATE & REVIEW CUSTOMER MODAL */}
      {selectedReviewBooking && (
        <div className="modal-overlay">
          <div className="modal-box glass-panel" style={{ background: '#0b1329', borderColor: 'rgba(56, 189, 248, 0.3)', maxWidth: '440px' }}>
            <div className="modal-header">
              <div className="modal-title-wrapper" style={{ color: '#38bdf8' }}>
                <Star size={20} fill="#38bdf8" color="#38bdf8" />
                <span>Rate & Review Customer</span>
              </div>
              <button className="close-btn-modern" onClick={() => setSelectedReviewBooking(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="modal-body" style={{ paddingTop: '1.25rem' }}>
              <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '12px', padding: '0.85rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <div style={{ color: '#94a3b8' }}>Service: <strong style={{ color: '#ffffff' }}>{selectedReviewBooking.serviceTitle}</strong></div>
                <div style={{ color: '#94a3b8', marginTop: '0.2rem' }}>Customer: <strong style={{ color: '#38bdf8' }}>{selectedReviewBooking.client?.name || 'Customer'}</strong></div>
              </div>

              {/* STAR SELECTION */}
              <div style={{ textAlign: 'center', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Customer Rating</label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', transition: 'transform 0.15s ease' }}
                    >
                      <Star
                        size={30}
                        fill={star <= reviewRating ? '#fbbf24' : 'none'}
                        color={star <= reviewRating ? '#fbbf24' : '#475569'}
                      />
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fbbf24' }}>
                  {reviewRating === 5 && '⭐⭐⭐⭐⭐ Excellent Customer!'}
                  {reviewRating === 4 && '⭐⭐⭐⭐ Very Good Experience'}
                  {reviewRating === 3 && '⭐⭐⭐ Good Customer'}
                  {reviewRating === 2 && '⭐⭐ Below Average'}
                  {reviewRating === 1 && '⭐ Poor Experience'}
                </div>
              </div>

              {/* COMMENT TEXTAREA */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>Feedback / Notes on Customer (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Friendly, clear instructions, prompt cash payment..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#030712',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    color: '#ffffff',
                    outline: 'none',
                    fontSize: '0.88rem',
                    resize: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  opacity: submittingReview ? 0.6 : 1,
                }}
              >
                {submittingReview ? 'Submitting Review...' : 'Submit Customer Rating & Review ↗'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE WORK DOMAINS MODAL */}
      {isSkillsModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box glass-panel" style={{ background: '#0b1329', borderColor: 'rgba(56, 189, 248, 0.3)', maxWidth: '520px' }}>
            <div className="modal-header">
              <div className="modal-title-wrapper" style={{ color: '#38bdf8' }}>
                <Zap size={20} />
                <span>Manage Work Domains</span>
              </div>
              <button className="close-btn-modern" onClick={() => setIsSkillsModalOpen(false)}><X size={18} /></button>
            </div>

            <div className="modal-body" style={{ paddingTop: '1.25rem' }}>
              <p className="text-muted text-sm mb-3" style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                Select all domains you specialize in. You will receive booking requests for all selected categories!
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '1.25rem 0' }}>
                {DOMAIN_OPTIONS.map((domain) => {
                  const isSelected = freelancerSkills.includes(domain);
                  return (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => handleToggleDomainSkill(domain)}
                      style={{
                        background: isSelected
                          ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(37, 99, 235, 0.35))'
                          : 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${isSelected ? 'rgba(56, 189, 248, 0.6)' : 'rgba(255, 255, 255, 0.1)'}`,
                        color: isSelected ? '#38bdf8' : '#cbd5e1',
                        padding: '0.5rem 0.85rem',
                        borderRadius: '20px',
                        fontSize: '0.82rem',
                        fontWeight: isSelected ? 800 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isSelected ? '✓ ' : '+ '} {domain}
                    </button>
                  );
                })}
              </div>

              {freelancerSkills.length === 0 && (
                <div style={{ fontSize: '0.8rem', color: '#f59e0b', marginBottom: '1rem', fontStyle: 'italic' }}>
                  ⚠️ Please select at least one domain to receive requests.
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  onClick={() => setIsSkillsModalOpen(false)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', padding: '0.75rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSkills}
                  disabled={submittingSkills}
                  style={{ flex: 2, background: 'linear-gradient(135deg, #0284c7, #2563eb)', border: 'none', color: '#ffffff', padding: '0.75rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', opacity: submittingSkills ? 0.6 : 1 }}
                >
                  {submittingSkills ? 'Saving Work Domains...' : 'Save Work Domains'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHAT WINDOW MODAL FOR FREELANCER */}
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
                    Chat: {activeChatBooking.client?.name || 'Customer'}
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
                  Start the conversation! Type a message below to discuss appointment details or address instructions with the customer.
                </div>
              ) : (
                chatMessages.map((msg, idx) => {
                  const isSelf = msg.senderRole === 'freelancer';
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
                  placeholder="Type a message to the customer..."
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
