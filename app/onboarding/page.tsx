"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { User, Wrench, Phone, MapPin, FileText, Zap, ArrowRight, Check } from 'lucide-react';

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

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const paramRole = searchParams.get('role');
  const [role, setRole] = useState<'client' | 'freelancer'>(
    paramRole === 'freelancer' ? 'freelancer' : 'freelancer'
  );
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('Patna');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.name && !name) {
      setName(session.user.name);
    }
  }, [status, session, router, name]);

  const handleToggleDomain = (domain: string) => {
    setSkills((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !name.trim()) {
      toast.error('Please enter your full name.');
      return;
    }

    if (!phone || !phone.trim()) {
      toast.error('Please enter a valid contact phone number.');
      return;
    }

    if (role === 'freelancer' && skills.length === 0) {
      toast.error('Please select at least one work domain / skill specialization!');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Saving your profile...');

    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          role,
          phone,
          skills: role === 'freelancer' ? skills : [],
          bio,
          city,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Profile setup complete! Welcome to CoopConnect 🎉', { id: toastId, duration: 4000 });
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 800);
      } else {
        toast.error(data.error || 'Failed to complete profile setup', { id: toastId });
      }
    } catch {
      toast.error('Network error during onboarding setup', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div style={{ background: '#090d16', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>Loading your session...</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#090d16', minHeight: '100vh', padding: '2rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
      <div style={{ maxWidth: '660px', width: '100%', background: '#0b1329', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '24px', padding: '2.25rem', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Wrench size={28} />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 900, margin: 0 }}>
            Freelancer Profile Setup
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '0.4rem' }}>
            Please fill in your details and select your work domains to start receiving customer service requests.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* FULL NAME & PHONE */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', display: 'block', marginBottom: '0.4rem' }}>
                Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: '#030712',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '10px',
                  padding: '0.75rem 0.95rem',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontWeight: 600,
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', display: 'block', marginBottom: '0.4rem' }}>
                Phone Number *
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: '#030712',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '10px',
                  padding: '0.75rem 0.95rem',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontWeight: 600,
                }}
              />
            </div>
          </div>

          {/* MULTI-DOMAIN SKILLS SELECTION */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <Wrench size={16} /> Select Your Work Domains / Specializations *
            </label>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 0.85rem' }}>
              You can select multiple domains (e.g. Electrician + Plumbing). You will receive booking requests for all selected categories!
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {DOMAIN_OPTIONS.map((domain) => {
                const isSelected = skills.includes(domain);
                return (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => handleToggleDomain(domain)}
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(37, 99, 235, 0.35))'
                        : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)'}`,
                      color: isSelected ? '#ffffff' : '#cbd5e1',
                      padding: '0.55rem 0.95rem',
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
            {skills.length > 0 && (
              <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: '0.75rem', fontWeight: 700 }}>
                Selected ({skills.length}): {skills.join(', ')}
              </div>
            )}
          </div>

          {/* BIO / AREA OF INTEREST */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '0.4rem' }}>
              Bio & Area of Interest / Experience Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe your work experience, specialized tools, or area of interest..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{
                width: '100%',
                background: '#030712',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '12px',
                padding: '0.75rem 0.95rem',
                color: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          {/* CITY LOCATION */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '0.4rem' }}>
              City / Operating Location *
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              style={{
                width: '100%',
                background: '#030712',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '10px',
                padding: '0.7rem 0.95rem',
                color: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
          </div>

          {/* SUBMIT CTA */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              border: 'none',
              color: '#ffffff',
              padding: '1rem',
              borderRadius: '14px',
              fontWeight: 900,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(2, 132, 199, 0.4)',
              opacity: submitting ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {submitting ? 'Saving Profile & Entering Portal...' : 'Complete Profile Setup & Open Dashboard ↗'}
          </button>
        </form>

      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#090d16', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        Loading setup form...
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
