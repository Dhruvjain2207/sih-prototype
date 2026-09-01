'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FreelancerDashboard from './FreelancerDashboard';
import ClientDashboard from './ClientDashboard';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard');
      return;
    }

    if (status === 'authenticated') {
      fetchUserProfile();
    }
  }, [status, router]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      if (data.success && data.user) {
        setUserProfile(data.user);

        const reqRole = typeof window !== 'undefined' ? localStorage.getItem('requestedRole') : null;

        // If user requested freelancer login OR is registered as freelancer in MongoDB
        if (reqRole === 'freelancer' || data.user.role === 'freelancer') {
          const isProfileComplete = Array.isArray(data.user.skills) && data.user.skills.length > 0 && !!data.user.phone;

          if (!isProfileComplete) {
            // FIRST TIME ONLY: Send to onboarding to select skills & phone
            router.push('/onboarding?role=freelancer');
            return;
          } else {
            // RETURNING FREELANCER: Profile is complete! Clear requestedRole flag
            if (typeof window !== 'undefined') {
              localStorage.removeItem('requestedRole');
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching live profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  if (status === 'loading' || status === 'unauthenticated' || loadingProfile) {
    return (
      <div
        className="dashboard-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#090d16',
          color: '#ffffff',
        }}
      >
        <div className="broadcasting-box glass-panel" style={{ padding: '2.5rem 4rem' }}>
          <div className="spinner-modern"></div>
          <span className="broadcasting-text">
            {status === 'unauthenticated' ? 'Redirecting to login...' : 'Loading your workspace...'}
          </span>
        </div>
      </div>
    );
  }

  const requestedRole = typeof window !== 'undefined' ? localStorage.getItem('requestedRole') : null;
  const isFreelancer = userProfile?.role === 'freelancer' || requestedRole === 'freelancer';

  if (isFreelancer) {
    return <FreelancerDashboard session={session} />;
  }

  return <ClientDashboard session={session} />;
}
