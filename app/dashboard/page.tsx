'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        borderBottom: '1px solid #eee',
        paddingBottom: '20px'
      }}>
        <h1>Dashboard</h1>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ 
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Welcome, {session.user.name || session.user.email}!</h2>
        <div style={{ marginTop: '15px' }}>
          <p><strong>Email:</strong> {session.user.email}</p>
          <p><strong>Role:</strong> {session.user.role}</p>
          <p><strong>User ID:</strong> {session.user.id}</p>
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'white',
        padding: '20px',
        border: '1px solid #dee2e6',
        borderRadius: '8px'
      }}>
        <h3>Dashboard Content</h3>
        <p>This is your protected dashboard area. You can add your application content here.</p>
        
        {/* Contoh button untuk test API */}
        <button
          onClick={async () => {
            try {
              const response = await fetch('/api/data');
              const data = await response.json();
              console.log('API Response:', data);
              alert('Check console for API response');
            } catch (error) {
              console.error('API Error:', error);
              alert('API Error - check console');
            }
          }}
          style={{
            marginTop: '15px',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test API Call
        </button>
      </div>
    </div>
  );
}