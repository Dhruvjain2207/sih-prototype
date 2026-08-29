'use client';
import React, { useState } from 'react';
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
} from 'lucide-react';
import toast from 'react-hot-toast';
import './freelancer.css';
import './dashboard.css';

interface FreelancerDashboardProps {
  session: any;
}

const NEIGHBOR_REQUESTS = [
  {
    id: 1,
    title: 'Garden help needed',
    tag: '+4',
    location: '2 blocks away',
    time: '2–4 hrs',
    icon: Wrench,
    budget: '40 credits',
    desc: 'Need help trimming bushes and clearing garden weeds before the weekend.',
  },
  {
    id: 2,
    title: 'Tech setup help',
    tag: '+2',
    location: 'Your street',
    time: '1 hr',
    icon: Wrench,
    budget: '25 credits',
    desc: 'Setting up smart TV and Wi-Fi router for my elderly neighbor.',
  },
  {
    id: 3,
    title: 'Home cleaning',
    tag: '+6',
    location: '1 block away',
    time: '3 hrs',
    icon: Wrench,
    budget: '60 credits',
    desc: 'Deep cleaning assistance for living room and kitchen area.',
  },
  {
    id: 4,
    title: 'Electrical repairs',
    tag: '+3',
    location: '0.5 miles away',
    time: '2 hrs',
    icon: Wrench,
    budget: '50 credits',
    desc: 'Fixing flickering light switches and ceiling fan wiring in master bedroom.',
  },
];

const CLOSE_NEIGHBORS = [
  {
    id: 101,
    name: 'Alex Chen',
    rating: '★ 4.9',
    skill: 'Repairs & carpentry',
    initials: 'AC',
    verified: true,
  },
  {
    id: 102,
    name: 'Jamie Rodriguez',
    rating: '★ 4.8',
    skill: 'Cleaning & organizing',
    initials: 'JR',
    verified: true,
  },
  {
    id: 103,
    name: 'Taylor Kim',
    rating: '★ 4.7',
    skill: 'Tech support',
    initials: 'TK',
    verified: true,
  },
];

