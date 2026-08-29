'use client';
import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FreelancerDashboard from './FreelancerDashboard';
import ClientDashboard from './ClientDashboard';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard');
    }
  }, [status, router]);

  // Session loading recovery timeout
  useEffect(() => {
    if (status === 'loading') {
      const timer = setTimeout(() => {
        router.refresh();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  if (status === 'loading' || status === 'unauthenticated') {
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
            {status === 'unauthenticated' ? 'Redirecting to login...' : 'Loading your session...'}
          </span>
        </div>
      </div>
    );
  }

  if (session?.user?.role === 'freelancer') {
    return <FreelancerDashboard session={session} />;
  }

  return <ClientDashboard session={session} />;
}
