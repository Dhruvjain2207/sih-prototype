"use client";

import React, { useState, useEffect } from 'react';
import './login.css'; 

export default function Login() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slideshow Data
  const slides = [
    {
      id: 1,
      title: "Welcome Back",
      desc: "Sign in to access your dashboard and continue managing your services.",
      bgImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Manage Everything",
      desc: "Track your bookings, communicate with experts, and handle payments all in one place.",
      bgImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Secure & Reliable",
      desc: "Experience transparent pricing and on-time service delivery right at your doorstep.",
      bgImage: "https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=1000&auto=format&fit=crop"
    }
  ];

  useEffect(() => {
    // Trigger animations on mount
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Slide change interval
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); 
    return () => clearInterval(timer);
  }, [slides.length]);

  const togglePassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <>
      <main className="main-container">
        
        {/* Left Side: Login Form */}
        <section className={`left-panel ${isLoaded ? 'loaded' : ''}`}>
          <div className="form-container">
            
            <div className="form-app-icon">
              ✦
            </div>

            <div className="form-header">
              <h1>Welcome Back</h1>
              <p>Please sign in to your EasyService account.</p>
            </div>

            <div className="social-buttons-container">
              <button type="button" className="btn-social">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
              
              <button type="button" className="btn-social">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                Sign in with GitHub
              </button>
            </div>

            <div className="divider">OR</div>

            <form>
              <div className="input-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <input type="email" placeholder="you@example.com" required />
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password" 
                    required 
                  />
                  <button onClick={togglePassword} className="show-password">
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="login-options">
                <label className="remember-me">
                  <input type="checkbox" /> Remember me
                </label>
                <a href="/forgot-password" className="forgot-password">Forgot password?</a>
              </div>

              <button type="submit" className="btn-submit">
                Sign In
              </button>
            </form>

            <div className="login-link">
              Don't have an account? <a href="/register">Sign up</a>
            </div>
            
          </div>
        </section>

        {/* Right Side: Slideshow */}
        <section className={`right-panel ${isLoaded ? 'loaded' : ''}`}>
          <div className="slideshow-container">
            {slides.map((slide, index) => (
              <div 
                key={slide.id} 
                className={`slide ${currentSlide === index ? 'active' : ''}`}
              >
                <div 
                  className="slide-image-box" 
                  style={{ backgroundImage: `url(${slide.bgImage})` }}
                ></div>
                
                <div className="slide-text-box">
                  <h2>{slide.title}</h2>
                  <p>{slide.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        
      </main>

      <footer className="site-footer">
        <div className="footer-grid">
          <div className="footer-section">
            <h3>EasyService Navigation</h3>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="/register">Register</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Contact Us</h3>
            <ul>
              <li><a href="mailto:contact@easyservice.com">Email: contact@easyservice.com</a></li>
              <li><a href="tel:+919876543210">Contact: +91 98765 43210</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Find Us</h3>
            <ul>
              <li><span style={{color: '#888'}}>Address: 123 Service Lane, Metro City, 400001</span></li>
              <li><a href="#">Instagram: @EasyService_Official</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} EasyService. All rights reserved.
        </div>
      </footer>
    </>
  );
}