export default function FreelancerDashboard({ session }: FreelancerDashboardProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedOfferRequest, setSelectedOfferRequest] = useState<any>(null);
  const [selectedMessageNeighbor, setSelectedMessageNeighbor] = useState<any>(null);
  
  // Form State inside Modals
  const [offerNote, setOfferNote] = useState('');
  const [messageText, setMessageText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleMenu = (menu: string) => setActiveMenu(activeMenu === menu ? null : menu);

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(`Your offer to help "${selectedOfferRequest.title}" has been sent!`, { duration: 4000 });
      setSelectedOfferRequest(null);
      setOfferNote('');
    }, 1200);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(`Message sent to ${selectedMessageNeighbor.name}!`, { duration: 3500 });
      setSelectedMessageNeighbor(null);
      setMessageText('');
    }, 1000);
  };

  const userInitials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'FL';

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
          {/* Location button */}
          <button className="nav-item location-btn" onClick={() => toggleMenu('location')}>
            <MapPin size={18} style={{ color: '#38bdf8' }} />
            <span>Patna, Bihar</span>
          </button>

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
                  <div className="detail-row">
                    <span>Status:</span>
                    <span className="text-green-400 font-semibold text-xs">✓ Verified Expert</span>
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
      </nav>

      {/* MAIN CONTENT AREA */}
      <main>
        {/* SECTION 1: RIGHT NOW - Neighbors need a hand */}
        <section className="freelancer-section">
          <div className="freelancer-section-subtitle">RIGHT NOW</div>
          <div className="freelancer-section-header">
            <h1 className="freelancer-section-title">Neighbors need a hand</h1>
            <a href="#view-all" className="freelancer-view-all-link">
              View all <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="freelancer-cards-grid">
            {NEIGHBOR_REQUESTS.map((req) => (
              <div key={req.id} className="freelancer-card">
                <div>
                  <div className="freelancer-card-top">
                    <div className="freelancer-card-icon">
                      <Wrench size={22} />
                    </div>
                    <div className="freelancer-card-meta">
                      <div className="freelancer-card-title-row">
                        <span className="freelancer-card-title">{req.title}</span>
                        <span className="freelancer-tag-badge">{req.tag}</span>
                      </div>
                      <div className="freelancer-card-subtext">
                        {req.location} · {req.time}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Est: <strong style={{ color: '#ffffff' }}>{req.budget}</strong></span>
                  <button
                    className="freelancer-card-action"
                    onClick={() => setSelectedOfferRequest(req)}
                  >
                    Offer help <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: PEOPLE POWER - Good people, close by */}
        <section className="freelancer-section" style={{ paddingTop: '2.5rem' }}>
          <div className="freelancer-section-subtitle">PEOPLE POWER</div>
          <h2 className="freelancer-section-title">Good people, close by</h2>
          <p className="freelancer-section-desc">Verified neighbors bringing their skills to the circle.</p>

          <div className="freelancer-cards-grid" style={{ marginTop: '1.75rem' }}>
            {CLOSE_NEIGHBORS.map((person) => (
              <div key={person.id} className="freelancer-person-card">
                <div className="freelancer-person-header">
                  <div className="freelancer-person-avatar">{person.initials}</div>
                  <div className="freelancer-person-info">
                    <div className="freelancer-person-name-row">
                      <span className="freelancer-person-name">{person.name}</span>
                      <span className="freelancer-person-rating">{person.rating}</span>
                    </div>
                    <div className="freelancer-person-skill">{person.skill}</div>
                  </div>
                </div>

                <div className="freelancer-person-footer">
                  <div className="freelancer-verified-badge">
                    <ShieldCheck size={16} /> Identity verified
                  </div>
                  <button
                    className="freelancer-message-btn"
                    onClick={() => setSelectedMessageNeighbor(person)}
                  >
                    <MessageSquare size={14} /> Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: THE COOPERATIVE LEDGER */}
        <section className="freelancer-ledger-container">
          <div className="freelancer-ledger-wrapper">
            <div className="freelancer-section-subtitle">THE COOPERATIVE LEDGER</div>

            <div className="freelancer-ledger-grid">
              {/* Left Column: Headline & Stats */}
              <div>
                <h2 className="freelancer-ledger-headline">
                  Every hour makes the circle stronger.
                </h2>
                <p className="freelancer-ledger-subtext">
                  Your time is valuable. Here, it moves through the neighborhood as trust, skills, and fair credits.
                </p>

                <div className="freelancer-stats-row">
                  <div className="freelancer-stat-box">
                    <div className="freelancer-stat-number">12</div>
                    <div className="freelancer-stat-label">hours helped</div>
                  </div>
                  <div className="freelancer-stat-box">
                    <div className="freelancer-stat-number">42</div>
                    <div className="freelancer-stat-label">credits earned</div>
                  </div>
                  <div className="freelancer-stat-box">
                    <div className="freelancer-stat-number">8</div>
                    <div className="freelancer-stat-label">neighbors helped</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Community Balance Box */}
              <div className="freelancer-balance-box">
                <div className="freelancer-balance-header">
                  <span className="freelancer-balance-title">Your community balance</span>
                  <Coins size={22} style={{ color: '#38bdf8' }} />
                </div>

                <div className="freelancer-balance-amount-row">
                  <span className="freelancer-balance-number">42</span>
                  <span className="freelancer-balance-unit">credits available</span>
                </div>

                <div className="freelancer-progress-bar-bg">
                  <div className="freelancer-progress-bar-fill" style={{ width: '84%' }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="freelancer-progress-text">
                    8 credits until your next community reward
                  </span>
                  <button
                    onClick={() => toast.success('Redeeming community rewards coming soon!')}
                    style={{
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#38bdf8',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Redeem
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL 1: OFFER HELP MODAL */}
      {selectedOfferRequest && (
        <div className="modal-overlay">
          <div className="modal-box glass-panel" style={{ background: '#0b1329', borderColor: 'rgba(56, 189, 248, 0.3)', maxWidth: '440px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div className="modal-title-wrapper">
                <div className="icon-wrapper" style={{ background: 'rgba(56, 189, 248, 0.15)' }}>
                  <Wrench size={18} style={{ color: '#38bdf8' }} />
                </div>
                <span>Offer Help for {selectedOfferRequest.title}</span>
              </div>
              <button className="close-btn-modern" onClick={() => setSelectedOfferRequest(null)}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSendOffer} className="modal-body" style={{ padding: '1.5rem 0 0' }}>
              <p className="text-muted text-sm mb-3">{selectedOfferRequest.desc}</p>
              
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.85rem', borderRadius: '10px', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-xs text-muted">Estimated Earnings:</span>
                <span className="text-xs font-bold text-sky-400">{selectedOfferRequest.budget}</span>
              </div>

              <div className="input-group mb-4">
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem', display: 'block' }}>Note to Neighbor (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Hi! I have tools ready and can arrive within 30 minutes..."
                  value={offerNote}
                  onChange={(e) => setOfferNote(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#030712',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    color: '#ffffff',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn-gradient-full"
                disabled={submitting}
                style={{ background: 'linear-gradient(135deg, #0284c7, #2563eb)' }}
              >
                {submitting ? 'Submitting Offer...' : 'Send Help Offer ↗'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MESSAGE NEIGHBOR MODAL */}
      {selectedMessageNeighbor && (
        <div className="modal-overlay">
          <div className="modal-box glass-panel" style={{ background: '#0b1329', borderColor: 'rgba(56, 189, 248, 0.3)', maxWidth: '420px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div className="modal-title-wrapper">
                <div className="freelancer-person-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                  {selectedMessageNeighbor.initials}
                </div>
                <span>Message {selectedMessageNeighbor.name}</span>
              </div>
              <button className="close-btn-modern" onClick={() => setSelectedMessageNeighbor(null)}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSendMessage} className="modal-body" style={{ padding: '1.5rem 0 0' }}>
              <p className="text-muted text-sm mb-3">Skill: <strong>{selectedMessageNeighbor.skill}</strong></p>

              <div className="input-group mb-4">
                <textarea
                  rows={3}
                  placeholder={`Write a message to ${selectedMessageNeighbor.name}...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: '#030712',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    color: '#ffffff',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn-gradient-full"
                disabled={submitting}
                style={{ background: 'linear-gradient(135deg, #0284c7, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Send size={16} />
                {submitting ? 'Sending...' : 'Send Direct Message'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
