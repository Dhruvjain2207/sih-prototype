"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import styles from './register.module.css';

export default function Register() {
  const router = useRouter();
  const { status } = useSession();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Flow State: 'register' -> 'otp'
  const [step, setStep] = useState<'register' | 'otp'>('register');

  // Form State
  const [role, setRole] = useState<'client' | 'freelancer'>('client');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

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

  const toggleSkill = (domain: string) => {
    setSelectedSkills((prev) =>
      prev.includes(domain) ? prev.filter((s) => s !== domain) : [...prev, domain]
    );
  };

  // OTP State (6 Digits)
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Slideshow Data
  const slides = [
    {
      id: 1,
      title: "Welcome to EasyService",
      desc: "Join our platform and connect with verified home service professionals instantly.",
      bgImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Secure & Reliable",
      desc: "Experience transparent pricing and on-time service delivery right at your doorstep.",
      bgImage: "https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Manage Everything",
      desc: "Track your bookings, communicate with experts, and handle payments all in one place.",
      bgImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop"
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

  // Handle Resend Cooldown Countdown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const togglePassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  // STEP 1: Handle User Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading("Initiating registration...");

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: username,
          email,
          password: password || undefined,
          role,
          phone: role === 'freelancer' ? phone : undefined,
          skills: role === 'freelancer' ? selectedSkills : undefined,
          bio: role === 'freelancer' ? bio : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(
          data.message || "A 6-digit OTP code has been sent to your email!",
          { id: toastId, duration: 4000 }
        );
        if (data.devOtp) {
          console.log(`[DEV OTP HINT] Your OTP code is: ${data.devOtp}`);
        }
        setStep('otp');
        setResendCooldown(30); // 30-second cooldown for resend button
      } else {
        toast.error(data.error || "Registration failed", { id: toastId });
      }
    } catch {
      toast.error("Network error connecting to server", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Handle Single Digit OTP Input Changes
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Paste handling
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otpValues];
      digits.forEach((digit, idx) => {
        newOtp[idx] = digit;
      });
      setOtpValues(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newOtp = [...otpValues];
    newOtp[index] = digit;
    setOtpValues(newOtp);

    // Auto-focus next input box
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // STEP 2: Handle OTP Verification Submit
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpValues.join('');

    if (fullOtp.length < 6) {
      toast.error("Please enter the complete 6-digit OTP code");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Verifying OTP code...");

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: fullOtp }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Email verified successfully! Redirecting to login...", {
          id: toastId,
          duration: 3000,
        });
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        toast.error(data.error || "Invalid or expired OTP code", { id: toastId });
      }
    } catch {
      toast.error("Network error verifying OTP", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Handle Resend OTP Code
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    const toastId = toast.loading("Sending a new OTP code...");

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || "New OTP code sent to your email!", { id: toastId });
        setOtpValues(Array(6).fill(''));
        setResendCooldown(30);
        if (data.devOtp) {
          console.log(`[DEV OTP HINT] New OTP code is: ${data.devOtp}`);
        }
      } else {
        toast.error(data.error || "Failed to resend OTP", { id: toastId });
      }
    } catch {
      toast.error("Network error resending OTP", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className={styles['main-container']}>
        {/* Left Side: Form Panel */}
        <section className={`${styles['left-panel']} ${isLoaded ? styles.loaded : ''}`}>
          <div className={styles['form-card']} style={{ width: '100%', maxWidth: '400px' }}>
            
            {/* STEP 1: REGISTER FORM */}
            {step === 'register' && (
              <>
                <div className={styles['form-header']}>
                  <h1>Create Account</h1>
                  <p>Join EasyService and connect with verified service experts.</p>
                </div>

                <div className={styles['role-selector']}>
                  <div
                    className={`${styles['role-card']} ${role === 'client' ? styles.active : ''}`}
                    onClick={() => setRole('client')}
                  >
                    <span className={styles['role-icon']}>👤</span>
                    <span className={styles['role-title']}>Client</span>
                    <span className={styles['role-subtitle']}>Hire Professionals</span>
                  </div>
                  <div
                    className={`${styles['role-card']} ${role === 'freelancer' ? styles.active : ''}`}
                    onClick={() => setRole('freelancer')}
                  >
                    <span className={styles['role-icon']}>🛠️</span>
                    <span className={styles['role-title']}>Freelancer</span>
                    <span className={styles['role-subtitle']}>Offer Services</span>
                  </div>
                </div>

                <form onSubmit={handleRegisterSubmit}>
                  <div className={styles['input-group']}>
                    <label>Name / Username</label>
                    <div className={styles['input-wrapper']}>
                      <input
                        type="text"
                        placeholder="e.g. johndoe123"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles['input-group']}>
                    <label>Email Address</label>
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
                      />
                      <button type="button" onClick={togglePassword} className={styles['show-password']}>
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  {role === 'freelancer' && (
                    <>
                      <div className={styles['input-group']}>
                        <label>Phone Number</label>
                        <div className={styles['input-wrapper']}>
                          <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className={styles['input-group']}>
                        <label>Select Your Work Domains (Select all that apply) *</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.4rem' }}>
                          {DOMAIN_OPTIONS.map((domain) => {
                            const isSelected = selectedSkills.includes(domain);
                            return (
                              <button
                                key={domain}
                                type="button"
                                onClick={() => toggleSkill(domain)}
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
                        {selectedSkills.length === 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.4rem' }}>
                            ⚠️ Please select at least one work domain to receive customer requests.
                          </div>
                        )}
                      </div>

                      <div className={styles['input-group']}>
                        <label>Short Bio / Tagline</label>
                        <div className={styles['input-wrapper']}>
                          <input
                            type="text"
                            placeholder="e.g. Certified electrician with 5+ yrs experience"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <button type="submit" className={styles['btn-submit']} disabled={loading}>
                    {loading ? 'Processing...' : `Register as ${role === 'freelancer' ? 'Freelancer' : 'Client'} & Get OTP`}
                  </button>

                  {role === 'client' && (
                    <>
                      <div className={styles.divider}>OR</div>

                      <button
                        type="button"
                        className={styles['btn-google']}
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Sign up with Google
                      </button>
                    </>
                  )}
                </form>

                <div className={styles['login-link']}>
                  Already have an account? <a href="/login">Login</a>
                </div>
              </>
            )}

            {/* STEP 2: OTP VERIFICATION FORM */}
            {step === 'otp' && (
              <>
                <div className={styles['form-header']}>
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔐</div>
                  <h1>Verify Email OTP</h1>
                  <p style={{ marginTop: '6px' }}>
                    We sent a 6-digit verification code to: <br />
                    <strong style={{ color: '#5e43f3' }}>{email}</strong>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtpSubmit}>
                  {/* 6 Digit Code Inputs */}
                  <div style={{ display: 'flex', gap: 'clamp(4px, 1.5vw, 8px)', justifyContent: 'center', marginBottom: '20px', width: '100%' }}>
                    {otpValues.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpInputRefs.current[idx] = el; }}
                        type="text"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        style={{
                          width: 'clamp(36px, 11vw, 48px)',
                          height: 'clamp(44px, 13vw, 54px)',
                          textAlign: 'center',
                          fontSize: 'clamp(16px, 4.5vw, 20px)',
                          fontWeight: 'bold',
                          backgroundColor: '#050505',
                          border: '1px solid #333',
                          borderRadius: '8px',
                          color: '#ffffff',
                          outline: 'none',
                          padding: 0,
                        }}
                      />
                    ))}
                  </div>

                  <button type="submit" className={styles['btn-submit']} disabled={loading}>
                    {loading ? 'Verifying OTP...' : 'Verify OTP & Activate Account'}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || loading}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: resendCooldown > 0 ? '#666' : '#5e43f3',
                        cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP Code'}
                    </button>
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setStep('register')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        fontSize: '13px',
                        textDecoration: 'underline',
                      }}
                    >
                      ← Change Email / Back to Register
                    </button>
                  </div>
                </form>
              </>
            )}

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

      {/* Footer */}
      <footer className={styles['site-footer']}>
        <div className={styles['footer-grid']}>
          <div className={styles['footer-section']}>
            <h3>EasyService Navigation</h3>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="/login">Login</a></li>
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
