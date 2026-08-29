"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import styles from './login.module.css'; 

export default function Login() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); 
    return () => clearInterval(timer);
  }, [slides.length]);

  const togglePassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Authenticating...");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error(res.error || "Invalid credentials. Please try again.", { id: toastId });
      } else {
        toast.success("Welcome back! Redirecting to dashboard...", { id: toastId, duration: 3000 });
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1000);
      }
    } catch {
      toast.error("An unexpected error occurred during login.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className={styles['main-container']}>
        
        {/* Left Side: Login Form */}
        <section className={`${styles['left-panel']} ${isLoaded ? styles.loaded : ''}`}>
          <div className={styles['form-container']}>
            
            <div className={styles['form-app-icon']}>
              ✦
            </div>

            <div className={styles['form-header']}>
              <h1>Welcome Back</h1>
              <p>Please sign in to your EasyService account.</p>
            </div>

            <div className={styles['social-buttons-container']}>
              <button
                type="button"
                className={styles['btn-social']}
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            </div>

            <div className={styles.divider}>OR</div>

            <form onSubmit={handleSubmit}>
              <div className={styles['input-group']}>
                <label>Email</label>
                <div className={styles['input-wrapper']}>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles['input-group']}>
                <label>Password</label>
                <div className={styles['input-wrapper']}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <button type="button" onClick={togglePassword} className={styles['show-password']}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className={styles['login-options']}>
                <label className={styles['remember-me']}>
                  <input type="checkbox" /> Remember me
                </label>
              </div>

              <button type="submit" className={styles['btn-submit']} disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className={styles['login-link']}>
              Don't have an account? <a href="/register">Sign up</a>
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
            <h3>EasyService Navigation</h3>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="/register">Register</a></li>
            </ul>
          </div>

          <div className={styles['footer-section']}>
            <h3>Contact Us</h3>
            <ul>
              <li><a href="mailto:contact@easyservice.com">Email: contact@easyservice.com</a></li>
              <li><a href="tel:+919876543210">Contact: +91 98765 43210</a></li>
            </ul>
          </div>

          <div className={styles['footer-section']}>
            <h3>Find Us</h3>
            <ul>
              <li><span style={{color: '#888'}}>Address: 123 Service Lane, Metro City, 400001</span></li>
              <li><a href="#">Instagram: @EasyService_Official</a></li>
            </ul>
          </div>
        </div>
        <div className={styles['footer-bottom']}>
          &copy; {new Date().getFullYear()} EasyService. All rights reserved.
        </div>
      </footer>
    </>
  );
}
