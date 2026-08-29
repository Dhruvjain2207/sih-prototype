'use client'
import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  User,
  Settings,
  Phone,
  Map,
  Crosshair,
  LogOut,
  Palette,
  X,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Heart,
} from 'lucide-react';
import './dashboard.css';

// Mock Data
const SERVICE_CATEGORIES = [
  {
    category: 'Home Maintenance',
    services: [
      { id: 1, name: 'Plumbing', img: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=400&q=80' },
      { id: 2, name: 'Electrical', img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80' },
      { id: 3, name: 'Carpentry', img: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=400&q=80' },
      { id: 4, name: 'Painting', img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80' },
      { id: 11, name: 'Roofing', img: 'https://images.unsplash.com/photo-1632154939229-231a44c77609?auto=format&fit=crop&w=400&q=80' }
    ]
  },
  {
    category: 'Cleaning & Hygiene',
    services: [
      { id: 5, name: 'Deep Cleaning', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80' },
      { id: 6, name: 'Pest Control', img: 'https://images.unsplash.com/photo-1584285429813-f4bba7e4be65?auto=format&fit=crop&w=400&q=80' },
      { id: 7, name: 'Sofa Cleaning', img: 'https://images.unsplash.com/photo-1512821217036-7c9135a589dc?auto=format&fit=crop&w=400&q=80' },
      { id: 12, name: 'Car Wash', img: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=400&q=80' }
    ]
  },
  {
    category: 'Appliance Repair',
    services: [
      { id: 8, name: 'AC Service', img: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=400&q=80' },
      { id: 9, name: 'Washing Machine', img: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?auto=format&fit=crop&w=400&q=80' },
      { id: 10, name: 'Refrigerator', img: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=400&q=80' },
      { id: 13, name: 'Microwave', img: 'https://images.unsplash.com/photo-1585659722983-3a6750f2fd82?auto=format&fit=crop&w=400&q=80' }
    ]
  }
];

const PREV_LOCATIONS = ['Patna, Bihar', '123 Main St, Apt 4B', 'Work: 456 Tech Park'];
const ORDER_HISTORY = [
  { id: '#1024', service: 'Plumbing', date: '2026-08-20', status: 'Completed', price: '$45' },
  { id: '#1025', service: 'Electrical', date: '2026-08-25', status: 'In Progress', price: '$80' },
];

const FAVORITE_PROS = [
  { id: 101, name: 'John Doe', skill: 'Plumbing', rating: '4.9', initials: 'JD', color: 'var(--accent-blue)' },
  { id: 102, name: 'Sarah Smith', skill: 'Deep Cleaning', rating: '5.0', initials: 'SS', color: 'var(--accent-purple)' },
  { id: 103, name: 'Mike Repairer', skill: 'AC Service', rating: '4.8', initials: 'MR', color: 'var(--accent-cyan)' }
];

export default function Dashboard() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  
  // States for Modals
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedFavPro, setSelectedFavPro] = useState<any>(null);
  
  // Tracking States
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [trackingPro, setTrackingPro] = useState<boolean>(false);

  const toggleMenu = (menu: string) => setActiveMenu(activeMenu === menu ? null : menu);

  const handleHireSelect = (type: string) => {
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      setSelectedService(null);
      setSelectedFavPro(null);
      setTrackingPro(true);
    }, 2500);
  };

  const openFavProModal = (pro: any) => {
    setActiveMenu(null); 
    setSelectedFavPro(pro);
  };

  // Logic to handle slider button clicks
  const handleScroll = (id: string, direction: 'left' | 'right') => {
    const container = document.getElementById(id);
    if (container) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="dashboard-container">
      {/* NAVIGATION BAR */}
      <nav className="navbar glass-panel">
        <div className="nav-left">
          <div className="brand">
            <div className="brand-logo">⚡</div>
            <span>CoopConnect</span>
          </div>
          <div className="nav-divider"></div>
          <button className="nav-item location-btn" onClick={() => toggleMenu('location')}>
            <MapPin size={18} className="text-gradient" />
            <span>Current Location</span>
          </button>
          
          {activeMenu === 'location' && (
            <div className="dropdown-menu location-menu glass-panel">
              <div className="menu-header">Saved Locations</div>
              <ul>{PREV_LOCATIONS.map((loc, i) => <li key={i}>{loc}</li>)}</ul>
              <div className="menu-divider"></div>
              <button className="action-btn"><Crosshair size={14} /> Set Manually</button>
              <button className="action-btn"><Map size={14} /> Choose on Maps</button>
            </div>
          )}
        </div>

        <div className="nav-right">
          
          {/* Favorites List */}
          <div className="nav-icon-container">
            <button className={`nav-icon ${activeMenu === 'favorites' ? 'active' : ''}`} onClick={() => toggleMenu('favorites')}>
              <Heart size={20} className={activeMenu === 'favorites' ? 'text-danger' : ''} />
            </button>
            {activeMenu === 'favorites' && (
              <div className="dropdown-menu glass-panel">
                <div className="menu-header">Favorite Professionals</div>
                <div className="favorites-list">
                  {FAVORITE_PROS.map(pro => (
                    <div key={pro.id} className="favorite-item" onClick={() => openFavProModal(pro)}>
                      <div className="fav-avatar" style={{ backgroundColor: pro.color }}>{pro.initials}</div>
                      <div className="fav-info">
                        <span className="fav-name">{pro.name}</span>
                        <span className="fav-skill">{pro.skill} • ⭐ {pro.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order History */}
          <div className="nav-icon-container">
            <button className={`nav-icon ${activeMenu === 'history' ? 'active' : ''}`} onClick={() => toggleMenu('history')}>
              <Clock size={20} />
            </button>
            {activeMenu === 'history' && (
              <div className="dropdown-menu history-menu glass-panel">
                <div className="menu-header">Order History</div>
                {ORDER_HISTORY.map(order => (
                  <div key={order.id} className="history-item">
                    <div className="history-info">
                      <span className="history-id">{order.id}</span>
                      <span className="history-service">{order.service}</span>
                      <span className="text-muted text-xs">{order.date}</span>
                    </div>
                    <span className={`badge ${order.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{order.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="nav-icon-container">
            <button className={`nav-icon ${activeMenu === 'profile' ? 'active' : ''}`} onClick={() => toggleMenu('profile')}>
              <User size={20} />
            </button>
            {activeMenu === 'profile' && (
              <div className="dropdown-menu profile-menu glass-panel">
                <div className="profile-header">
                  <div className="avatar-gradient">JD</div>
                  <div className="profile-titles">
                    <span className="profile-name">John Doe</span>
                    <span className="text-muted text-xs">Patna, Bihar</span>
                  </div>
                </div>
                <div className="menu-divider"></div>
                <div className="profile-details">
                  <div className="detail-row"><span>Account:</span> <span className="text-gradient font-semibold">Premium</span></div>
                  <div className="detail-row"><span>Password:</span> ******** <button className="text-btn">Edit</button></div>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="nav-icon-container">
            <button className={`nav-icon ${activeMenu === 'settings' ? 'active' : ''}`} onClick={() => toggleMenu('settings')}>
              <Settings size={20} />
            </button>
            {activeMenu === 'settings' && (
              <div className="dropdown-menu settings-menu glass-panel">
                <button className="action-btn"><Palette size={14} /> Change Theme</button>
                <div className="menu-divider"></div>
                <button className="action-btn danger-btn"><LogOut size={14} /> Log Out</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <section className="services-section panel-modern full-width">
          <div className="section-header">
            <div>
              <h2 className="section-title">Explore Services</h2>
              <p className="section-subtitle">Find local experts near you instantly.</p>
            </div>
          </div>
          
          <div className="categories-wrapper">
            {SERVICE_CATEGORIES.map((cat, idx) => {
              const scrollId = `scroll-${idx}`;
              
              return (
                <div key={idx} className="category-row">
                  <div className="category-header">
                    <h3>{cat.category}</h3>
                    <button className="view-all-btn">View All <ChevronRight size={16} /></button>
                  </div>
                  
                  {/* Added scroll wrapper and buttons here */}
                  <div className="scroll-wrapper">
                    <button 
                      className="slider-btn left" 
                      onClick={() => handleScroll(scrollId, 'left')}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    <div id={scrollId} className="horizontal-scroll-container">
                      {cat.services.map((service) => (
                        <div 
                          key={service.id}
                          className="service-card"
                          onMouseEnter={() => setHoveredCard(service.id)}
                          onMouseLeave={() => setHoveredCard(null)}
                          onClick={() => setSelectedService(service)}
                          style={{
                            transform: hoveredCard === service.id ? 'scale(1.05)' : 'scale(1)',
                          }}
                        >
                          <img src={service.img} alt={service.name} />
                          <div className="card-overlay glass-panel-bottom">
                            <span>{service.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      className="slider-btn right" 
                      onClick={() => handleScroll(scrollId, 'right')}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-left">
          <a href="#">Terms & Conditions</a>
          <span className="divider-dot">•</span>
          <a href="#">Contact</a>
        </div>
        <div className="footer-right">
          <span>contact@coopconnect.com</span>
          <span className="divider-dot">•</span>
          <span>IG: @coopconnect</span>
        </div>
      </footer>

      {/* ----------------- POPUPS & MODALS ----------------- */}

      {/* 1. Generic Service Booking Popup */}
      {selectedService && !isBroadcasting && (
        <div className="modal-overlay">
          <div className="modal-box glass-panel">
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <div className="icon-wrapper"><CheckCircle size={18} className="text-gradient" /></div>
                <span>{selectedService.name} Request</span>
              </div>
              <button className="close-btn-modern" onClick={() => setSelectedService(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p className="text-muted text-sm mb-4">Select the priority for your service request:</p>
              
              <div className="service-options">
                <div className="option-card" onClick={() => handleHireSelect('normal')}>
                  <div className="option-info">
                    <span className="option-title">Normal Service</span>
                    <span className="option-desc">Standard response time (2-4 hrs)</span>
                  </div>
                  <div className="option-price">$45.00</div>
                </div>
                
                <div className="option-card express" onClick={() => handleHireSelect('express')}>
                  <div className="option-info">
                    <span className="option-title text-gradient">Express Service</span>
                    <span className="option-desc">Priority response (Under 30 mins)</span>
                  </div>
                  <div className="option-price">$80.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Favorite Professional Direct Hire Popup */}
      {selectedFavPro && !isBroadcasting && (
        <div className="modal-overlay">
          <div className="modal-box glass-panel">
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <div className="fav-avatar" style={{ backgroundColor: selectedFavPro.color, width: '36px', height: '36px' }}>
                  {selectedFavPro.initials}
                </div>
                <span>Hire {selectedFavPro.name}</span>
              </div>
              <button className="close-btn-modern" onClick={() => setSelectedFavPro(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p className="text-muted text-sm mb-4">Select priority to hire for <strong>{selectedFavPro.skill}</strong>:</p>
              
              <div className="service-options">
                <div className="option-card" onClick={() => handleHireSelect('normal')}>
                  <div className="option-info">
                    <span className="option-title">Normal Booking</span>
                    <span className="option-desc">Schedule based on pro's availability</span>
                  </div>
                  <div className="option-price">$50.00</div>
                </div>
                
                <div className="option-card express" onClick={() => handleHireSelect('express')}>
                  <div className="option-info">
                    <span className="option-title text-gradient">Emergency Booking</span>
                    <span className="option-desc">Immediate dispatch request</span>
                  </div>
                  <div className="option-price">$90.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcasting Loading Screen */}
      {isBroadcasting && (
        <div className="modal-overlay">
          <div className="broadcasting-box glass-panel">
            <div className="spinner-modern"></div>
            <span className="broadcasting-text">Processing your request...</span>
          </div>
        </div>
      )}

      {/* Success Tracking Tab */}
      {trackingPro && (
        <div className="tracking-window glass-panel">
          <div className="tracking-header">
            <div className="tracking-title">
              <CheckCircle size={16} color="#10b981" />
              <span>Task Accepted</span>
            </div>
            <button className="close-btn-modern" onClick={() => setTrackingPro(false)}><X size={16} /></button>
          </div>
          <div className="tracking-body">
            <div className="pro-details-row">
              <div className="avatar-gradient">MR</div>
              <div className="pro-titles">
                <span className="pro-name">Mike Repairer</span>
                <span className="text-muted text-xs">⭐ 4.9 (120 jobs)</span>
              </div>
            </div>
            <div className="tracking-map">
              <MapPin size={24} className="pin-animate text-gradient" />
              <span>2.5 km away (Arriving in 10 mins)</span>
            </div>
            <button className="btn-gradient-full"><Phone size={14} /> +91 98765 43210</button>
          </div>
        </div>
      )}
    </div>
  );
}
