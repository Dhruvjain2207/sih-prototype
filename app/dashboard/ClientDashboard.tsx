'use client';
import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import {
  Search,
  MapPin,
  User,
  LogOut,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Star,
  Gift,
  CheckCircle2,
  X,
  Tag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import './client.css';
import './dashboard.css';

interface ClientDashboardProps {
  session: any;
}

const CURATED_SERVICES = [
  {
    id: 1,
    name: 'Plumbing Repair & Fixtures',
    category: 'Home Maintenance',
    price: '$35.00',
    rating: '4.9',
    reviews: '124 reviews',
    img: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
    tag: 'Popular',
  },
  {
    id: 2,
    name: 'Electrical Inspection & Wiring',
    category: 'Electrical',
    price: '$45.00',
    rating: '4.8',
    reviews: '98 reviews',
    img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80',
    tag: 'Verified Pros',
  },
  {
    id: 3,
    name: 'Full Home Deep Cleaning',
    category: 'Cleaning',
    price: '$60.00',
    rating: '5.0',
    reviews: '210 reviews',
    img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
    tag: 'Top Rated',
  },
  {
    id: 4,
    name: 'AC Service & Gas Refill',
    category: 'Appliance Care',
    price: '$40.00',
    rating: '4.9',
    reviews: '312 reviews',
    img: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=600&q=80',
    tag: '30% OFF',
  },
  {
    id: 5,
    name: 'Washing Machine Repair',
    category: 'Appliance Care',
    price: '$50.00',
    rating: '4.7',
    reviews: '85 reviews',
    img: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?auto=format&fit=crop&w=600&q=80',
    tag: 'Express',
  },
  {
    id: 6,
    name: 'Interior Wall Painting',
    category: 'Painting',
    price: '$75.00',
    rating: '4.8',
    reviews: '142 reviews',
    img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
    tag: 'Best Value',
  },
];

export default function ClientDashboard({ session }: ClientDashboardProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [claimedPromo, setClaimedPromo] = useState<string | null>(null);

  const toggleMenu = (menu: string) => setActiveMenu(activeMenu === menu ? null : menu);

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const handleBookService = (service: any) => {
    setSelectedService(service);
  };

  const handleConfirmBooking = () => {
    toast.success(`Booking request for ${selectedService.name} placed successfully!`, { duration: 4000 });
    setSelectedService(null);
  };

  const handleClaimOffer = (code: string) => {
    setClaimedPromo(code);
    toast.success(`Promo code ${code} applied to your account!`, { duration: 4000 });
  };

  const userInitials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'US';

  const filteredServices = CURATED_SERVICES.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
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
          <button className="nav-item location-btn" onClick={() => toggleMenu('location')}>
            <MapPin size={18} className="text-gradient" />
            <span>Patna, Bihar</span>
          </button>
        </div>

        <div className="nav-right">
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
                    <span>Role:</span>
                    <span className="text-gradient font-semibold capitalize">{session?.user?.role || 'client'}</span>
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

      {/* CONTAINER */}
      <div className="client-container">
        {/* HERO & SEARCH BAR */}
        <div className="client-hero">
          <div>
            <h1 className="client-welcome-title">
              Welcome back, <span className="text-gradient">{session?.user?.name || 'Friend'}</span>! 👋
            </h1>
            <p className="client-welcome-text">Find top-rated verified home service experts near you.</p>
          </div>

          <div className="client-search-box">
            <Search size={18} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              className="client-search-input"
              placeholder="Search for plumbing, AC repair, cleaning..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* FEATURE PERKS ROW */}
        <div className="client-perks-row">
          <div className="client-perk-pill">
            <Zap size={16} style={{ color: '#38bdf8' }} />
            <span>24/7 Priority Dispatch</span>
          </div>
          <div className="client-perk-pill">
            <ShieldCheck size={16} style={{ color: '#22c55e' }} />
            <span>Verified Local Pros</span>
          </div>
          <div className="client-perk-pill">
            <Sparkles size={16} style={{ color: '#a855f7' }} />
            <span>100% Quality Guaranteed</span>
          </div>
          <div className="client-perk-pill">
            <Clock size={16} style={{ color: '#f59e0b' }} />
            <span>Under 30-Min Emergency Arrival</span>
          </div>
        </div>

        {/* PROMOTIONAL ADS BANNERS SECTION */}
        <section className="client-ads-section">
          <div className="client-ads-grid">
            {/* Main Featured Banner */}
            <div className="client-main-ad">
              <span className="client-ad-tag">🔥 Featured Offer</span>
              <h2 className="client-ad-heading">Summer Special: Up to 30% OFF Home Deep Cleaning</h2>
              <p className="client-ad-desc">
                Book certified hygiene experts for your home or office. Use promo code <strong>SUMMER30</strong> at checkout.
              </p>
              <button className="client-ad-btn" onClick={() => handleClaimOffer('SUMMER30')}>
                {claimedPromo === 'SUMMER30' ? '✓ Promo Code Applied!' : 'Claim 30% Discount ↗'}
              </button>
            </div>

            {/* Side Advertisements */}
            <div className="client-side-ads">
              <div className="client-mini-ad">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    <Tag size={14} /> EXPRESS REPAIRS
                  </div>
                  <h3 className="client-mini-ad-title">Emergency Plumbing & Electrical</h3>
                  <p className="client-mini-ad-desc">Instant dispatch within 30 mins with zero cancellation fees.</p>
                </div>
                <a href="#services" className="client-mini-ad-link">
                  Browse Express Pros <ChevronRight size={14} />
                </a>
              </div>

              <div className="client-mini-ad" style={{ background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.8), rgba(15, 23, 42, 0.9))' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a855f7', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    <Gift size={14} /> REWARDS CLUB
                  </div>
                  <h3 className="client-mini-ad-title">CoopConnect Pass</h3>
                  <p className="client-mini-ad-desc">Get unlimited zero-fee bookings & priority slots for $9/mo.</p>
                </div>
                <button
                  onClick={() => toast.success('CoopConnect Pass membership coming soon!')}
                  style={{ background: 'none', border: 'none', padding: 0, color: '#c084fc', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  Join Pass Membership <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CURATED SERVICES GRID SECTION */}
        <section className="client-services-section" id="services">
          <div className="client-section-title-row">
            <div>
              <h2 className="client-section-h2">Curated Services Near You</h2>
              <p className="client-section-sub">Select a category or book a verified expert directly.</p>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Showing {filteredServices.length} popular services</span>
          </div>

          <div className="client-services-grid">
            {filteredServices.map((service) => (
              <div key={service.id} className="client-service-card" onClick={() => handleBookService(service)}>
                <div className="client-service-img-wrapper">
                  <img src={service.img} alt={service.name} className="client-service-img" />
                  <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(15, 23, 42, 0.85)', color: '#38bdf8', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {service.tag}
                  </span>
                </div>

                <div className="client-service-content">
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600, textTransform: 'uppercase' }}>{service.category}</span>
                    <h3 className="client-service-name">{service.name}</h3>
                  </div>

                  <div>
                    <div className="client-service-meta">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontWeight: 700 }}>
                        <Star size={14} fill="#f59e0b" /> {service.rating} <span style={{ color: '#64748b', fontWeight: 400 }}>({service.reviews})</span>
                      </span>
                      <span className="client-service-price">{service.price}</span>
                    </div>

                    <button className="client-book-btn">Book Service Instant ↗</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM PROMOTIONAL BANNER */}
        <div className="client-promo-banner">
          <div className="client-promo-info">
            <h3>Invite a Neighbor, Earn $20 Account Credit 🎁</h3>
            <p>Share your invite code with friends and family to unlock service discounts.</p>
          </div>
          <button
            onClick={() => toast.success('Your referral link copied to clipboard!')}
            style={{
              background: '#38bdf8',
              color: '#090d16',
              fontWeight: 700,
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Copy Invite Link
          </button>
        </div>
      </div>

      {/* BOOKING MODAL */}
      {selectedService && (
        <div className="modal-overlay">
          <div className="modal-box glass-panel" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <CheckCircle2 size={20} className="text-gradient" />
                <span>Book {selectedService.name}</span>
              </div>
              <button className="close-btn-modern" onClick={() => setSelectedService(null)}><X size={18} /></button>
            </div>

            <div className="modal-body" style={{ paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'center' }}>
                <img src={selectedService.img} alt="" style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover' }} />
                <div>
                  <h4 style={{ color: '#ffffff', fontWeight: 700, margin: 0 }}>{selectedService.name}</h4>
                  <span className="text-xs text-muted">{selectedService.category} · ⭐ {selectedService.rating}</span>
                  <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '1.1rem', marginTop: '0.2rem' }}>{selectedService.price}</div>
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.85rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#94a3b8' }}>Service Fee:</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{selectedService.price}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#94a3b8' }}>Est. Arrival:</span>
                  <span style={{ color: '#22c55e', fontWeight: 600 }}>Under 30 Mins</span>
                </div>
                {claimedPromo && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#38bdf8' }}>
                    <span>Promo ({claimedPromo}):</span>
                    <span>-30% Applied</span>
                  </div>
                )}
              </div>

              <button className="btn-gradient-full" onClick={handleConfirmBooking}>
                Confirm & Request Service ↗
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
