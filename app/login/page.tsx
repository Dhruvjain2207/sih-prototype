"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import styles from './login.module.css'; 

export default function Login() {
  const router = useRouter();
  const { status } = useSession();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  // Slideshow Data
  const slides = [
    {
      id: 1,
      title: "CoopConnect Services",
      desc: "Instant single-click Google authentication for both Customers and Local Service Experts.",
      bgImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Real-time Bidding & Quoting",
      desc: "Freelancers inspect tasks, quote custom prices, and chat live with clients.",
      bgImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Secure Razorpay & Cash Payments",
      desc: "Flexible payment choices with instant audio ring alerts for new requests.",
      bgImage: "https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=1000&auto=format&fit=crop"
    }
  ];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); 
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <>
      <main className={styles['main-container']}>
        {/* Left Side: Single-Click Google Authentication */}
        <section className={`${styles['left-panel']} ${isLoaded ? styles.loaded : ''}`}>
          <div className={styles['form-container']}>
            
            <div className={styles['form-app-icon']}>
              ⚡
            </div>

            <div className={styles['form-header']}>
              <h1>Welcome to CoopConnect</h1>
              <p>Select your portal role below to sign in with Google.</p>
            </div>

            {/* Distinct Google Sign In Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1.5rem 0' }}>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem("requestedRole", "client");
                  }
                  signIn("google", { callbackUrl: "/dashboard" });
                }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(168, 85, 247, 0.32))',
                  border: '1px solid rgba(129, 140, 248, 0.5)',
                  color: '#ffffff',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 800,
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.25)',
                  transition: 'all 0.15s ease',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                👤 Sign In as Customer via Google ↗
              </button>

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem("requestedRole", "freelancer");
                  }
                  signIn("google", { callbackUrl: "/onboarding?role=freelancer" });
                }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.18), rgba(37, 99, 235, 0.28))',
                  border: '1px solid rgba(56, 189, 248, 0.5)',
                  color: '#ffffff',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 800,
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(56, 189, 248, 0.25)',
                  transition: 'all 0.15s ease',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                🛠️ Sign In as Freelancer via Google ↗
              </button>
            </div>

            <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '12px', padding: '0.85rem', textAlign: 'center', fontSize: '0.82rem', color: '#94a3b8' }}>
              💡 <strong style={{ color: '#ffffff' }}>Freelancers:</strong> Signing in via Google will open your profile setup form to select your work specializations!
            </div>
            
          </div>
        </section>

        {/* Right Side: Slideshow */}
        <section className={`${styles['right-panel']} ${isLoaded ? styles.loaded : ''}`}>
          <div className={styles['slideshow-container']}>
            {slides.map((slide, index) => (
              <div 
                key={slide.id} 
                className={`${styles.slide} ${currentSlide === index ? styles.active : ''}`}
              >
                <div 
                  className={styles['slide-image-box']} 
                  style={{ backgroundImage: `url(${slide.bgImage})` }}
                ></div>
                
                <div className={styles['slide-text-box']}>
                  <h2>{slide.title}</h2>
                  <p>{slide.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        
      </main>

      <footer className={styles['site-footer']}>
        <div className={styles['footer-grid']}>
          <div className={styles['footer-section']}>
            <h3>CoopConnect Navigation</h3>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#contact">Contact Us</a></li>
            </ul>
          </div>

          <div className={styles['footer-section']}>
            <h3>Contact Support</h3>
            <ul>
              <li><a href="mailto:support@coopconnect.com">Email: support@coopconnect.com</a></li>
              <li><a href="tel:+919876543210">Contact: +91 98765 43210</a></li>
            </ul>
          </div>

          <div className={styles['footer-section']}>
            <h3>Find Us</h3>
            <ul>
              <li><span style={{color: '#888'}}>Patna, Bihar 800001</span></li>
            </ul>
          </div>
        </div>
        <div className={styles['footer-bottom']}>
          &copy; {new Date().getFullYear()} CoopConnect. All rights reserved.
        </div>
      </footer>
    </>
  );
}
